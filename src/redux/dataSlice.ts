import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../api/client';
import { Alert } from 'react-native';

export interface TestSubmission {
  id: string;
  student: { id: string; name: string; email: string };
  imageUrl: string;
  createdAt: string;
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
  student: { id: string; name: string };
  mentor: { id: string; name: string };
}

export interface ConnectionRequest {
  id: string;
  student: { id: string; name: string };
  mentor?: { id: string; name: string };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
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
            const response = await client.post('/users/requests', { code });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send request');
        }
    }
);

export const fetchConnectionRequests = createAsyncThunk(
    'data/fetchConnectionRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/users/requests/pending');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
        }
    }
);

export const respondToConnectionRequest = createAsyncThunk(
    'data/respondToConnectionRequest',
    async (data: { id: string; status: 'approved' | 'rejected' }, { rejectWithValue }) => {
        try {
            const response = await client.patch(`/users/requests/${data.id}`, data);
            return response.data;
        } catch (error: any) {
             return rejectWithValue(error.response?.data?.message || 'Failed to respond to request');
        }
    }
);

export const fetchPrograms = createAsyncThunk('data/fetchPrograms', async (_, { rejectWithValue }) => {
    try {
        const response = await client.get('/programs');
        // Sort by date if present
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch programs');
    }
});

export const addProgramItem = createAsyncThunk(
    'data/addProgram',
    async (task: { title: string; description: string; studentId: string; mentorId: string; scheduledDate?: string; dueDate?: string }, { rejectWithValue }) => {
        try {
            const response = await client.post('/programs', task);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add program');
        }
    }
);

export const updateProgramItem = createAsyncThunk(
    'data/updateProgram',
    async (task: { id: string; title: string; description: string; scheduledDate?: string; dueDate?: string }, { rejectWithValue }) => {
        try {
            const response = await client.patch(`/programs/${task.id}`, task);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update program');
        }
    }
);

export const toggleProgramCompletion = createAsyncThunk('data/toggleCompletion', async (id: string, { getState, rejectWithValue }) => {
     try {
        const state = getState() as { data: DataState };
        const program = state.data.program.find(p => p.id === id);
        if (!program) throw new Error('Program not found');

        const response = await client.patch(`/programs/${id}`, { completed: !program.completed });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update program');
    }
});

export const fetchSubmissions = createAsyncThunk('data/fetchSubmissions', async (_, { rejectWithValue }) => {
    try {
        const response = await client.get('/submissions');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
    }
});

export const addSubmission = createAsyncThunk('data/addSubmission', async (submission: { imageUrl: string; studentId: string }, { rejectWithValue }) => {
    try {
        const response = await client.post('/submissions', submission);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add submission');
    }
});

export const reviewSubmission = createAsyncThunk('data/reviewSubmission', async (data: { id: string; status: 'approved' | 'rejected'; feedback?: string }, { rejectWithValue }) => {
    try {
        const response = await client.patch(`/submissions/${data.id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to review submission');
    }
});

export const fetchStudents = createAsyncThunk('data/fetchStudents', async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as { auth: { user: { id: string; role: string } } };
        const user = state.auth.user;
        
        let url = '/users?role=student';
        if (user && user.role === 'mentor') {
            url += `&mentorId=${user.id}`;
        }
        
        const response = await client.get(url);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
});


export const removeStudent = createAsyncThunk(
    'data/removeStudent',
    async (studentId: string, { rejectWithValue }) => {
        try {
            await client.delete(`/users/students/${studentId}`);
            return { id: studentId };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove student');
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
        .addCase(addSubmission.fulfilled, (state, action) => {
            state.submissions.push(action.payload);
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
