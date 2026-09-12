import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Vibration } from 'react-native';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface UseFocusTimerOptions {
    initialMode?: TimerMode;
    initialMinutes?: number;
    onTimerComplete?: (mode: TimerMode, durationMinutes: number, startedAt: string) => void;
}

export interface UseFocusTimerReturn {
    mode: TimerMode;
    selectedMinutes: number;
    totalDuration: number;
    timeLeft: number;
    isRunning: boolean;
    progress: number;
    formattedTime: string;
    sessionStartedAt: string | null;
    changeMode: (newMode: TimerMode, customMins?: number) => void;
    togglePlayPause: () => void;
    resetTimer: () => void;
    addTime: (seconds: number) => void;
    skipSession: () => void;
    endSessionEarly: () => { elapsedMinutes: number; startedAt: string };
}

export const useFocusTimer = ({
    initialMode = 'focus',
    initialMinutes = 25,
    onTimerComplete,
}: UseFocusTimerOptions = {}): UseFocusTimerReturn => {
    const [mode, setMode] = useState<TimerMode>(initialMode);
    const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
    const [totalDuration, setTotalDuration] = useState(initialMinutes * 60);
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const backgroundTimeRef = useRef<number | null>(null);
    const sessionStartedAtRef = useRef<string | null>(null);
    const onTimerCompleteRef = useRef(onTimerComplete);

    useEffect(() => {
        onTimerCompleteRef.current = onTimerComplete;
    }, [onTimerComplete]);

    const handleCompletion = useCallback(() => {
        try {
            Vibration.vibrate([0, 500, 200, 500]);
        } catch {
            // Safe vibration fallback
        }

        const startedAt =
            sessionStartedAtRef.current ||
            new Date(Date.now() - totalDuration * 1000).toISOString();

        if (onTimerCompleteRef.current) {
            onTimerCompleteRef.current(mode, selectedMinutes, startedAt);
        }
    }, [mode, selectedMinutes, totalDuration]);

    // AppState Lifecycle Management for reliable background elapsed time tracking
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                // Returned to foreground
                if (backgroundTimeRef.current && isRunning) {
                    const elapsedSecs = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
                    setTimeLeft((prev) => {
                        if (prev <= elapsedSecs) {
                            setIsRunning(false);
                            handleCompletion();
                            return 0;
                        }
                        return prev - elapsedSecs;
                    });
                }
                backgroundTimeRef.current = null;
            } else if (nextAppState.match(/inactive|background/)) {
                // App went to background
                if (isRunning) {
                    backgroundTimeRef.current = Date.now();
                }
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isRunning, handleCompletion]);

    // Timer Interval Management
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsRunning(false);
                        handleCompletion();
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
    }, [isRunning, handleCompletion]);

    const changeMode = useCallback((newMode: TimerMode, customMins?: number) => {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);

        const mins =
            customMins ?? (newMode === 'focus' ? 25 : newMode === 'shortBreak' ? 5 : 15);
        setMode(newMode);
        setSelectedMinutes(mins);
        const durationSecs = mins * 60;
        setTotalDuration(durationSecs);
        setTimeLeft(durationSecs);
        sessionStartedAtRef.current = null;
    }, []);

    const togglePlayPause = useCallback(() => {
        if (timeLeft === 0) {
            setTimeLeft(totalDuration);
        }
        if (!isRunning && !sessionStartedAtRef.current) {
            sessionStartedAtRef.current = new Date().toISOString();
        }
        setIsRunning((prev) => !prev);
    }, [timeLeft, totalDuration, isRunning]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(totalDuration);
        sessionStartedAtRef.current = null;
    }, [totalDuration]);

    const addTime = useCallback((seconds: number) => {
        setTimeLeft((prev) => prev + seconds);
        setTotalDuration((prev) => Math.max(prev, timeLeft + seconds));
    }, [timeLeft]);

    const skipSession = useCallback(() => {
        setIsRunning(false);
        if (mode === 'focus') {
            changeMode('shortBreak', 5);
        } else {
            changeMode('focus', 25);
        }
    }, [mode, changeMode]);

    const endSessionEarly = useCallback(() => {
        setIsRunning(false);
        const elapsedSecs = totalDuration - timeLeft;
        const elapsedMins = Math.max(1, Math.round(elapsedSecs / 60));
        const startedAt =
            sessionStartedAtRef.current ||
            new Date(Date.now() - elapsedSecs * 1000).toISOString();

        return { elapsedMinutes: elapsedMins, startedAt };
    }, [totalDuration, timeLeft]);

    const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    return {
        mode,
        selectedMinutes,
        totalDuration,
        timeLeft,
        isRunning,
        progress,
        formattedTime,
        sessionStartedAt: sessionStartedAtRef.current,
        changeMode,
        togglePlayPause,
        resetTimer,
        addTime,
        skipSession,
        endSessionEarly,
    };
};
