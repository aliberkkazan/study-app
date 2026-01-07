import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPrograms } from '../../redux/dataSlice';
import { lightTheme } from '../../theme/theme';
import { MentorProgramListCard } from './components';

const MentorProgramListScreen = ({ navigation, route }: any) => {
    const { student } = route.params;
    const { program: programs, loading } = useSelector((state: RootState) => state.data);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchPrograms());
    }, [dispatch]);

    const studentPrograms = programs
        .filter(p => p.student.id === student.id)
        .sort((a, b) => {
            // Sort by scheduledDate desc, then title
            if (a.scheduledDate && b.scheduledDate) return b.scheduledDate.localeCompare(a.scheduledDate);
            return 0;
        });

    const handleEditTask = (task: any) => {
        navigation.navigate('Assign Tasks', { student, task });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tasks for {student.name}</Text>
            </View>

            {/* Show loading only on initial load or empty list to avoid flicker */}
            {programs.length === 0 && loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={lightTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={studentPrograms}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No tasks assigned.</Text></View>}
                    renderItem={({ item }) => (
                        <MentorProgramListCard item={item} onPress={handleEditTask} />
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshing={loading}
                    onRefresh={() => dispatch(fetchPrograms())}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: lightTheme.colors.background,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: lightTheme.colors.text,
    },
    empty: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MentorProgramListScreen;
