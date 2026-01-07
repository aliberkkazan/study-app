import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Button } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { addProgramItem, updateProgramItem } from '../../redux/dataSlice';
import { logout } from '../../redux/authSlice';
import { lightTheme } from '../../theme/theme';

const EditProgramScreen = ({ navigation, route }: any) => {
    const { student, task } = route.params;
    const isEditMode = !!task;

    const [title, setTitle] = useState(task?.title || '');
    const [desc, setDesc] = useState(task?.description || '');

    // Date handling
    const [isScheduled, setIsScheduled] = useState(!!task?.scheduledDate);
    const [scheduledDate, setScheduledDate] = useState(task?.scheduledDate || new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(task?.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]); // +1 day

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const { loading } = useSelector((state: RootState) => state.data);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDesc(task.description);
            setIsScheduled(!!task.scheduledDate);
            setScheduledDate(task.scheduledDate || new Date().toISOString().split('T')[0]);
            setDueDate(task.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
        }
    }, [task]);

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSaveTask = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        if (isScheduled) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(scheduledDate) || !dateRegex.test(dueDate)) {
                Alert.alert('Error', 'Please use YYYY-MM-DD format for dates');
                return;
            }
        }

        const taskData = {
            title,
            description: desc,
            scheduledDate: isScheduled ? scheduledDate : undefined,
            dueDate: isScheduled ? new Date(dueDate).toISOString() : undefined,
        };

        if (isEditMode) {
            dispatch(updateProgramItem({
                id: task.id,
                ...taskData,
            }) as any)
                .unwrap()
                .then(() => {
                    Alert.alert('Success', 'Task updated');
                    // Clear task param to reset form for next time?
                    // Navigating away is paramount.
                    navigation.navigate('Task List');
                    // Ideally we should reset params too, but jumping tabs is enough for now.
                    // React Nav might keep params on this tab though.
                    navigation.setParams({ task: undefined });
                })
                .catch((err) => Alert.alert('Error', err));
        } else {
            dispatch(addProgramItem({
                studentId: student.id,
                mentorId: user?.id || '',
                ...taskData,
            }) as any)
                .unwrap()
                .then(() => {
                    Alert.alert('Success', 'Task assigned to ' + student.name);
                    // Reset form
                    setTitle('');
                    setDesc('');
                    setIsScheduled(false);
                })
                .catch((err) => Alert.alert('Error', err));
        }
    };

    const handleCancel = () => {
        navigation.setParams({ task: undefined });
        navigation.navigate('Task List');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{isEditMode ? 'Edit Task' : `Assign to ${student.name}`}</Text>
                <Button
                    mode="text"
                    onPress={handleLogout}
                    compact
                    textColor={lightTheme.colors.danger as string}
                >
                    Logout
                </Button>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Task Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Solve Math Page 10"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={desc}
                    onChangeText={setDesc}
                    placeholder="Details..."
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.toggleRow}>
                    <Text style={styles.label}>Set Schedule & Due Date</Text>
                    <Switch
                        value={isScheduled}
                        thumbColor={lightTheme.colors.primary as string}
                        trackColor={{ true: 'red', false: 'gray' }}
                        ios_backgroundColor="gray"
                        onValueChange={setIsScheduled}
                    />
                </View>

                {isScheduled && (
                    <>
                        <Text style={styles.label}>Scheduled Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={scheduledDate}
                            onChangeText={setScheduledDate}
                            placeholder="YYYY-MM-DD"
                        />

                        <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={dueDate}
                            onChangeText={setDueDate}
                            placeholder="YYYY-MM-DD"
                        />
                    </>
                )}
                {isEditMode && (
                    <Button
                        mode="outlined"
                        onPress={handleCancel}
                        style={styles.marginTop}
                    >
                        Cancel
                    </Button>
                )}
            </View>
            <Button
                mode="contained"
                onPress={handleSaveTask}
                loading={loading}
                disabled={loading}
                style={styles.marginTop}
            >
                {isEditMode ? 'Update Task' : 'Assign Task'}
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: lightTheme.colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: lightTheme.colors.text,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoutBtn: {
        padding: 8,
    },
    logoutText: {
        color: lightTheme.colors.danger,
        fontWeight: '600',
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 16,
        color: lightTheme.colors.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: lightTheme.colors.gray, // Replaced non-existent border with gray
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    marginTop: {
        marginTop: 16,
    },
});

export default EditProgramScreen;
