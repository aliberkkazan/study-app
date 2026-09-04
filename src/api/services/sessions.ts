import client from '../client';
import { StudySession, CreateSessionPayload, SessionStats, SubjectDistribution } from '../types';
import { getLanguage } from '../../utils/i18n';

const COURSE_COLORS = [
    '#3B82F6', // Blue (Math)
    '#10B981', // Green (Physics)
    '#8B5CF6', // Purple (Chemistry)
    '#F59E0B', // Amber (Biology)
    '#EC4899', // Pink (English)
    '#06B6D4', // Cyan
    '#64748B', // Slate
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

        const cName = s.courseName || (getLanguage() === 'tr' ? 'Genel Çalışma' : 'General');
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

const mapBackendSessionToFrontend = (item: any): StudySession => {
    if (!item) return {} as StudySession;
    const correctCount = item.result?.correctCount ?? item.correctCount ?? 0;
    const incorrectCount = item.result?.wrongCount ?? item.incorrectCount ?? 0;
    const questionsSolved = item.result ? (correctCount + incorrectCount) : (item.questionsSolved ?? (correctCount + incorrectCount));

    return {
        id: item.id || `session-${Date.now()}`,
        taskId: item.task?.id || item.taskId,
        taskTitle: item.task?.title || item.taskTitle || (item.task?.subject ? `${item.task.subject}` : 'Çalışma Oturumu'),
        courseName: item.task?.subject || item.courseName || 'Genel',
        topicName: item.task?.topic || item.topicName,
        durationMinutes: item.actualDuration ?? item.targetDuration ?? item.durationMinutes ?? 0,
        startedAt: item.startTime ? new Date(item.startTime).toISOString() : (item.startedAt || new Date().toISOString()),
        endedAt: item.endTime ? new Date(item.endTime).toISOString() : (item.endedAt || new Date().toISOString()),
        questionsSolved,
        correctCount,
        incorrectCount,
        notes: item.result?.notes || item.notes,
        mood: item.mood,
        proofPhotoUri: item.proofPhotoUri,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
    };
};

export const getSessions = async (): Promise<StudySession[]> => {
    try {
        const response = await client.get<{ data: any[] } | any[]>('/study-sessions');
        const rawList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return rawList.map(mapBackendSessionToFrontend);
    } catch (error) {
        console.warn('API /study-sessions fetch failed, returning empty session list:', error);
        return [];
    }
};

export const getStudyProgress = async (timeframe: string = 'week'): Promise<any> => {
    try {
        const response = await client.get(`/study-sessions/progress?timeframe=${timeframe}`);
        return response.data;
    } catch (error) {
        console.warn('API /study-sessions/progress fetch failed:', error);
        return null;
    }
};

export const createStudySession = async (payload: CreateSessionPayload): Promise<StudySession> => {
    try {
        const response = await client.post<{ data: StudySession } | StudySession>('/sessions', payload);
        const data = (response.data as { data?: StudySession }).data || (response.data as StudySession);
        return data;
    } catch (error) {
        console.warn('API /sessions create failed on server, creating local session for offline continuity:', error);
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
        return newSession;
    }
};
