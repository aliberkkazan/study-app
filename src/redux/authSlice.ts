import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import client, { setAuthToken } from '../api/client';
import { Alert } from 'react-native';
import { handleApiError } from '../api/error';
import { saveAuthSession, clearAuthSession, loadAuthSession } from '../utils/authStorage';

interface User {
    id: string;
    name: string;
    role: 'student' | 'mentor' | 'admin';
    email?: string;
    mentorCode?: string;
    mentors?: Record<string, unknown>[];
    hasSwitchedRole?: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    loading: boolean;
    error: string | null;
    isInitialized: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null,
    isInitialized: false,
};

// Async Thunks
export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
    try {
        const session = await loadAuthSession();
        if (session && session.token && session.user) {
            setAuthToken(session.token);
            const userWithId = { ...session.user, id: session.user.id || session.user.sub };
            return { token: session.token, user: userWithId };
        }
        return null;
    } catch (error) {
        return rejectWithValue('Failed to load session');
    }
});

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: Record<string, string>, { rejectWithValue }) => {
        try {
            const response = await client.post('/auth/login', credentials);
            const { access_token, user } = response.data;
            setAuthToken(access_token);
            // Ensure ID is present (backend returns sub)
            const userWithId = { ...user, id: user.sub || user.id };
            saveAuthSession(access_token, userWithId);
            return { token: access_token, user: userWithId };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            Alert.alert('Login Error', appError.message);
            return rejectWithValue(appError.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: Record<string, unknown>, { rejectWithValue }) => {
        try {
            const response = await client.post('/auth/register', userData);
            const { access_token, user } = response.data;
            setAuthToken(access_token);
            const userWithId = { ...user, id: user.sub || user.id };
            saveAuthSession(access_token, userWithId);
            return { token: access_token, user: userWithId };
        } catch (error: unknown) {
            const appError = handleApiError(error);
            Alert.alert('Registration Error', appError.message);
            return rejectWithValue(appError.message);
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/users/profile');
            if (response.data) {
                const userWithId = { ...response.data, id: response.data.id || response.data.sub };
                // Update storage
                const session = await loadAuthSession();
                if (session && session.token) {
                    saveAuthSession(session.token, userWithId);
                }
                return userWithId;
            }
            return null;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message || 'Failed to fetch profile');
        }
    }
);

export const refreshMentorCode = createAsyncThunk(
    'auth/refreshMentorCode',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.post('/users/mentor-code/refresh');
            if (response.data) {
                const session = await loadAuthSession();
                if (session && session.token) {
                    saveAuthSession(session.token, response.data);
                }
                return response.data;
            }
            return null;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            Alert.alert('Refresh Error', appError.message);
            return rejectWithValue(appError.message);
        }
    }
);

export const updateUserRole = createAsyncThunk(
    'auth/updateUserRole',
    async (role: 'student' | 'mentor', { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const userId = state.auth.user?.id;
            if (!userId) {
                return rejectWithValue('User ID not found');
            }
            const response = await client.patch(`/users/${userId}`, { role });
            const updatedUser = response.data || { ...state.auth.user, role };
            const session = await loadAuthSession();
            if (session && session.token) {
                await saveAuthSession(session.token, updatedUser);
            }
            return updatedUser;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);

export const switchUserRole = createAsyncThunk(
    'auth/switchUserRole',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.post('/users/switch-role');
            const updatedUser = response.data;
            const userWithId = { ...updatedUser, id: updatedUser.id || updatedUser.sub };
            const session = await loadAuthSession();
            if (session && session.token) {
                await saveAuthSession(session.token, userWithId);
            }
            return userWithId;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            return rejectWithValue(appError.message);
        }
    }
);


export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const userId = state.auth.user?.id;
            if (!userId) {
                return rejectWithValue('User ID not found');
            }
            await client.delete(`/users/${userId}`);
            await clearAuthSession();
            setAuthToken(null);
            return;
        } catch (error: unknown) {
            const appError = handleApiError(error);
            Alert.alert('Failed to delete account');
            return rejectWithValue(appError.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await clearAuthSession();
            setAuthToken(null);
            return;
        } catch (error) {
            console.error('Logout failed', error);
            return;
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserRole: (state, action: PayloadAction<'student' | 'mentor'>) => {
            if (state.user) {
                state.user.role = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        // Update User Role
        builder.addCase(updateUserRole.fulfilled, (state, action) => {
            if (action.payload) {
                state.user = action.payload;
            }
        });
        // Switch User Role
        builder.addCase(switchUserRole.fulfilled, (state, action) => {
            if (action.payload) {
                state.user = action.payload;
            }
        });
        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
        });
        builder.addCase(logout.rejected, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
        });

        // Delete Account
        builder.addCase(deleteAccount.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.token = null;
        });
        
        // Check Auth
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            if (action.payload && action.payload.token) {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            } else {
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
            }
            state.isInitialized = true;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.isInitialized = true;
        });

        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Fetch Current User
        builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
            if (action.payload) {
                state.user = action.payload;
            }
        });

        // Refresh Mentor Code
        builder.addCase(refreshMentorCode.fulfilled, (state, action) => {
            if (action.payload) {
                state.user = action.payload;
            }
        });
    }
});

export const { setUserRole } = authSlice.actions;

export default authSlice.reducer;
