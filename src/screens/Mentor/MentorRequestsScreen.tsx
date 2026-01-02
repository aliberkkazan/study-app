import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { fetchConnectionRequests, respondToConnectionRequest } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';
import { MentorRequestCard } from './components';

export const MentorRequestsScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { connectionRequests, loading } = useSelector((state: RootState) => state.data);

    useEffect(() => {
        dispatch(fetchConnectionRequests());
    }, [dispatch]);

    const handleApprove = (id: string) => {
        dispatch(respondToConnectionRequest({ id, status: 'approved' }));
    };

    const handleReject = (id: string) => {
        dispatch(respondToConnectionRequest({ id, status: 'rejected' }));
    };

    return (
        <View style={styles.container}>
            {loading && connectionRequests.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={connectionRequests}
                    renderItem={({ item }) => (
                         <MentorRequestCard 
                            item={item} 
                            onApprove={handleApprove} 
                            onReject={handleReject} 
                         />
                    )}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<Text style={styles.emptyText}>No pending requests.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: lightTheme.colors.background,
        padding: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    }
});
