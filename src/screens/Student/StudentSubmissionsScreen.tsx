import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchSubmissions } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';
import { SubmissionCard } from './components';

const StudentSubmissionsScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { submissions, loading } = useSelector((state: RootState) => state.data);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchSubmissions());
    }, [dispatch]);

    // Filter submissions for current student 
    const mySubmissions = submissions
        .filter(s => s.student.id === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Submissions</Text>
            {loading ? (
                 <Text style={styles.loading}>Loading...</Text>
            ) : mySubmissions.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No submissions yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={mySubmissions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <SubmissionCard item={item} />
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: lightTheme.colors.text,
    },
    loading: {
        textAlign: 'center',
        marginTop: 20,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
});

export default StudentSubmissionsScreen;
