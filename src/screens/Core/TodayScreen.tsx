import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../redux/store';
import {
    fetchTasks,
    addNewTask,
    toggleTask,
    archiveExistingTask,
    unarchiveExistingTask,
    setSelectedCategory,
    setActiveFocusTask,
} from '../../redux/tasksSlice';
import { Task, TaskCategory, CreateTaskPayload } from '../../api/types';
import { TaskCard, TaskFilterTabs, TaskCreateModal } from '../../components/tasks';
import { ViewState } from '../../components/common/ViewState';
import { OfflineWarning } from '../../components/common/OfflineWarning';
import { t } from '../../utils/i18n';
import { getLocalDateString, normalizeDateString } from '../../utils/date';

const TodayScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();

    const { items, selectedCategory, loading, error } = useSelector(
        (state: RootState) => state.tasks
    );

    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = useCallback(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchTasks());
        setRefreshing(false);
    };

    // Calculate dates & categorization
    const todayStr = useMemo(() => getLocalDateString(), []);

    const categorizedTasks = useMemo(() => {
        const todayTasks: Task[] = [];
        const upcomingTasks: Task[] = [];
        const flexibleTasks: Task[] = [];
        const archivedTasks: Task[] = [];

        items.forEach((task) => {
            if (task.status === 'archived') {
                archivedTasks.push(task);
            } else if (task.isFlexible || (!task.dueDate && !task.isFlexible)) {
                flexibleTasks.push(task);
            } else if (task.dueDate) {
                const normalizedDue = normalizeDateString(task.dueDate);
                if (normalizedDue <= todayStr) {
                    todayTasks.push(task);
                } else {
                    upcomingTasks.push(task);
                }
            } else {
                flexibleTasks.push(task);
            }
        });

        return {
            today: todayTasks,
            upcoming: upcomingTasks,
            flexible: flexibleTasks,
            archived: archivedTasks,
        };
    }, [items, todayStr]);

    const currentList = categorizedTasks[selectedCategory];

    // Counts for tabs
    const counts = {
        today: categorizedTasks.today.length,
        upcoming: categorizedTasks.upcoming.length,
        flexible: categorizedTasks.flexible.length,
        archived: categorizedTasks.archived.length,
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
        dispatch(
            toggleTask({
                taskId: task.id,
                completed: !task.completed,
            })
        );
    };

    const handleStartFocus = (task: Task) => {
        dispatch(setActiveFocusTask(task));
        navigation.navigate('Focus');
    };

    const handleArchive = (task: Task) => {
        dispatch(archiveExistingTask(task.id));
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
        return new Date().toLocaleDateString('en-US', options);
    }, []);

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
            case 'archived':
                return t('task.emptyArchived');
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
                            onArchive={handleArchive}
                            onUnarchive={handleUnarchive}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name={
                                    selectedCategory === 'archived'
                                        ? 'archive-outline'
                                        : 'checkbox-outline'
                                }
                                size={48}
                                color="#CBD5E1"
                            />
                            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
                            {selectedCategory !== 'archived' && (
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
});

export default TodayScreen;
