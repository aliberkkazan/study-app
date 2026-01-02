import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchStudents } from '../../redux/dataSlice';
import { useTheme } from '@/theme';
import { useFocusEffect } from '@react-navigation/native';
import { MentorStudentListCard } from './components';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MentorStudentListScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { students, loading } = useSelector((state: RootState) => state.data);
    const [refreshing, setRefreshing] = React.useState(false);
    const { colors } = useTheme();

    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    const loadStudents = React.useCallback(async () => {
        if (isAuthenticated) {
            await dispatch(fetchStudents());
        }
    }, [dispatch, isAuthenticated]);

    useFocusEffect(
        React.useCallback(() => {
            loadStudents();
        }, [loadStudents])
    );

    // Auto-redirect removed by request

    // Set Header Options
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={{ marginRight: 16 }}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Ionicons name="person-circle-outline" size={30} color={colors.primary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, colors.primary]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadStudents();
        setRefreshing(false);
    }, [loadStudents]);

    const handleSelectStudent = (student: any) => {
        navigation.navigate('MentorDashboard', { student });
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            backgroundColor: colors.background,
        },
        loading: {
            textAlign: 'center',
            marginTop: 20,
            color: colors.text,
        },
        empty: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyText: {
            color: '#999',
            fontSize: 18,
            fontWeight: 'bold',
        },
        subText: {
            color: '#ccc',
            marginTop: 8,
        }
    }), [colors]);

    return (
        <View style={styles.container}>
            {loading && !refreshing && students.length === 0 ? (
                <Text style={styles.loading}>Loading...</Text>
            ) : students.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No students found.</Text>
                    <Text style={styles.subText}>Ask students to add your code.</Text>
                </View>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    renderItem={({ item }) => (
                        <MentorStudentListCard item={item} onPress={handleSelectStudent} />
                    )}
                />
            )}
        </View>
    );
};

export default MentorStudentListScreen;
