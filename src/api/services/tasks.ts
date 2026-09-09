import client from '../client';
import { handleApiError } from '../error';
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from '../types';

export const normalizeTask = (raw: any): Task => {
    const assigner = raw.assignedBy || raw.mentor;
    const student = raw.owner || raw.student;

    return {
        id: raw.id,
        title: raw.title || '',
        description: raw.description,
        courseId: raw.courseId,
        courseName: raw.courseName || raw.subject || (assigner ? 'Mentor Görevi' : undefined),
        topicId: raw.topicId,
        topicName: raw.topicName || raw.topic || raw.description || undefined,
        source: raw.source,
        goal: raw.goal || raw.targetOutcome || raw.description,
        dueDate: raw.dueDate || raw.due_date || raw.scheduledDate || raw.scheduled_date,
        isFlexible: raw.isFlexible ?? (!raw.dueDate && !raw.due_date && !raw.scheduledDate && !raw.scheduled_date),
        assignerId: assigner ? assigner.id : (raw.assignerId || undefined),
        assignerName: assigner ? assigner.name : (raw.assignerName || undefined),
        student: student ? { id: student.id, name: student.name } : undefined,
        mentor: assigner ? { id: assigner.id, name: assigner.name } : undefined,
        status: (raw.status || (raw.completed ? 'completed' : 'pending')) as TaskStatus,
        completed: !!raw.completed,
        createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
        updatedAt: raw.updatedAt || raw.updated_at,
    };
};

export const getTasks = async (params?: { studentId?: string; status?: string; subject?: string }): Promise<Task[]> => {
    try {
        const response = await client.get<{ data: any[] } | any[]>('/tasks', { params });
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return list.map(normalizeTask);
    } catch (error) {
        console.warn('API /tasks request failed, returning empty task list:', error);
        return [];
    }
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    try {
        const backendPayload = {
            title: payload.title,
            description: payload.description || payload.goal,
            subject: payload.courseName,
            topic: payload.topicName,
            source: payload.source,
            targetOutcome: payload.goal,
            dueDate: payload.dueDate,
            scheduledDate: payload.scheduledDate || payload.dueDate,
            studentId: payload.studentId,
            assignedBy: payload.assignedBy,
        };
        const response = await client.post<{ data: any } | any>('/tasks', backendPayload);
        const task = (response.data as { data?: any }).data || response.data;
        return normalizeTask(task);
    } catch (error) {
        console.warn('API /tasks create failed on server, creating local task for offline continuity:', error);
        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: payload.title,
            description: payload.description,
            courseName: payload.courseName,
            topicName: payload.topicName,
            source: payload.source,
            goal: payload.goal,
            dueDate: payload.dueDate,
            isFlexible: payload.isFlexible ?? (!payload.dueDate),
            status: 'pending',
            completed: false,
            createdAt: new Date().toISOString(),
        };
        return newTask;
    }
};

export const updateTask = async (payload: UpdateTaskPayload): Promise<Task> => {
    try {
        const backendPayload = {
            title: payload.title,
            description: payload.description || payload.goal,
            subject: payload.courseName,
            topic: payload.topicName,
            source: payload.source,
            targetOutcome: payload.goal,
            dueDate: payload.dueDate,
            scheduledDate: payload.scheduledDate || payload.dueDate,
            completed: payload.completed,
            status: payload.status,
        };
        const response = await client.patch<{ data: any } | any>(`/tasks/${payload.id}`, backendPayload);
        const task = (response.data as { data?: any }).data || response.data;
        return normalizeTask(task);
    } catch (error) {
        console.warn('API /tasks update failed, applying update locally:', error);
        const updatedTask: Task = {
            id: payload.id,
            title: payload.title || '',
            description: payload.description,
            courseName: payload.courseName,
            topicName: payload.topicName,
            source: payload.source,
            goal: payload.goal,
            dueDate: payload.dueDate,
            isFlexible: payload.isFlexible ?? (!payload.dueDate),
            status: payload.status || 'pending',
            completed: payload.completed ?? false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return updatedTask;
    }
};

export const deleteTask = async (taskId: string): Promise<void> => {
    await client.delete(`/tasks/${taskId}`);
};

export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<Task> => {
    try {
        const response = await client.patch<{ data: any } | any>(`/tasks/${taskId}`, {
            completed,
        });
        const task = (response.data as { data?: any }).data || response.data;
        return normalizeTask(task);
    } catch (error) {
        console.warn('API /tasks toggle failed, applying toggle locally:', error);
        const toggledTask: Task = {
            id: taskId,
            title: '',
            status: completed ? 'completed' : 'pending',
            completed,
            isFlexible: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return toggledTask;
    }
};

export const archiveTask = async (taskId: string): Promise<Task> => {
    try {
        const response = await client.delete<{ data: any } | any>(`/tasks/${taskId}`);
        const task = (response.data as { data?: any }).data || response.data;
        return normalizeTask(task || { id: taskId, status: 'archived' });
    } catch (error) {
        console.warn('API /tasks archive failed, applying archive locally:', error);
        const archivedTask: Task = {
            id: taskId,
            title: '',
            status: 'archived',
            completed: false,
            isFlexible: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return archivedTask;
    }
};

export const unarchiveTask = async (taskId: string): Promise<Task> => {
    try {
        const response = await client.patch<{ data: any } | any>(`/tasks/${taskId}`, {
            completed: false,
        });
        const task = (response.data as { data?: any }).data || response.data;
        return normalizeTask(task);
    } catch (error) {
        console.warn('API /tasks unarchive failed, applying unarchive locally:', error);
        const unarchivedTask: Task = {
            id: taskId,
            title: '',
            status: 'pending',
            completed: false,
            isFlexible: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return unarchivedTask;
    }
};
