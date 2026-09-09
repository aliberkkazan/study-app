import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import { handleApiError } from '../api/error';

export interface TestSubmission {
  id: string;
  student: { id: string; name: string; email: string };
  imageUrl: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface ProgramItem {
  id: string;
  title: string;
  description: string;
  dueDate?: string; // Optional now
  scheduledDate?: string;
  completed: boolean;
  student?: { id: string; name: string };
  mentor?: { id: string; name: string };
}

export interface ConnectionRequest {
  id: string;
  student: { id: string; name: string };
  mentor?: { id: string; name: string };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface DataState {
  submissions: TestSubmission[];
  program: ProgramItem[];
  students: { id: string; name: string; email: string }[];
  connectionRequests: ConnectionRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  submissions: [],
  program: [],
  students: [],
  connectionRequests: [],
  loading: false,
  error: null,
};

// Async Thunks
export const sendConnectionRequest = createAsyncThunk(
    'data/sendConnectionRequest',
    async (code: string, { rejectWithValue }) => {
        try {
            const response = await client.post('/users/request', { code });
            return response.data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const fetchConnectionRequests = createAsyncThunk(
    'data/fetchConnectionRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/users/requests');
            return response.data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const respondToConnectionRequest = createAsyncThunk(
    'data/respondToConnectionRequest',
    async (data: { id: string; status: 'approved' | 'rejected' }, { rejectWithValue }) => {
        try {
            const response = await client.patch(`/users/request/${data.id}`, data);
            return response.data;
        } catch (error: unknown) {
            const appError = handleApiError(error);
             return rejectWithValue(appError.message);
        }
    }
);

export const fetchPrograms = createAsyncThunk('data/fetchPrograms', async (params: { studentId?: string } | void, { getState, rejectWithValue }) => {
    try {
        const state = getState() as { auth: { user: { id: string; role: string } } };
        const user = state.auth.user;
        
        const queryParams: Record<string, string> = {};
        if (params && params.studentId) {
            queryParams.studentId = params.studentId;
        } else if (user && user.role === 'student') {
            queryParams.studentId = user.id;
        }

        const response = await client.get('/tasks', { params: queryParams });
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return data.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description || t.targetOutcome || '',
            dueDate: t.dueDate,
            scheduledDate: t.scheduledDate,
            completed: !!t.completed,
            student: t.owner
                ? { id: t.owner.id, name: t.owner.name || '' }
                : t.student
                ? { id: t.student.id, name: t.student.name || '' }
                : (t.owner_id ? { id: t.owner_id, name: '' } : undefined),
            mentor: t.assignedBy
                ? { id: t.assignedBy.id, name: t.assignedBy.name || '' }
                : t.mentor
                ? { id: t.mentor.id, name: t.mentor.name || '' }
                : (t.assigned_by ? { id: t.assigned_by, name: '' } : undefined),
        }));
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});

export const addProgramItem = createAsyncThunk(
    'data/addProgram',
    async (task: { title: string; description: string; studentId: string; mentorId: string; scheduledDate?: string; dueDate?: string }, { rejectWithValue }) => {
        try {
            const response = await client.post('/tasks', {
                title: task.title,
                description: task.description,
                studentId: task.studentId,
                scheduledDate: task.scheduledDate,
                dueDate: task.dueDate,
            });
            const t = (response.data as any)?.data || response.data;
            return {
                id: t.id,
                title: t.title,
                description: t.description || t.targetOutcome || '',
                dueDate: t.dueDate,
                scheduledDate: t.scheduledDate,
                completed: !!t.completed,
                student: t.owner
                    ? { id: t.owner.id, name: t.owner.name || '' }
                    : { id: task.studentId, name: '' },
                mentor: t.assignedBy
                    ? { id: t.assignedBy.id, name: t.assignedBy.name || '' }
                    : { id: task.mentorId, name: '' },
            };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const updateProgramItem = createAsyncThunk(
    'data/updateProgram',
    async (task: { id: string; title: string; description: string; scheduledDate?: string; dueDate?: string }, { rejectWithValue }) => {
        try {
            const response = await client.patch(`/tasks/${task.id}`, {
                title: task.title,
                description: task.description,
                scheduledDate: task.scheduledDate,
                dueDate: task.dueDate,
            });
            const t = (response.data as any)?.data || response.data;
            return {
                id: t.id,
                title: t.title,
                description: t.description || t.targetOutcome || '',
                dueDate: t.dueDate,
                scheduledDate: t.scheduledDate,
                completed: !!t.completed,
                student: t.owner
                    ? { id: t.owner.id, name: t.owner.name || '' }
                    : t.student
                    ? { id: t.student.id, name: t.student.name || '' }
                    : undefined,
                mentor: t.assignedBy
                    ? { id: t.assignedBy.id, name: t.assignedBy.name || '' }
                    : t.mentor
                    ? { id: t.mentor.id, name: t.mentor.name || '' }
                    : undefined,
            };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const toggleProgramCompletion = createAsyncThunk('data/toggleCompletion', async (id: string, { getState, rejectWithValue }) => {
     try {
        const state = getState() as { data: DataState };
        const program = state.data.program.find(p => p.id === id);
        if (!program) throw new Error('Program not found');

        const response = await client.patch(`/tasks/${id}`, { completed: !program.completed });
        return response.data;
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});

export const deleteProgramItem = createAsyncThunk(
    'data/deleteProgramItem',
    async (id: string, { rejectWithValue }) => {
        try {
            await client.delete(`/tasks/${id}`);
            return { id };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const fetchSubmissions = createAsyncThunk('data/fetchSubmissions', async (_, { rejectWithValue }) => {
    try {
        const response = await client.get('/submissions');
        return response.data;
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});

export const addSubmission = createAsyncThunk('data/addSubmission', async (submission: { imageUrl: string; studentId: string }, { rejectWithValue }) => {
    try {
        const response = await client.post('/submissions', submission);
        return response.data;
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});

export const reviewSubmission = createAsyncThunk('data/reviewSubmission', async (data: { id: string; status: 'approved' | 'rejected'; feedback?: string }, { rejectWithValue }) => {
    try {
        const response = await client.patch(`/submissions/${data.id}`, data);
        return response.data;
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});

export const fetchStudents = createAsyncThunk('data/fetchStudents', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as { auth: { user: { id: string; role: string } } };
        const user = state.auth.user;
        
        if (!user || user.role !== 'mentor') {
            return [];
        }
        
        const response = await client.get(`/users?role=student&mentorId=${user.id}`);
        const data = Array.isArray(response.data) ? response.data : [];
        return data.filter((s: any) => s.id !== user.id);
    } catch (error: unknown) {
        const appError = handleApiError(error);
        return rejectWithValue(appError.message);
    }
});


export const removeStudent = createAsyncThunk(
    'data/removeStudent',
    async (studentId: string, { rejectWithValue }) => {
        try {
            await client.delete(`/users/students/${studentId}`);
            return { id: studentId };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Programs
    builder
        .addCase(fetchPrograms.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchPrograms.fulfilled, (state, action) => {
            state.loading = false;
            state.program = action.payload;
        })
        .addCase(fetchPrograms.rejected, (state, action) => {
             state.loading = false;
             state.error = action.payload as string;
        })
        .addCase(addProgramItem.fulfilled, (state, action) => {
            state.program.push(action.payload);
        })
        .addCase(updateProgramItem.fulfilled, (state, action) => {
             const index = state.program.findIndex(p => p.id === action.payload.id);
             if (index !== -1) {
                 state.program[index] = action.payload;
             }
        })
        .addCase(toggleProgramCompletion.fulfilled, (state, action) => {
            const index = state.program.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.program[index] = action.payload; // Update the specific item
            }
        })
        .addCase(deleteProgramItem.fulfilled, (state, action) => {
            state.program = state.program.filter(p => p.id !== action.payload.id);
        })

    // Submissions
    builder
        .addCase(fetchSubmissions.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchSubmissions.fulfilled, (state, action) => {
            state.loading = false;
            state.submissions = action.payload;
        })
        .addCase(addSubmission.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addSubmission.fulfilled, (state, action) => {
            state.loading = false;
            state.submissions.push(action.payload);
        })
        .addCase(addSubmission.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(reviewSubmission.fulfilled, (state, action) => {
            const index = state.submissions.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.submissions[index] = action.payload;
            }
        })
        
        // Students
        .addCase(fetchStudents.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchStudents.fulfilled, (state, action) => {
            state.loading = false;
            state.students = action.payload;
        })
        .addCase(removeStudent.fulfilled, (state, action) => {
             state.students = state.students.filter(s => s.id !== action.payload.id);
        })
        .addCase(fetchStudents.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })

        // Requests
        .addCase(sendConnectionRequest.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(sendConnectionRequest.fulfilled, (state) => { state.loading = false; })
        .addCase(sendConnectionRequest.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

        .addCase(fetchConnectionRequests.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(fetchConnectionRequests.fulfilled, (state, action) => {
            state.loading = false;
            state.connectionRequests = action.payload;
        })
        .addCase(fetchConnectionRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

        .addCase(respondToConnectionRequest.fulfilled, (state, action) => {
             // Remove from list
             state.connectionRequests = state.connectionRequests.filter(r => r.id !== action.payload.id);
             // If approved, we might want to refetch students, but for now just removing request is enough
        });
  },
});

export default dataSlice.reducer;
