import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components';
import { lightTheme } from '../../../theme/theme';
import { format } from 'date-fns';

interface MentorRequestCardProps {
    item: {
        id: string;
        student: { name: string };
        created_at: string;
    };
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const MentorRequestCard: React.FC<MentorRequestCardProps> = ({ item, onApprove, onReject }) => {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.name}>{item.student.name || 'Unknown User'}</Text>
                <Text style={styles.date}>Requested: {format(new Date(item.created_at), 'MMM dd, yyyy')}</Text>
            </View>
            <View style={styles.actions}>
                <Button
                    mode="contained"
                    buttonColor="#FF3B30"
                    onPress={() => onReject(item.id)}
                    compact
                >
                    Reject
                </Button>
                <Button
                    mode="contained"
                    buttonColor="#34C759"
                    onPress={() => onApprove(item.id)}
                    compact
                >
                    Approve
                </Button>
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
        borderColor: lightTheme.colors.gray, // Fixed border color
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
    // Removed unused button styles
});
