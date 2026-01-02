import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../../theme/theme';

interface StudentProgramCardProps {
    item: {
        id: string;
        title: string;
        description?: string;
        dueDate?: string;
        completed?: boolean;
    };
    onToggle: (id: string) => void;
}

export const StudentProgramCard: React.FC<StudentProgramCardProps> = ({ item, onToggle }) => {
    return (
        <View style={[styles.card, item.completed && styles.cardCompleted]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                {item.dueDate && <Text style={styles.itemDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>}
            </View>
            <TouchableOpacity
                style={[styles.checkbox, item.completed && { borderColor: '#4CD964' }]}
                onPress={() => onToggle(item.id)}
            >
                {item.completed && <View style={[styles.checked, { backgroundColor: '#4CD964' } ]} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardCompleted: {
        opacity: 0.6,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: lightTheme.colors.text,
    },
    itemDesc: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    itemDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: lightTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    checked: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: lightTheme.colors.primary,
    },
});
