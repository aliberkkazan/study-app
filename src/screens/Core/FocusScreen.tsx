import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    Vibration,
    Platform,
    StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { RootState, AppDispatch } from '../../redux/store';
import { setActiveFocusTask, toggleTask } from '../../redux/tasksSlice';
import { Task } from '../../api/types';
import { t } from '../../utils/i18n';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const PRESET_DURATIONS: Record<TimerMode, number[]> = {
    focus: [15, 25, 45, 60],
    shortBreak: [5, 10],
    longBreak: [15, 20, 30],
};

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
};

const FocusScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const activeTask = useSelector((state: RootState) => state.tasks.activeFocusTask);
    const allTasks = useSelector((state: RootState) => state.tasks.items);

    const [mode, setMode] = useState<TimerMode>('focus');
    const [selectedMinutes, setSelectedMinutes] = useState(25);
    const [totalDuration, setTotalDuration] = useState(25 * 60);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [taskPickerVisible, setTaskPickerVisible] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Synchronize timer duration when mode or selected duration changes
    const changeMode = (newMode: TimerMode, customMins?: number) => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);

        const mins = customMins ?? (newMode === 'focus' ? 25 : newMode === 'shortBreak' ? 5 : 15);
        setMode(newMode);
        setSelectedMinutes(mins);
        const durationSecs = mins * 60;
        setTotalDuration(durationSecs);
        setTimeLeft(durationSecs);
    };

    // Timer Interval Management
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsRunning(false);
                        handleTimerCompletion();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, mode]);

    const handleTimerCompletion = () => {
        try {
            Vibration.vibrate([0, 500, 200, 500]);
        } catch {
            // Safe fallback
        }

        if (mode === 'focus') {
            setCompletedSessions((prev) => prev + 1);
            Alert.alert(
                '🎉 Focus Session Completed!',
                'Fantastic job staying concentrated! Take a well-deserved break now.',
                [
                    {
                        text: 'Take 5m Break',
                        onPress: () => changeMode('shortBreak', 5),
                    },
                    {
                        text: 'Stay on Focus',
                        onPress: () => changeMode('focus', selectedMinutes),
                    },
                ]
            );
        } else {
            Alert.alert(
                '☕ Break Over!',
                'Ready to dive back into your next focus block?',
                [
                    {
                        text: 'Start 25m Focus',
                        onPress: () => changeMode('focus', 25),
                    },
                    {
                        text: 'Dismiss',
                        style: 'cancel',
                    },
                ]
            );
        }
    };

    const togglePlayPause = () => {
        if (timeLeft === 0) {
            setTimeLeft(totalDuration);
        }
        setIsRunning((prev) => !prev);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(totalDuration);
    };

    const addFiveMinutes = () => {
        setTimeLeft((prev) => prev + 300);
        setTotalDuration((prev) => Math.max(prev, timeLeft + 300));
    };

    const skipSession = () => {
        setIsRunning(false);
        if (mode === 'focus') {
            changeMode('shortBreak', 5);
        } else {
            changeMode('focus', 25);
        }
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

    // Format time display MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Circular Progress calculations
    const svgSize = 240;
    const strokeWidth = 10;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;
    const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

    const modeColors = {
        focus: {
            primary: '#2563EB',
            light: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1E40AF',
            ring: '#3B82F6',
            label: 'Focus Session',
            icon: 'flame',
        },
        shortBreak: {
            primary: '#059669',
            light: '#ECFDF5',
            border: '#A7F3D0',
            text: '#065F46',
            ring: '#10B981',
            label: 'Short Break',
            icon: 'cafe',
        },
        longBreak: {
            primary: '#7C3AED',
            light: '#F5F3FF',
            border: '#DDD6FE',
            text: '#5B21B6',
            ring: '#8B5CF6',
            label: 'Long Break',
            icon: 'sunny',
        },
    };

    const currentTheme = modeColors[mode];

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
                            mode === 'focus' && { backgroundColor: '#FFFFFF', shadowOpacity: 0.08 },
                        ]}
                        onPress={() => changeMode('focus', 25)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="flame"
                            size={16}
                            color={mode === 'focus' ? '#2563EB' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                mode === 'focus' && { color: '#1E293B', fontWeight: '700' },
                            ]}
                        >
                            Focus
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeTab,
                            mode === 'shortBreak' && {
                                backgroundColor: '#FFFFFF',
                                shadowOpacity: 0.08,
                            },
                        ]}
                        onPress={() => changeMode('shortBreak', 5)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="cafe"
                            size={16}
                            color={mode === 'shortBreak' ? '#059669' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                mode === 'shortBreak' && { color: '#1E293B', fontWeight: '700' },
                            ]}
                        >
                            Short Break
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.modeTab,
                            mode === 'longBreak' && {
                                backgroundColor: '#FFFFFF',
                                shadowOpacity: 0.08,
                            },
                        ]}
                        onPress={() => changeMode('longBreak', 15)}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="leaf"
                            size={16}
                            color={mode === 'longBreak' ? '#7C3AED' : '#94A3B8'}
                        />
                        <Text
                            style={[
                                styles.modeTabText,
                                mode === 'longBreak' && { color: '#1E293B', fontWeight: '700' },
                            ]}
                        >
                            Long Break
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Active Focused Task Card */}
                {activeTask ? (
                    <View style={styles.activeTaskCard}>
                        <View style={styles.activeTaskTop}>
                            <View style={styles.activeTaskTag}>
                                <Ionicons name="sparkles" size={13} color="#2563EB" />
                                <Text style={styles.activeTaskTagText}>Focused Task</Text>
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
                                    ? 'Completed!'
                                    : 'Mark this task as completed'}
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
                                    Link a Task to Focus On
                                </Text>
                                <Text style={styles.selectTaskPromptSub}>
                                    Select from your scheduled tasks or focus freely
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}

                {/* Duration Presets (Only visible when paused) */}
                {!isRunning && (
                    <View style={styles.presetsRow}>
                        {PRESET_DURATIONS[mode].map((mins) => (
                            <TouchableOpacity
                                key={mins}
                                style={[
                                    styles.presetChip,
                                    selectedMinutes === mins && {
                                        backgroundColor: currentTheme.light,
                                        borderColor: currentTheme.border,
                                    },
                                ]}
                                onPress={() => changeMode(mode, mins)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.presetChipText,
                                        selectedMinutes === mins && {
                                            color: currentTheme.text,
                                            fontWeight: '700',
                                        },
                                    ]}
                                >
                                    {mins} min
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

                        <Text style={styles.timeDigit}>{formatTime(timeLeft)}</Text>

                        <Text style={styles.timerSubStatus}>
                            {isRunning ? 'Session in progress' : 'Ready to start'}
                        </Text>
                    </View>
                </View>

                {/* Primary & Secondary Action Controls */}
                <View style={styles.controlsRow}>
                    {/* Reset Button */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={resetTimer}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={20} color="#64748B" />
                    </TouchableOpacity>

                    {/* Main Start / Pause Button */}
                    <TouchableOpacity
                        style={[
                            styles.primaryPlayBtn,
                            { backgroundColor: isRunning ? '#0F172A' : currentTheme.primary },
                        ]}
                        onPress={togglePlayPause}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name={isRunning ? 'pause' : 'play'}
                            size={28}
                            color="#FFFFFF"
                            style={isRunning ? {} : { marginLeft: 3 }}
                        />
                    </TouchableOpacity>

                    {/* Skip / Next Mode Button */}
                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={skipSession}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="play-forward" size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Quick +5 Mins Pill (When running) */}
                {isRunning && (
                    <TouchableOpacity
                        style={styles.addFiveBtn}
                        onPress={addFiveMinutes}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={14} color="#2563EB" />
                        <Text style={styles.addFiveText}>+5 Minutes</Text>
                    </TouchableOpacity>
                )}

                {/* Daily Progress & Streak Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="checkmark-done-circle" size={22} color="#10B981" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statNumber}>{completedSessions}</Text>
                            <Text style={styles.statLabel}>Rounds Done</Text>
                        </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="time" size={22} color="#3B82F6" />
                        <View style={styles.statInfo}>
                            <Text style={styles.statNumber}>{completedSessions * 25}m</Text>
                            <Text style={styles.statLabel}>Total Focus</Text>
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
                            <Text style={styles.modalTitle}>Choose a Task to Focus On</Text>
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
                                        No pending tasks found.
                                    </Text>
                                    <Text style={styles.emptyTaskModalSub}>
                                        You can still run the focus timer freely!
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
    addFiveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 18,
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
        marginTop: 28,
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
