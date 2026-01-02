import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { lightTheme } from '../../../theme/theme';

interface SubmissionCardProps {
    item: {
        id: string;
        imageUrl: string;
        createdAt: string;
        status: 'pending' | 'approved' | 'rejected';
        feedback?: string;
    };
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ item }) => {
    return (
        <View style={[styles.card, item.status === 'approved' ? styles.cardApproved : item.status === 'rejected' ? styles.cardRejected : {}]}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.info}>
                <View style={styles.row}>
                    <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <View style={[
                        styles.badge,
                        { backgroundColor: item.status === 'approved' ? '#4CD964' : item.status === 'rejected' ? '#FF3B30' : '#FF9500' }
                    ]}>
                        <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                </View>
                {item.feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Mentor Feedback:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardApproved: {
        borderColor: '#4CD964',
    },
    cardRejected: {
        borderColor: '#FF3B30',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    info: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        color: '#666',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    feedbackContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    feedbackLabel: {
        fontWeight: '600',
        marginBottom: 4,
        color: '#333',
    },
    feedbackText: {
        color: '#444',
        fontStyle: 'italic',
    },
});
