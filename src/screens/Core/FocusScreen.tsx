import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Platform,
    StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { RootState, AppDispatch } from '../../redux/store';
import { setActiveFocusTask, toggleTask } from '../../redux/tasksSlice';
import { recordSession } from '../../redux/sessionsSlice';
import { Task, CreateSessionPayload } from '../../api/types';
import { SessionResultModal } from '../../components/focus/SessionResultModal';
import { useFocusTimer, TimerMode } from '../../hooks/useFocusTimer';
import { t } from '../../utils/i18n';

const PRESET_DURATIONS: Record<TimerMode, number[]> = {
    focus: [15, 25, 45, 60],
    shortBreak: [5, 10],
    longBreak: [15, 20, 30],
};

const FocusScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const activeTask = useSelector((state: RootState) => state.tasks.activeFocusTask);
    const allTasks = useSelector((state: RootState) => state.tasks.items);
    const sessionStats = useSelector((state: RootState) => state.sessions.stats);

    const [completedSessions, setCompletedSessions] = useState(0);
    const [taskPickerVisible, setTaskPickerVisible] = useState(false);

    // Session Result Modal state
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [sessionStartISO, setSessionStartISO] = useState(new Date().toISOString());
    const [elapsedFocusMinutes, setElapsedFocusMinutes] = useState(25);

    const timerRef = React.useRef<any>(null);

    const handleTimerComplete = useCallback(
        (finishedMode: TimerMode, durationMins: number, startedAt: string) => {
            if (finishedMode === 'focus') {
                setCompletedSessions((prev) => prev + 1);
                setSessionStartISO(startedAt);
                setElapsedFocusMinutes(durationMins);
                setResultModalVisible(true);
            } else {
                Alert.alert(
                    t('focus.breakOverTitle'),
                    t('focus.breakOverMsg'),
                    [
                        {
                            text: t('focus.start25Focus'),
                            onPress: () => timerRef.current?.changeMode('focus', 25),
                        },
                        {
                            text: t('focus.dismiss'),
                            style: 'cancel',
                        },
                    ]
                );
            }
        },
        []
    );

    const timer = useFocusTimer({
        initialMode: 'focus',
        initialMinutes: 25,
        onTimerComplete: handleTimerComplete,
    });
    timerRef.current = timer;

    const handleEndSessionEarly = () => {
        if (timer.mode !== 'focus') {
            timer.changeMode('focus', 25);
            return;
        }

        const { elapsedMinutes, startedAt } = timer.endSessionEarly();
        setSessionStartISO(startedAt);
        setElapsedFocusMinutes(elapsedMinutes);
        setResultModalVisible(true);
    };

    const handleSaveSessionResult = async (payload: CreateSessionPayload) => {
        await dispatch(recordSession(payload)).unwrap();
        Alert.alert(t('focus.greatProgressTitle'), t('focus.greatProgressMsg'), [
            { text: t('focus.takeBreak'), onPress: () => timer.changeMode('shortBreak', 5) },
            { text: t('focus.keepFocusing'), onPress: () => timer.changeMode('focus', timer.selectedMinutes) },
        ]);
    };

    const handleToggleTaskComplete = (task: Task) => {
        dispatch(
            toggleTask({
                taskId: task.id,
                completed: !task.completed,
            })
        );
    };

    const handleSelectTask = (task: Task) => {
        dispatch(setActiveFocusTask(task));
        setTaskPickerVisible(false);
    };

    // Pending tasks for picker modal
    const pendingTasks = allTasks.filter(
        (t) => !t.completed && t.status !== 'completed' && t.status !== 'archived'
    );

    // Circular Progress calculations
    const svgSize = 240;
    const strokeWidth = 10;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference * (1 - Math.min(1, Math.max(0, timer.progress)));

    const modeColors = {
        focus: {
            primary: '#2563EB',
            light: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1E40AF',
            ring: '#3B82F6',
            label: t('focus.session'),
            icon: 'flame',
        },
        shortBreak: {
            primary: '#059669',
            light: '#ECFDF5',
            border: '#A7F3D0',
            text: '#065F46',
            ring: '#10B981',
            label: t('focus.shortBreak'),
            icon: 'cafe',
        },
        longBreak: {
            primary: '#7C3AED',
            light: '#F5F3FF',
            border: '#DDD6FE',
            text: '#5B21B6',
            ring: '#8B5CF6',
            label: t('focus.longBreak'),
            icon: 'leaf',
        },
    };

    const currentTheme = modeColors[timer.mode];

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Mode Selector Tabs */}
                <View style={styles.modeTabsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.modeTab,
                            timer.mode === 'focus' && {
                                backgroundColor: '#FFFFFF',
                                shadowOpacity: 0.08,
                            },
                        ]}
                        onPress={() => timer.changeMode('focus', 25)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="flame"
                            size={16}
                            color={timer.mode === 'focus' ? '#2563EB' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                timer.mode === 'focus' && { color: '#1E293B', fontWeight: '700' },
                            ]}
                        >
                            {t('focus.focus')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeTab,
                            timer.mode === 'shortBreak' && {
                                backgroundColor: '#FFFFFF',
                                shadowOpacity: 0.08,
                            },
                        ]}
                        onPress={() => timer.changeMode('shortBreak', 5)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="cafe"
                            size={16}
                            color={timer.mode === 'shortBreak' ? '#059669' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                timer.mode === 'shortBreak' && {
                                    color: '#1E293B',
                                    fontWeight: '700',
                                },
                            ]}
                        >
                            {t('focus.shortBreak')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeTab,
                            timer.mode === 'longBreak' && {
                                backgroundColor: '#FFFFFF',
                                shadowOpacity: 0.08,
                            },
                        ]}
                        onPress={() => timer.changeMode('longBreak', 15)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="leaf"
                            size={16}
                            color={timer.mode === 'longBreak' ? '#7C3AED' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                timer.mode === 'longBreak' && {
                                    color: '#1E293B',
                                    fontWeight: '700',
                                },
                            ]}
                        >
                            {t('focus.longBreak')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Active Focused Task Card */}
                {activeTask ? (
                    <View style={styles.activeTaskCard}>
                        <View style={styles.activeTaskTop}>
                            <View style={styles.activeTaskTag}>
                                <Ionicons name="sparkles" size={13} color="#2563EB" />
                                <Text style={styles.activeTaskTagText}>{t('focus.focusedTask')}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.clearTaskBtn}
                                onPress={() => dispatch(setActiveFocusTask(null))}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.activeTaskTitle} numberOfLines={2}>
                            {activeTask.title}
                        </Text>

                        {/* Task badges & details */}
                        <View style={styles.taskMetaRow}>
                            {activeTask.courseName ? (
                                <View style={styles.badgeCourse}>
                                    <Text style={styles.badgeCourseText}>
                                        {activeTask.courseName}
                                    </Text>
                                </View>
                            ) : null}
                            {activeTask.topicName ? (
                                <View style={styles.badgeTopic}>
                                    <Text style={styles.badgeTopicText}>
                                        {activeTask.topicName}
                                    </Text>
                                </View>
                            ) : null}
                            {activeTask.goal ? (
                                <View style={styles.badgeGoal}>
                                    <Ionicons name="flag-outline" size={11} color="#64748B" />
                                    <Text style={styles.badgeGoalText}>{activeTask.goal}</Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Quick Mark Complete Button */}
                        <TouchableOpacity
                            style={[
                                styles.markDoneBtn,
                                activeTask.completed && styles.markDoneBtnCompleted,
                            ]}
                            onPress={() => handleToggleTaskComplete(activeTask)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={
                                    activeTask.completed
                                        ? 'checkmark-circle'
                                        : 'checkmark-circle-outline'
                                }
                                size={18}
                                color={activeTask.completed ? '#10B981' : '#475569'}
                            />
                            <Text
                                style={[
                                    styles.markDoneText,
                                    activeTask.completed && styles.markDoneTextCompleted,
                                ]}
                            >
                                {activeTask.completed
                                    ? t('focus.completed')
                                    : t('focus.markComplete')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.selectTaskPromptCard}
                        onPress={() => setTaskPickerVisible(true)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.selectTaskPromptLeft}>
                            <View style={styles.selectTaskIconCircle}>
                                <Ionicons name="add" size={18} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.selectTaskPromptTitle}>
                                    {t('focus.linkTaskPrompt')}
                                </Text>
                                <Text style={styles.selectTaskPromptSub}>
                                    {t('focus.linkTaskSub')}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}

                {/* Duration Presets (Only visible when paused) */}
                {!timer.isRunning && (
                    <View style={styles.presetsRow}>
                        {PRESET_DURATIONS[timer.mode].map((mins) => (
                            <TouchableOpacity
                                key={mins}
                                style={[
                                    styles.presetChip,
                                    timer.selectedMinutes === mins && {
                                        backgroundColor: currentTheme.light,
                                        borderColor: currentTheme.border,
                                    },
                                ]}
                                onPress={() => timer.changeMode(timer.mode, mins)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.presetChipText,
                                        timer.selectedMinutes === mins && {
                                            color: currentTheme.text,
                                            fontWeight: '700',
                                        },
                                    ]}
                                >
                                    {mins} {t('focus.min')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Circular Timer Display */}
                <View style={styles.timerDisplayWrapper}>
                    <Svg
                        width={svgSize}
                        height={svgSize}
                        viewBox={`0 0 ${svgSize} ${svgSize}`}
                        style={styles.svgCircle}
                    >
                        {/* Background track circle */}
                        <Circle
                            cx={svgSize / 2}
                            cy={svgSize / 2}
                            r={radius}
                            stroke="#E2E8F0"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Animated progress circle */}
                        <Circle
                            cx={svgSize / 2}
                            cy={svgSize / 2}
                            r={radius}
                            stroke={currentTheme.ring}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
                        />
                    </Svg>

                    {/* Digital Countdown Center */}
                    <View style={styles.timerCenterContent}>
                        <View
                            style={[
                                styles.modePill,
                                {
                                    backgroundColor: currentTheme.light,
                                    borderColor: currentTheme.border,
                                },
                            ]}
                        >
                            <Ionicons
                                name={currentTheme.icon as any}
                                size={13}
                                color={currentTheme.text}
                            />
                            <Text style={[styles.modePillText, { color: currentTheme.text }]}>
                                {currentTheme.label}
                            </Text>
                        </View>

                        <Text style={styles.timeDigit}>{timer.formattedTime}</Text>

                        <Text style={styles.timerSubStatus}>
                            {timer.isRunning ? t('focus.inProgress') : t('focus.ready')}
                        </Text>
                    </View>
                </View>

                {/* Primary & Secondary Action Controls */}
                <View style={styles.controlsRow}>
                    {/* Reset Button */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={timer.resetTimer}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={20} color="#64748B" />
                    </TouchableOpacity>

                    {/* Main Start / Pause Button */}
                    <TouchableOpacity
                        style={[
                            styles.primaryPlayBtn,
                            {
                                backgroundColor: timer.isRunning
                                    ? '#0F172A'
                                    : currentTheme.primary,
                            },
                        ]}
                        onPress={timer.togglePlayPause}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name={timer.isRunning ? 'pause' : 'play'}
                            size={28}
                            color="#FFFFFF"
                            style={timer.isRunning ? {} : { marginLeft: 3 }}
                        />
                    </TouchableOpacity>

                    {/* Skip / Next Mode Button */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={timer.skipSession}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-forward" size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* End Session Early & Log Button (when timer has been running) */}
                {timer.mode === 'focus' &&
                    (timer.timeLeft < timer.totalDuration || timer.isRunning) && (
                        <TouchableOpacity
                            style={styles.endEarlyBtn}
                            onPress={handleEndSessionEarly}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="flag-outline" size={15} color="#2563EB" />
                            <Text style={styles.endEarlyBtnText}>
                                {t('focus.endAndSave')}
                            </Text>
                        </TouchableOpacity>
                    )}

                {/* Quick +5 Mins Pill (When running) */}
                {timer.isRunning && (
                    <TouchableOpacity
                        style={styles.addFiveBtn}
                        onPress={() => timer.addTime(300)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={14} color="#2563EB" />
                        <Text style={styles.addFiveText}>{t('focus.addFive')}</Text>
                    </TouchableOpacity>
                )}

                {/* Daily Progress & Streak Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-done-circle" size={22} color="#10B981" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statNumber}>
                                {completedSessions || sessionStats.totalSessionsCount}
                            </Text>
                            <Text style={styles.statLabel}>{t('focus.roundsDone')}</Text>
                        </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="time" size={22} color="#3B82F6" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statNumber}>
                                {sessionStats.dailyTotalMinutes || completedSessions * 25}{t('focus.min')}
                            </Text>
                            <Text style={styles.statLabel}>{t('focus.totalFocusToday')}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Task Selection Modal */}
            <Modal
                visible={taskPickerVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setTaskPickerVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('focus.chooseTask')}</Text>
                            <TouchableOpacity
                                onPress={() => setTaskPickerVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                            {pendingTasks.length === 0 ? (
                                <View style={styles.emptyTaskModal}>
                                    <Ionicons name="sparkles-outline" size={36} color="#CBD5E1" />
                                    <Text style={styles.emptyTaskModalText}>
                                        {t('focus.noPendingTasks')}
                                    </Text>
                                    <Text style={styles.emptyTaskModalSub}>
                                        {t('focus.runFreely')}
                                    </Text>
                                </View>
                            ) : (
                                pendingTasks.map((task) => (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={styles.taskPickerItem}
                                        onPress={() => handleSelectTask(task)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.taskPickerItemLeft}>
                                            <Text
                                                style={styles.taskPickerItemTitle}
                                                numberOfLines={1}
                                            >
                                                {task.title}
                                            </Text>
                                            <View style={styles.taskPickerItemMeta}>
                                                {task.courseName ? (
                                                    <Text style={styles.taskPickerCourse}>
                                                        {task.courseName}
                                                    </Text>
                                                ) : null}
                                                {task.topicName ? (
                                                    <Text style={styles.taskPickerTopic}>
                                                        • {task.topicName}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color="#94A3B8"
                                        />
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Session Result & Reflection Modal */}
            <SessionResultModal
                visible={resultModalVisible}
                task={activeTask}
                durationMinutes={elapsedFocusMinutes}
                startedAt={sessionStartISO}
                endedAt={new Date().toISOString()}
                onClose={() => setResultModalVisible(false)}
                onSubmit={handleSaveSessionResult}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 40,
        alignItems: 'center',
    },
    modeTabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 14,
        padding: 4,
        width: '100%',
        marginBottom: 16,
    },
    modeTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 1,
    },
    modeTabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTaskCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    activeTaskTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    activeTaskTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    activeTaskTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
        textTransform: 'uppercase',
    },
    clearTaskBtn: {
        padding: 2,
    },
    activeTaskTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        lineHeight: 22,
    },
    taskMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    badgeCourse: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeCourseText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0284C7',
    },
    badgeTopic: {
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeTopicText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9333EA',
    },
    badgeGoal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        gap: 4,
    },
    badgeGoalText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#475569',
    },
    markDoneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 8,
        marginTop: 12,
        gap: 6,
    },
    markDoneBtnCompleted: {
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
    },
    markDoneText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    markDoneTextCompleted: {
        color: '#059669',
    },
    selectTaskPromptCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    selectTaskPromptLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    selectTaskIconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectTaskPromptTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    selectTaskPromptSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 1,
    },
    presetsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    presetChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    presetChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    timerDisplayWrapper: {
        width: 240,
        height: 240,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    svgCircle: {
        position: 'absolute',
    },
    timerCenterContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    modePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
        marginBottom: 6,
    },
    modePillText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    timeDigit: {
        fontSize: 52,
        fontWeight: '800',
        color: '#0F172A',
        fontVariant: ['tabular-nums'],
        letterSpacing: -1,
    },
    timerSubStatus: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94A3B8',
        marginTop: 2,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginTop: 24,
    },
    secondaryBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    primaryPlayBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    endEarlyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 18,
        gap: 6,
    },
    endEarlyBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563EB',
    },
    addFiveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 12,
        gap: 4,
    },
    addFiveText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 8,
    },
    statInfo: {
        flex: 1,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: '#E2E8F0',
        alignSelf: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '75%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalList: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    emptyTaskModal: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 36,
    },
    emptyTaskModalText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 10,
    },
    emptyTaskModalSub: {
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 4,
    },
    taskPickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    taskPickerItemLeft: {
        flex: 1,
        marginRight: 10,
    },
    taskPickerItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    taskPickerItemMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 3,
    },
    taskPickerCourse: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2563EB',
    },
    taskPickerTopic: {
        fontSize: 11,
        color: '#64748B',
    },
});

export default FocusScreen;
