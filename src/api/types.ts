export interface ApiErrorResponse {
    message: string;
    code: string;
    details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export type TaskStatus = 'pending' | 'completed' | 'archived';

export type TaskCategory = 'today' | 'upcoming' | 'flexible' | 'archived';

export interface Task {
    id: string;
    title: string;
    courseId?: string;
    courseName?: string;
    topicId?: string;
    topicName?: string;
    source?: string;
    goal?: string;
    dueDate?: string; // YYYY-MM-DD or ISO string. If null/undefined, it is flexible.
    isFlexible?: boolean;
    assignerId?: string;
    assignerName?: string;
    status: TaskStatus;
    completed: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateTaskPayload {
    title: string;
    courseName?: string;
    topicName?: string;
    source?: string;
    goal?: string;
    dueDate?: string;
    isFlexible?: boolean;
}

export interface UpdateTaskPayload {
    id: string;
    title?: string;
    courseName?: string;
    topicName?: string;
    source?: string;
    goal?: string;
    dueDate?: string;
    isFlexible?: boolean;
    completed?: boolean;
    status?: TaskStatus;
}

export type SessionMood = 'great' | 'good' | 'tired' | 'neutral';

export interface StudySession {
    id: string;
    taskId?: string;
    taskTitle?: string;
    courseName?: string;
    topicName?: string;
    durationMinutes: number;
    startedAt: string; // ISO string
    endedAt: string;   // ISO string
    questionsSolved?: number;
    correctCount?: number;
    incorrectCount?: number;
    notes?: string;
    mood?: SessionMood;
    proofPhotoUri?: string;
    createdAt: string;
}

export interface CreateSessionPayload {
    taskId?: string;
    taskTitle?: string;
    courseName?: string;
    topicName?: string;
    durationMinutes: number;
    startedAt: string;
    endedAt: string;
    questionsSolved?: number;
    correctCount?: number;
    incorrectCount?: number;
    notes?: string;
    mood?: SessionMood;
    proofPhotoUri?: string;
    markTaskCompleted?: boolean;
}

export interface SubjectDistribution {
    courseName: string;
    totalMinutes: number;
    percentage: number;
    color: string;
}

export interface SessionStats {
    dailyTotalMinutes: number;
    weeklyTotalMinutes: number;
    totalQuestionsSolved: number;
    totalCorrect: number;
    totalIncorrect: number;
    accuracyRate: number; // 0-100 %
    totalSessionsCount: number;
    subjectDistribution: SubjectDistribution[];
}

// Accountability & Access Grants
export type AccessScope = 'PARTNER' | 'PARENT' | 'MENTOR' | 'INSTITUTION';
export type AccessGrantStatus = 'INVITED' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface GrantPermissions {
    canAssignTasks?: boolean;
    canViewResults?: boolean;
    canVerifySessions?: boolean;
    canGiveFeedback?: boolean;
}

export interface AccessGrant {
    id: string;
    granterId: string;
    granter?: { id: string; name?: string; email?: string };
    granteeId?: string;
    grantee?: { id: string; name?: string; email?: string };
    scope: AccessScope;
    status: AccessGrantStatus;
    inviteCode: string;
    inviteEmail?: string;
    permissions?: GrantPermissions;
    expiresAt?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateInvitePayload {
    scope?: AccessScope;
    inviteEmail?: string;
    permissions?: Partial<GrantPermissions>;
    expiresAt?: string;
}

export interface CreateInviteResponse extends AccessGrant {
    userExists?: boolean;
    targetUser?: { id: string; name?: string; email?: string } | null;
}

export interface AcceptInvitePayload {
    inviteCode?: string;
    grantId?: string;
}

export interface CreateShareTokenPayload {
    timeframe: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'ALL_TIME';
    durationDays?: number;
}
