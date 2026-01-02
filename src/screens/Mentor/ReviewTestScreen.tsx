import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { reviewSubmission } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';

const ReviewTestScreen = ({ route }: any) => {
    const { student } = route.params;
    const submissions = useSelector((state: RootState) => state.data.submissions);
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    
    // Track feedback for each Item potentially, or just one if reviewing one by one.
    // Using a simple state for the whole list might be glitchy if multiple cards active.
    // But typically we review one. I'll use a local map.
    const [feedbackMap, setFeedbackMap] = useState<{ [key: string]: string }>({});

    const handleReview = (id: string, approved: boolean) => {
        const feedback = feedbackMap[id] || (approved ? 'Great work!' : 'Please check again.');
        
        dispatch(reviewSubmission({
            id,
            status: approved ? 'approved' : 'rejected',
            feedback: feedback
        }) as any);
        
        // Clear feedback for this item
        setFeedbackMap(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });

        Alert.alert('Reviewed', approved ? 'Submission Approved' : 'Feedback sent');
    };

    const updateFeedback = (id: string, text: string) => {
        setFeedbackMap(prev => ({ ...prev, [id]: text }));
    };

    const filteredSubmissions = submissions.filter(item => 
        item.student.id === student.id &&
        (activeTab === 'pending' ? item.status === 'pending' : item.status !== 'pending')
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Review Submissions</Text>
                <View style={styles.tabs}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                        onPress={() => setActiveTab('history')}
                    >
                        <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {filteredSubmissions.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No {activeTab} submissions</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSubmissions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.headerRow}>
                                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                <View style={[
                                    styles.badge,
                                    { backgroundColor: item.status === 'approved' ? '#4CD964' : item.status === 'rejected' ? '#FF3B30' : '#FF9500' }
                                ]}>
                                    <Text style={styles.badgeText}>{item.status}</Text>
                                </View>
                            </View>

                            <Image source={{ uri: item.imageUrl }} style={styles.image} />

                            {item.status === 'pending' && (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Add feedback notes..."
                                        value={feedbackMap[item.id] || ''}
                                        onChangeText={(text) => updateFeedback(item.id, text)}
                                        multiline
                                    />
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.approveBtn]}
                                            onPress={() => handleReview(item.id, true)}
                                        >
                                            <Text style={styles.btnText}>Approve</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.rejectBtn]}
                                            onPress={() => handleReview(item.id, false)}
                                        >
                                            <Text style={styles.btnText}>Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            {item.feedback && item.status !== 'pending' && (
                                <Text style={styles.feedback}>Feedback: {item.feedback}</Text>
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: lightTheme.colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: lightTheme.colors.text,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
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
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveBtn: {
        backgroundColor: lightTheme.colors.primary,
    },
    rejectBtn: {
        backgroundColor: lightTheme.colors.notification,
    },
    btnText: {
        color: '#FFF',
        fontWeight: '600',
    },
    feedback: {
        marginTop: 12,
        fontStyle: 'italic',
        color: lightTheme.colors.text,
    },
    header: {
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: lightTheme.colors.card,
        padding: 4,
        borderRadius: 8,
        marginTop: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: lightTheme.colors.primary,
    },
    tabText: {
        fontWeight: '600',
        color: lightTheme.colors.text,
    },
    activeTabText: {
        color: '#FFF',
    },
});

export default ReviewTestScreen;
