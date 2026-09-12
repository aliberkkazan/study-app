import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Loading } from '@/components';
import { MainTabParamList } from '../../navigators/MainTabNavigator';
import { RootState, AppDispatch } from '../../redux/store';
import {
    fetchTasks,
    addNewTask,
    toggleTask,
    archiveExistingTask,
    unarchiveExistingTask,
    deleteExistingTask,
    setSelectedCategory,
    setActiveFocusTask,
} from '../../redux/tasksSlice';
import { fetchStudyProfile } from '../../redux/roadmapSlice';
import { addSubmission } from '../../redux/dataSlice';
import { recordSession } from '../../redux/sessionsSlice';
import { Task, TaskCategory, CreateTaskPayload, TaskStatus } from '../../api/types';
import { TaskCard, TaskFilterTabs, TaskCreateModal, TaskCompletionModal } from '../../components/tasks';
import { ViewState } from '../../components/common/ViewState';
import { OfflineWarning } from '../../components/common/OfflineWarning';
import { useAppLanguage } from '../../utils/i18n';
import { getLocalDateString, normalizeDateString } from '../../utils/date';

const TodayScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const { language, t } = useAppLanguage();

    const { user } = useSelector((state: RootState) => state.auth);
    const { items, selectedCategory, loading: tasksLoading, error } = useSelector(
        (state: RootState) => state.tasks
    );
    const { selectedExam, targetTrack, targetScore } = useSelector(
        (state: RootState) => state.roadmap
    );

    const loading = tasksLoading;

    const [modalVisible, setModalVisible] = useState(false);
    const [completionModalVisible, setCompletionModalVisible] = useState(false);
    const [completingTask, setCompletingTask] = useState<Task | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    const loadTasks = useCallback(() => {
        dispatch(fetchTasks());
        dispatch(fetchStudyProfile());
    }, [dispatch]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchTasks()),
            dispatch(fetchStudyProfile()),
        ]);
        setRefreshing(false);
    };

    // Calculate dates & categorization
    const todayStr = useMemo(() => getLocalDateString(), []);

    // Standard tasks from unified task management
    const allTasks = items;

    const categorizedTasks = useMemo(() => {
        const todayTasks: Task[] = [];
        const upcomingTasks: Task[] = [];
        const flexibleTasks: Task[] = [];
        const historyTasks: Task[] = [];

        allTasks.forEach((task) => {
            if (task.status === 'archived') {
                historyTasks.push(task);
            } else if (task.isFlexible || (!task.dueDate && !task.isFlexible)) {
                flexibleTasks.push(task);
            } else if (task.dueDate) {
                const normalizedDue = normalizeDateString(task.dueDate);
                if (normalizedDue === todayStr) {
                    todayTasks.push(task);
                } else if (normalizedDue > todayStr) {
                    upcomingTasks.push(task);
                } else {
                    // normalizedDue < todayStr (yesterday or older)
                    historyTasks.push(task);
                }
            } else {
                flexibleTasks.push(task);
            }
        });

        // Sort history by date descending (most recent past first)
        historyTasks.sort((a, b) => {
            const dateA = normalizeDateString(a.dueDate) || normalizeDateString(a.createdAt);
            const dateB = normalizeDateString(b.dueDate) || normalizeDateString(b.createdAt);
            return dateB.localeCompare(dateA);
        });

        return {
            today: todayTasks,
            upcoming: upcomingTasks,
            flexible: flexibleTasks,
            history: historyTasks,
            archived: historyTasks,
        };
    }, [allTasks, todayStr]);

    const currentList = categorizedTasks[selectedCategory] || categorizedTasks.today;

    // Counts for tabs
    const counts = {
        today: categorizedTasks.today.length,
        upcoming: categorizedTasks.upcoming.length,
        flexible: categorizedTasks.flexible.length,
        history: categorizedTasks.history.length,
        archived: categorizedTasks.history.length,
    };

    // Progress Calculation for Today
    const todayCompletedCount = categorizedTasks.today.filter(
        (t) => t.completed || t.status === 'completed'
    ).length;
    const todayTotalCount = categorizedTasks.today.length;
    const progressPercent =
        todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

    // Handlers
    const handleToggle = (task: Task) => {
        if (task.completed || task.status === 'completed') {
            dispatch(
                toggleTask({
                    taskId: task.id,
                    completed: false,
                })
            );
            return;
        }

        // When completing an uncompleted task, open quick log modal
        setCompletingTask(task);
        setCompletionModalVisible(true);
    };

    const handleDirectComplete = (task: Task) => {
        dispatch(
            toggleTask({
                taskId: task.id,
                completed: true,
            })
        );
    };

    const handleSubmitSessionForTask = async (
        task: Task,
        sessionData: {
            durationMinutes: number;
            questionsSolved?: number;
            correctCount?: number;
            incorrectCount?: number;
            notes?: string;
        }
    ) => {
        const now = new Date();
        const startTime = new Date(
            now.getTime() - sessionData.durationMinutes * 60000
        ).toISOString();

        await dispatch(
            recordSession({
                taskId: task.id,
                taskTitle: task.title,
                courseName: task.courseName,
                topicName: task.topicName,
                durationMinutes: sessionData.durationMinutes,
                startedAt: startTime,
                endedAt: now.toISOString(),
                questionsSolved: sessionData.questionsSolved,
                correctCount: sessionData.correctCount,
                incorrectCount: sessionData.incorrectCount,
                notes: sessionData.notes,
                markTaskCompleted: true,
            })
        ).unwrap();
    };

    const handleUploadTaskImage = async (task: Task) => {
        const studentId = user?.id;
        if (!studentId) {
            Alert.alert(t('common.error'), t('task.sessionNotFound'));
            return;
        }

        const result = await launchImageLibrary({
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.6,
        });

        if (result.didCancel || !result.assets || result.assets.length === 0) {
            return;
        }

        const asset = result.assets[0];
        if (!asset.base64 || !asset.type) {
            Alert.alert(t('common.error'), t('task.imageProcessError'));
            return;
        }

        const base64Image = `data:${asset.type};base64,${asset.base64}`;

        try {
            await dispatch(
                addSubmission({
                    studentId,
                    imageUrl: base64Image,
                })
            ).unwrap();

            Alert.alert(
                t('task.solutionUploaded'),
                t('task.solutionSentMentor', { title: task.title })
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error?.message || error || t('task.imageProcessError'));
        }
    };

    const handleStartFocus = (task: Task) => {
        dispatch(setActiveFocusTask(task));
        navigation.navigate('Focus');
    };

    const handleDelete = (task: Task) => {
        Alert.alert(
            t('task.deleteTask'),
            t('task.deleteTaskConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingTaskId(task.id);
                        try {
                            await dispatch(deleteExistingTask(task.id)).unwrap();
                        } catch (err: any) {
                            Alert.alert(t('common.error'), err || t('common.error'));
                        } finally {
                            setDeletingTaskId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleUnarchive = (task: Task) => {
        dispatch(unarchiveExistingTask(task.id));
    };

    const handleCreateTask = async (payload: CreateTaskPayload) => {
        await dispatch(addNewTask(payload)).unwrap();
    };

    // Formatted date string for greeting
    const formattedDate = useMemo(() => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        };
        return new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
    }, [language]);

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Top Bar: Title & Quick Add Button */}
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <Text style={styles.screenTitle}>{t('nav.today')}</Text>
                </View>
                <TouchableOpacity
                    style={styles.quickAddHeaderBtn}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={22} color="#FFFFFF" />
                    <Text style={styles.quickAddHeaderText}>{t('common.add')}</Text>
                </TouchableOpacity>
            </View>

            {/* Roadmap / Goal Banner (Temporarily hidden as requested) */}

            {/* Daily Overview Card */}
            <View style={styles.overviewCard}>
                <View style={styles.overviewHeader}>
                    <View style={styles.overviewTitleRow}>
                        <Ionicons name="sparkles" size={18} color="#F59E0B" />
                        <Text style={styles.overviewTitle}>{t('task.tasksOverview')}</Text>
                    </View>
                    <Text style={styles.overviewStat}>
                        {todayCompletedCount}/{todayTotalCount} {t('task.completedCount')}
                    </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${todayTotalCount > 0 ? progressPercent : 0}%` },
                        ]}
                    />
                </View>
            </View>

            {/* Filter Tabs */}
            <TaskFilterTabs
                selectedCategory={selectedCategory}
                onSelectCategory={(cat: TaskCategory) => dispatch(setSelectedCategory(cat))}
                counts={counts}
            />
        </View>
    );

    const getEmptyMessage = () => {
        switch (selectedCategory) {
            case 'today':
                return t('task.emptyToday');
            case 'upcoming':
                return t('task.emptyUpcoming');
            case 'flexible':
                return t('task.emptyFlexible');
            case 'history':
            case 'archived':
                return t('task.emptyHistory');
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <OfflineWarning />

            <ViewState
                isLoading={loading && items.length === 0}
                error={items.length === 0 ? error : null}
                onRetry={loadTasks}
            >
                <FlatList
                    data={currentList}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <TaskCard
                            task={item}
                            onToggleComplete={handleToggle}
                            onStartFocus={handleStartFocus}
                            onDelete={handleDelete}
                            onArchive={handleDelete}
                            onUnarchive={handleUnarchive}
                            onUploadImage={handleUploadTaskImage}
                            isDeleting={deletingTaskId === item.id}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={
                                    selectedCategory === 'history' || selectedCategory === 'archived'
                                        ? 'time-outline'
                                        : 'checkbox-outline'
                                }
                                size={48}
                                color="#CBD5E1"
                            />
                            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
                            {selectedCategory !== 'history' && selectedCategory !== 'archived' && (
                                <TouchableOpacity
                                    style={styles.emptyAddBtn}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Ionicons name="add-circle" size={18} color="#2563EB" />
                                    <Text style={styles.emptyAddBtnText}>{t('task.quickAdd')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                />
            </ViewState>

            {/* Quick Add Floating Modal */}
            <TaskCreateModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreateTask}
            />

            {/* Quick Task Completion & Progress Log Modal */}
            <TaskCompletionModal
                visible={completionModalVisible}
                task={completingTask}
                onClose={() => {
                    setCompletionModalVisible(false);
                    setCompletingTask(null);
                }}
                onDirectComplete={handleDirectComplete}
                onSubmitWithSession={handleSubmitSessionForTask}
            />

            <Loading visible={!!deletingTaskId} />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    listContent: {
        paddingBottom: 40,
    },
    headerContainer: {
        paddingTop: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 2,
    },
    quickAddHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 4,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    quickAddHeaderText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    overviewCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    overviewTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    overviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    overviewStat: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
    },
    emptyAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    emptyAddBtnText: {
        color: '#2563EB',
        fontWeight: '700',
        fontSize: 14,
    },
    roadmapActiveBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#BFDBFE',
    },
    roadmapBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    roadmapCompassCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    roadmapBannerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E3A8A',
    },
    roadmapBannerSubtitle: {
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 2,
    },
    roadmapGoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    roadmapGoText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1D4ED8',
    },
    roadmapSetupPrompt: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    roadmapSetupPromptLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roadmapSetupText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
});

export default TodayScreen;
