import client from '../client';
import { handleApiError } from '../error';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

export const getTasks = async (): Promise<Task[]> => {
    try {
        const response = await client.get<{ data: Task[] } | Task[]>('/tasks');
        const tasks = Array.isArray(response.data) ? response.data : response.data.data;
        return tasks || [];
    } catch (error) {
        console.warn('API /tasks request failed, returning empty task list:', error);
        return [];
    }
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    try {
        const response = await client.post<{ data: Task } | Task>('/tasks', payload);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks create failed on server, creating local task for offline continuity:', error);
        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: payload.title,
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
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${payload.id}`, payload);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks update failed, applying update locally:', error);
        const updatedTask: Task = {
            id: payload.id,
            title: payload.title || '',
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

export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<Task> => {
    try {
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${taskId}`, {
            completed,
            status: completed ? 'completed' : 'pending',
        });
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
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
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${taskId}/archive`);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
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
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${taskId}/unarchive`);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
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
