import React, { useEffect } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchPrograms, toggleProgramCompletion } from '../../redux/dataSlice';
import { logout } from '../../redux/authSlice';
import { lightTheme } from '../../theme/theme';
import { StudentProgramCard } from './components';

const ProgramScreen = ({ navigation }: any) => {
    // ... existing hooks ...
    const { program, loading } = useSelector((state: RootState) => state.data);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchPrograms());
        }
    }, [dispatch, isAuthenticated]);

    const handleToggle = (id: string) => {
        dispatch(toggleProgramCompletion(id));
    };

    const groupedData = React.useMemo(() => {
        const groups: { [key: string]: typeof program } = {};

        program.forEach(item => {
            const dateKey = item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : 'Unscheduled';
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });

        // Sort keys (dates) and create sections
        return Object.keys(groups)
            .sort()
            .map(date => ({
                title: date === 'Unscheduled' ? 'Flexible Tasks' : new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                data: groups[date]
            }));
    }, [program]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Study Program</Text>

            {groupedData.length === 0 && !loading ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyText}>No tasks assigned yet.</Text>
                </View>
            ) : (
                <SectionList
                    sections={groupedData}
                    keyExtractor={(item) => item.id}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    renderItem={({ item }) => (
                        <StudentProgramCard item={item} onToggle={handleToggle} />
                    )}
                    contentContainerStyle={styles.list}
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: lightTheme.colors.text,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: lightTheme.colors.background,
        paddingVertical: 8,
        marginTop: 10,
        color: lightTheme.colors.primary,
    },
    empty: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    list: {
        paddingBottom: 20,
    },
});

export default ProgramScreen;
