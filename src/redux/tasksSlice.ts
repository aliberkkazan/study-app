import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskCategory, CreateTaskPayload, UpdateTaskPayload } from '../api/types';
import * as taskService from '../api/services/tasks';
import { handleApiError } from '../api/error';

interface TasksState {
    items: Task[];
    selectedCategory: TaskCategory;
    activeFocusTask: Task | null;
    loading: boolean;
    error: string | null;
}

const initialState: TasksState = {
    items: [],
    selectedCategory: 'today',
    activeFocusTask: null,
    loading: false,
    error: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const data = await taskService.getTasks();
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const addNewTask = createAsyncThunk(
    'tasks/addNewTask',
    async (payload: CreateTaskPayload, { rejectWithValue }) => {
        try {
            const data = await taskService.createTask(payload);
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const updateExistingTask = createAsyncThunk(
    'tasks/updateExistingTask',
    async (payload: UpdateTaskPayload, { rejectWithValue }) => {
        try {
            const data = await taskService.updateTask(payload);
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const toggleTask = createAsyncThunk(
    'tasks/toggleTask',
    async ({ taskId, completed }: { taskId: string; completed: boolean }, { rejectWithValue }) => {
        try {
            const data = await taskService.toggleTaskCompletion(taskId, completed);
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const archiveExistingTask = createAsyncThunk(
    'tasks/archiveTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            const data = await taskService.archiveTask(taskId);
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const unarchiveExistingTask = createAsyncThunk(
    'tasks/unarchiveTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            const data = await taskService.unarchiveTask(taskId);
            return data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<TaskCategory>) => {
            state.selectedCategory = action.payload;
        },
        setActiveFocusTask: (state, action: PayloadAction<Task | null>) => {
            state.activeFocusTask = action.payload;
        },
        clearTaskError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchTasks
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // addNewTask
            .addCase(addNewTask.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNewTask.fulfilled, (state, action: PayloadAction<Task>) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addNewTask.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // updateExistingTask
            .addCase(updateExistingTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.activeFocusTask && state.activeFocusTask.id === action.payload.id) {
                    state.activeFocusTask = action.payload;
                }
            })

            // toggleTask
            .addCase(toggleTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.activeFocusTask && state.activeFocusTask.id === action.payload.id) {
                    state.activeFocusTask = action.payload;
                }
            })

            // archiveExistingTask
            .addCase(archiveExistingTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.activeFocusTask && state.activeFocusTask.id === action.payload.id) {
                    state.activeFocusTask = null;
                }
            })

            // unarchiveExistingTask
            .addCase(unarchiveExistingTask.fulfilled, (state, action: PayloadAction<Task>) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    },
});

export const { setSelectedCategory, setActiveFocusTask, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
