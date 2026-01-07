import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components';
import { lightTheme } from '../../theme/theme';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

const PomodoroScreen = () => {
    const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [logs, setLogs] = useState<{ start: string; end: string }[]>([]);
    const [startTime, setStartTime] = useState<string | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Switch mode
            if (mode === 'focus') {
                const endTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (startTime) {
                    setLogs(prev => [{ start: startTime, end: endTime }, ...prev]);
                    setStartTime(null);
                }
                setMode('break');
                setTimeLeft(BREAK_TIME);
            } else {
                setMode('focus');
                setTimeLeft(FOCUS_TIME);
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode, startTime]);

    const toggleTimer = () => {
        if (!isActive && mode === 'focus' && timeLeft === FOCUS_TIME) {
            setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setStartTime(null);
        setTimeLeft(mode === 'focus' ? FOCUS_TIME : BREAK_TIME);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container]}>
            <Text style={styles.title}>{mode === 'focus' ? 'Focus Time' : 'Break Time'}</Text>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

            <View style={styles.controls}>
                <Button
                    mode="contained"
                    onPress={toggleTimer}
                    style={styles.buttonSpy}
                >
                    {isActive ? 'Pause' : 'Start'}
                </Button>

                <Button
                    mode="contained"
                    onPress={resetTimer}
                    buttonColor={lightTheme.colors.tertiary as string}
                    style={styles.buttonSpy}
                >
                    Reset
                </Button>
            </View>

            <View style={styles.logContainer}>
                <Text style={styles.logTitle}>Recent Sessions</Text>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logItem}>
                        🍅 Focus: {log.start} - {log.end}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    timer: {
        fontSize: 80,
        fontWeight: '200',
        color: '#333',
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 40,
    },
    buttonSpy: {
        minWidth: 120,
    },
    logContainer: {
        marginTop: 40,
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    logItem: {
        fontSize: 16,
        color: '#666',
        marginVertical: 4,
        textAlign: 'center',
    },
});

export default PomodoroScreen;
