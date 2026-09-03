import client from '../client';
import { StudySession, CreateSessionPayload, SessionStats, SubjectDistribution } from '../types';

const COURSE_COLORS = [
    '#3B82F6', // Blue (Math)
    '#10B981', // Green (Physics)
    '#8B5CF6', // Purple (Chemistry)
    '#F59E0B', // Amber (Biology)
    '#EC4899', // Pink (English)
    '#06B6D4', // Cyan
    '#64748B', // Slate
];

// Initial mock fixtures for seamless offline / frontend execution
let mockSessions: StudySession[] = [
    {
        id: 'session-1',
        taskTitle: 'Complete Trigonometry Problem Set',
        courseName: 'Mathematics',
        topicName: 'Trigonometry & Unit Circle',
        durationMinutes: 25,
        startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        endedAt: new Date(Date.now() - 3600000 * 2 + 1500000).toISOString(),
        questionsSolved: 20,
        correctCount: 18,
        incorrectCount: 2,
        notes: 'Felt confident with double angle formulas!',
        mood: 'great',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
        id: 'session-2',
        taskTitle: 'Newtonian Mechanics Review',
        courseName: 'Physics',
        topicName: 'Dynamics & Friction',
        durationMinutes: 45,
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        endedAt: new Date(Date.now() - 86400000 + 2700000).toISOString(),
        questionsSolved: 15,
        correctCount: 12,
        incorrectCount: 3,
        notes: 'Inclined plane friction questions were tricky.',
        mood: 'good',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 'session-3',
        taskTitle: 'English Reading Comprehension Drill',
        courseName: 'English',
        topicName: 'Passage Analysis',
        durationMinutes: 30,
        startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        endedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
        questionsSolved: 10,
        correctCount: 9,
        incorrectCount: 1,
        notes: 'Good timing on literature passage.',
        mood: 'great',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
];

/**
 * Calculates aggregated session statistics from a list of sessions
 */
export const calculateStats = (sessions: StudySession[]): SessionStats => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 7 * 86400000;

    let dailyTotalMinutes = 0;
    let weeklyTotalMinutes = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    const courseMinutesMap: Record<string, number> = {};

    sessions.forEach((s) => {
        const sessionTime = new Date(s.startedAt).getTime();
        const duration = s.durationMinutes || 0;

        if (sessionTime >= todayStart) {
            dailyTotalMinutes += duration;
        }
        if (sessionTime >= weekStart) {
            weeklyTotalMinutes += duration;
        }

        if (s.questionsSolved) totalQuestions += s.questionsSolved;
        if (s.correctCount) totalCorrect += s.correctCount;
        if (s.incorrectCount) totalIncorrect += s.incorrectCount;

        const cName = s.courseName || 'General';
        courseMinutesMap[cName] = (courseMinutesMap[cName] || 0) + duration;
    });

    const totalTrackedMinutes = Object.values(courseMinutesMap).reduce((a, b) => a + b, 0);

    const subjectDistribution: SubjectDistribution[] = Object.entries(courseMinutesMap).map(
        ([courseName, mins], idx) => ({
            courseName,
            totalMinutes: mins,
            percentage: totalTrackedMinutes > 0 ? Math.round((mins / totalTrackedMinutes) * 100) : 0,
            color: COURSE_COLORS[idx % COURSE_COLORS.length],
        })
    );

    const accuracyRate =
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
        dailyTotalMinutes,
        weeklyTotalMinutes,
        totalQuestionsSolved: totalQuestions,
        totalCorrect,
        totalIncorrect,
        accuracyRate,
        totalSessionsCount: sessions.length,
        subjectDistribution,
    };
};

export const getSessions = async (): Promise<StudySession[]> => {
    try {
        const response = await client.get<{ data: StudySession[] } | StudySession[]>('/sessions');
        const data = Array.isArray(response.data) ? response.data : response.data.data;
        return data;
    } catch (error) {
        console.warn('API /sessions fetch failed, using local sessions state:', error);
        return [...mockSessions];
    }
};

export const createStudySession = async (payload: CreateSessionPayload): Promise<StudySession> => {
    try {
        const response = await client.post<{ data: StudySession } | StudySession>('/sessions', payload);
        const data = (response.data as { data?: StudySession }).data || (response.data as StudySession);
        return data;
    } catch (error) {
        console.warn('API /sessions create failed, persisting to local sessions state:', error);
        const newSession: StudySession = {
            id: `session-${Date.now()}`,
            taskId: payload.taskId,
            taskTitle: payload.taskTitle,
            courseName: payload.courseName,
            topicName: payload.topicName,
            durationMinutes: payload.durationMinutes,
            startedAt: payload.startedAt,
            endedAt: payload.endedAt,
            questionsSolved: payload.questionsSolved,
            correctCount: payload.correctCount,
            incorrectCount: payload.incorrectCount,
            notes: payload.notes,
            mood: payload.mood,
            proofPhotoUri: payload.proofPhotoUri,
            createdAt: new Date().toISOString(),
        };
        mockSessions = [newSession, ...mockSessions];
        return newSession;
    }
};
