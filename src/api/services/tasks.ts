import client from '../client';
import { handleApiError } from '../error';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types';

// In-memory typed mock fixture fallback (in case backend /tasks endpoint is offline/mocked)
let mockTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Complete Trigonometry Problem Set',
        courseName: 'Mathematics',
        topicName: 'Trigonometry & Unit Circle',
        source: 'Advanced Math Question Bank',
        goal: '30 Questions',
        dueDate: new Date().toISOString().split('T')[0], // Today
        isFlexible: false,
        status: 'pending',
        completed: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-2',
        title: 'Newtonian Mechanics Review',
        courseName: 'Physics',
        topicName: 'Dynamics & Friction',
        source: 'Physics Textbook Ch. 4',
        goal: 'Review summary + 15 problems',
        dueDate: new Date().toISOString().split('T')[0], // Today
        isFlexible: false,
        assignerId: 'mentor-101',
        assignerName: 'Sarah Mentor',
        status: 'pending',
        completed: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-3',
        title: 'English Reading Comprehension Drill',
        courseName: 'English',
        topicName: 'Passage Analysis',
        source: 'Practice Test #3',
        goal: '2 full reading passages',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Upcoming (+2 days)
        isFlexible: false,
        status: 'pending',
        completed: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-4',
        title: 'Chemistry Periodic Trends Summary Notes',
        courseName: 'Chemistry',
        topicName: 'Atomic Structure & Trends',
        source: 'Lecture Notes',
        goal: 'Mind map & summary sheet',
        isFlexible: true,
        status: 'pending',
        completed: false,
        createdAt: new Date().toISOString(),
    },
];

export const getTasks = async (): Promise<Task[]> => {
    try {
        const response = await client.get<{ data: Task[] } | Task[]>('/tasks');
        const tasks = Array.isArray(response.data) ? response.data : response.data.data;
        return tasks;
    } catch (error) {
        // If network/endpoint error, fallback to mock tasks for seamless mobile dev experience
        console.warn('API /tasks request failed, utilizing local typed task fixtures:', error);
        return [...mockTasks];
    }
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
    try {
        const response = await client.post<{ data: Task } | Task>('/tasks', payload);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks create failed, saving to local typed state:', error);
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
        mockTasks = [newTask, ...mockTasks];
        return newTask;
    }
};

export const updateTask = async (payload: UpdateTaskPayload): Promise<Task> => {
    try {
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${payload.id}`, payload);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks update failed, updating local typed state:', error);
        const index = mockTasks.findIndex(t => t.id === payload.id);
        if (index !== -1) {
            mockTasks[index] = {
                ...mockTasks[index],
                ...payload,
                updatedAt: new Date().toISOString(),
            };
            return mockTasks[index];
        }
        throw handleApiError(error);
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
        console.warn('API /tasks toggle failed, toggling in local typed state:', error);
        const index = mockTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            mockTasks[index] = {
                ...mockTasks[index],
                completed,
                status: completed ? 'completed' : 'pending',
                updatedAt: new Date().toISOString(),
            };
            return mockTasks[index];
        }
        throw handleApiError(error);
    }
};

export const archiveTask = async (taskId: string): Promise<Task> => {
    try {
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${taskId}/archive`);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks archive failed, archiving in local typed state:', error);
        const index = mockTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            mockTasks[index] = {
                ...mockTasks[index],
                status: 'archived',
                updatedAt: new Date().toISOString(),
            };
            return mockTasks[index];
        }
        throw handleApiError(error);
    }
};

export const unarchiveTask = async (taskId: string): Promise<Task> => {
    try {
        const response = await client.patch<{ data: Task } | Task>(`/tasks/${taskId}/unarchive`);
        const task = (response.data as { data?: Task }).data || (response.data as Task);
        return task;
    } catch (error) {
        console.warn('API /tasks unarchive failed, unarchiving in local typed state:', error);
        const index = mockTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            mockTasks[index] = {
                ...mockTasks[index],
                status: mockTasks[index].completed ? 'completed' : 'pending',
                updatedAt: new Date().toISOString(),
            };
            return mockTasks[index];
        }
        throw handleApiError(error);
    }
};
