import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TaskCategory } from '../../api/types';
import { t } from '../../utils/i18n';

interface Props {
    selectedCategory: TaskCategory;
    onSelectCategory: (category: TaskCategory) => void;
    counts: {
        today: number;
        upcoming: number;
        flexible: number;
        archived: number;
    };
}

export const TaskFilterTabs: React.FC<Props> = ({
    selectedCategory,
    onSelectCategory,
    counts,
}) => {
    const tabs: { key: TaskCategory; label: string; count: number }[] = [
        { key: 'today', label: t('task.categoryToday'), count: counts.today },
        { key: 'upcoming', label: t('task.categoryUpcoming'), count: counts.upcoming },
        { key: 'flexible', label: t('task.categoryFlexible'), count: counts.flexible },
        { key: 'archived', label: t('task.categoryArchived'), count: counts.archived },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, isActive && styles.activeTab]}
                        onPress={() => onSelectCategory(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                        {tab.count > 0 && (
                            <View style={[styles.badge, isActive && styles.activeBadge]}>
                                <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>
                                    {tab.count}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F1F4F9',
        borderRadius: 14,
        padding: 4,
        marginHorizontal: 16,
        marginVertical: 12,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#1E293B',
        fontWeight: '700',
    },
    badge: {
        marginLeft: 4,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
    },
    activeBadge: {
        backgroundColor: '#3B82F6',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },
    activeBadgeText: {
        color: '#FFFFFF',
    },
});
