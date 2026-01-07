import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { lightTheme } from '../../../theme/theme';
import { TestSubmission } from '../../../redux/dataSlice';
import { Button, ImageViewer } from '@/components';

interface SubmissionCardProps {
    item: TestSubmission;
    feedback: string;
    onFeedbackChange: (text: string) => void;
    onReview: (approved: boolean) => void;
    loading: boolean;
}

const SubmissionCard = ({ item, feedback, onFeedbackChange, onReview, loading }: SubmissionCardProps) => {
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                <View style={[
                    styles.badge,
                    { backgroundColor: item.status === 'approved' ? '#4CD964' : item.status === 'rejected' ? '#FF3B30' : '#FF9500' }
                ]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>

            <TouchableOpacity onPress={() => setIsImageViewerVisible(true)}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </TouchableOpacity>

            <ImageViewer
                visible={isImageViewerVisible}
                imageUrl={item.imageUrl}
                onClose={() => setIsImageViewerVisible(false)}
            />

            {item.status === 'pending' && (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Add feedback notes..."
                        value={feedback}
                        onChangeText={onFeedbackChange}
                        multiline
                    />
                    <View style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={() => onReview(true)}
                            style={[styles.btn]}
                            loading={loading}
                            disabled={loading}
                        >
                            Approve
                        </Button>
                        <Button
                            mode="contained"
                            onPress={() => onReview(false)}
                            buttonColor={lightTheme.colors.danger as string}
                            style={[styles.btn]}
                            loading={loading}
                            disabled={loading}
                        >
                            Reject
                        </Button>
                    </View>
                </View>
            )}
            {item.feedback && item.status !== 'pending' && (
                <Text style={styles.feedback}>Feedback: {item.feedback}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: lightTheme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
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
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    btn: {
        flex: 1,
        borderRadius: 8,
    },
    feedback: {
        marginTop: 12,
        fontStyle: 'italic',
        color: lightTheme.colors.text,
    },
});

export default SubmissionCard;
