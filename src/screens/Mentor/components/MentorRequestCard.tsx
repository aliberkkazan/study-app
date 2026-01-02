import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { lightTheme } from '../../../theme/theme';
import { format } from 'date-fns';

interface MentorRequestCardProps {
    item: {
        id: string;
        student: { name: string };
        createdAt: string;
    };
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const MentorRequestCard: React.FC<MentorRequestCardProps> = ({ item, onApprove, onReject }) => {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.student.name || 'Unknown User'}</Text>
                <Text style={styles.date}>Requested: {format(new Date(item.createdAt), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => onReject(item.id)}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => onApprove(item.id)}
                >
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: lightTheme.colors.border,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: lightTheme.colors.text,
    },
    date: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    approveButton: {
        backgroundColor: '#34C759', // Green
    },
    rejectButton: {
        backgroundColor: '#FF3B30', // Red
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
