import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../../theme/theme';
import { formatDate } from '@/utils/date';

interface ProgramItem {
    id: string;
    title: string;
    scheduledDate?: string;
    dueDate?: string;
    description?: string;
    completed?: boolean;
}

interface MentorProgramListCardProps {
    item: ProgramItem;
    onPress: (item: ProgramItem) => void;
}

export const MentorProgramListCard: React.FC<MentorProgramListCardProps> = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, item.completed ? styles.completed : styles.pending]}>
                    <Text style={styles.badgeText}>{item.completed ? 'Completed' : 'Pending'}</Text>
                </View>
            </View>
            {item.scheduledDate && <Text style={styles.date}>Scheduled: {formatDate(item.scheduledDate)}</Text>}
            {item.dueDate && <Text style={styles.date}>Due: {formatDate(item.dueDate)}</Text>}
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <Text style={styles.editHint}>Tap to edit</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: lightTheme.colors.text,
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    completed: {
        backgroundColor: '#4CD964',
    },
    pending: {
        backgroundColor: '#FF9500',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    date: {
        color: '#666',
        fontSize: 14,
        marginBottom: 2,
    },
    desc: {
        color: lightTheme.colors.text,
        marginTop: 4,
    },
    editHint: {
        marginTop: 8,
        fontSize: 12,
        color: lightTheme.colors.primary,
        alignSelf: 'flex-end',
    },
});
