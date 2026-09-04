// src/redux/roadmapSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { CountryCode, detectDeviceCountry } from '../utils/countryDetection';
import {
  RoadmapTaskItem,
  YKSTrialResult,
  SATTrialResult,
  generateInitialRoadmapTasks,
} from '../data/examPacks';
import { Language, setLanguage } from '../utils/i18n';
import { AccessScope, GrantPermissions } from '../api/types';
import {
  createInvite,
  acceptInvite,
  getGrantedAccessList,
  getReceivedAccessList,
  revokeGrant,
} from '../api/services/accountability';
import { getStudyProfile } from '../api/services/studyProfile';
import { getStudyProgress } from '../api/services/sessions';

export interface StudyPartner {
  id: string;
  grantId?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: 'partner';
  status: 'active' | 'pending';
  inviteCode?: string;
  lastActive?: string;
  weeklyMinutes?: number;
  isIncoming?: boolean;
  permissions?: GrantPermissions;
}

export interface ShareSettings {
  shareStudyTime: boolean;
  shareCompletedTasks: boolean;
  shareScores: boolean;
}

export interface RoadmapState {
  detectedCountry: CountryCode;
  selectedCountry: CountryCode;
  language: Language;
  selectedExam: 'yks' | 'sat' | 'none';
  targetTrack?: string; // e.g. 'sayisal' for YKS
  targetScore?: string; // e.g. "500" or "1450" or "İlk 10.000"
  currentScore?: string;
  targetDate?: string;
  weeklyAvailabilityHours: number;
  currentWeek: number;
  suggestedTasks: RoadmapTaskItem[];
  yksTrials: YKSTrialResult[];
  satTrials: SATTrialResult[];
  // Accountability & Partners
  partners: StudyPartner[];
  incomingInvites: StudyPartner[];
  partnersLoading: boolean;
  partnersError: string | null;
  lastGeneratedInviteCode: string | null;
  shareSettings: ShareSettings;
  streakDays: number;
  lastActiveDate: string;
}

export const fetchPartners = createAsyncThunk(
  'roadmap/fetchPartners',
  async (_, { rejectWithValue }) => {
    try {
      const [granted, received] = await Promise.all([
        getGrantedAccessList(),
        getReceivedAccessList(),
      ]);

      const partners: StudyPartner[] = [];
      const incomingInvites: StudyPartner[] = [];

      for (const g of granted) {
        if (g.status === 'REVOKED' || g.status === 'EXPIRED') continue;

        if (g.status === 'ACTIVE' && g.grantee) {
          partners.push({
            id: g.grantee.id || g.id,
            grantId: g.id,
            name: g.grantee.name || g.inviteEmail || 'Çalışma Partneri',
            email: g.grantee.email || g.inviteEmail,
            role: 'partner',
            status: 'active',
            lastActive: 'Bugün',
            weeklyMinutes: 180,
            permissions: g.permissions,
            isIncoming: false,
          });
        } else if (g.status === 'INVITED') {
          partners.push({
            id: g.id,
            grantId: g.id,
            name: g.grantee?.name || (g.inviteEmail ? g.inviteEmail.split('@')[0] : 'Davet Edilen Partner'),
            email: g.inviteEmail || g.grantee?.email,
            role: 'partner',
            status: 'pending',
            inviteCode: g.inviteCode,
            lastActive: 'Davet Bekleniyor',
            permissions: g.permissions,
            isIncoming: false,
          });
        }
      }

      for (const r of received) {
        if (r.status === 'REVOKED' || r.status === 'EXPIRED') continue;

        if (r.status === 'INVITED') {
          // Incoming invitation waiting for user approval!
          incomingInvites.push({
            id: r.granter?.id || r.id,
            grantId: r.id,
            name: r.granter?.name || (r.granter?.email ? r.granter.email.split('@')[0] : 'Çalışma Arkadaşı'),
            email: r.granter?.email,
            role: 'partner',
            status: 'pending',
            inviteCode: r.inviteCode,
            lastActive: 'Yeni İstek',
            permissions: r.permissions,
            isIncoming: true,
          });
        } else if (r.status === 'ACTIVE' && r.granter) {
          if (partners.some((p) => p.grantId === r.id || p.id === r.granter?.id)) continue;
          partners.push({
            id: r.granter.id || r.id,
            grantId: r.id,
            name: r.granter.name || r.granter.email || 'Çalışma Partneri',
            email: r.granter.email,
            role: 'partner',
            status: 'active',
            lastActive: 'Bugün',
            weeklyMinutes: 240,
            permissions: r.permissions,
            isIncoming: true,
          });
        }
      }

      return { partners, incomingInvites };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch partners');
    }
  }
);

export const sendPartnerInvite = createAsyncThunk(
  'roadmap/sendPartnerInvite',
  async (
    payload: {
      name?: string;
      email?: string;
      permissions?: Partial<GrantPermissions>;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await createInvite({
        scope: 'PARTNER',
        inviteEmail: payload.email?.trim().toLowerCase() || undefined,
        permissions: payload.permissions || {
          canViewResults: true,
          canGiveFeedback: true,
        },
      });

      dispatch(fetchPartners());
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to send invite'
      );
    }
  }
);

export const acceptPartnerCode = createAsyncThunk(
  'roadmap/acceptPartnerCode',
  async (
    payload: string | { inviteCode?: string; grantId?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const requestPayload =
        typeof payload === 'string'
          ? { inviteCode: payload.trim().toUpperCase() }
          : {
              inviteCode: payload.inviteCode?.trim().toUpperCase(),
              grantId: payload.grantId,
            };
      const res = await acceptInvite(requestPayload);
      dispatch(fetchPartners());
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Invalid or expired invite code'
      );
    }
  }
);

export const acceptIncomingInvite = createAsyncThunk(
  'roadmap/acceptIncomingInvite',
  async (
    payload: { grantId?: string; inviteCode?: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await acceptInvite(payload);
      dispatch(fetchPartners());
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Davet kabul edilemedi'
      );
    }
  }
);

export const rejectIncomingInvite = createAsyncThunk(
  'roadmap/rejectIncomingInvite',
  async (grantId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await revokeGrant(grantId);
      dispatch(fetchPartners());
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Davet reddedilemedi'
      );
    }
  }
);

export const revokePartnerGrant = createAsyncThunk(
  'roadmap/revokePartnerGrant',
  async (grantId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await revokeGrant(grantId);
      dispatch(fetchPartners());
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to revoke partner'
      );
    }
  }
);

export const fetchStudyProfile = createAsyncThunk(
  'roadmap/fetchStudyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await getStudyProfile();
      return profile;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch study profile'
      );
    }
  }
);

export const fetchStudyProgress = createAsyncThunk(
  'roadmap/fetchStudyProgress',
  async (timeframe: string | undefined, { rejectWithValue }) => {
    try {
      const data = await getStudyProgress(timeframe || 'week');
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch progress'
      );
    }
  }
);

const initialDetectedCountry = detectDeviceCountry();
const initialLanguage: Language = initialDetectedCountry === 'TR' ? 'tr' : 'en';
setLanguage(initialLanguage);

const initialState: RoadmapState = {
  detectedCountry: initialDetectedCountry,
  selectedCountry: initialDetectedCountry,
  language: initialLanguage,
  selectedExam: 'none',
  weeklyAvailabilityHours: 20,
  currentWeek: 1,
  suggestedTasks: [],
  yksTrials: [],
  satTrials: [],
  partners: [],
  incomingInvites: [],
  partnersLoading: false,
  partnersError: null,
  lastGeneratedInviteCode: null,
  shareSettings: {
    shareStudyTime: true,
    shareCompletedTasks: true,
    shareScores: false,
  },
  streakDays: 0,
  lastActiveDate: '',
};

export const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    setSelectedCountry: (state, action: PayloadAction<CountryCode>) => {
      state.selectedCountry = action.payload;
      state.language = action.payload === 'TR' ? 'tr' : 'en';
      setLanguage(state.language);
    },
    setAppLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      setLanguage(action.payload);
    },
    setSelectedExam: (
      state,
      action: PayloadAction<{
        exam: 'yks' | 'sat' | 'none';
        track?: string;
        targetScore?: string;
        targetDate?: string;
      }>
    ) => {
      state.selectedExam = action.payload.exam;
      if (action.payload.track) state.targetTrack = action.payload.track;
      if (action.payload.targetScore) state.targetScore = action.payload.targetScore;
      if (action.payload.targetDate) state.targetDate = action.payload.targetDate;

      // Populate initial tasks
      state.suggestedTasks = generateInitialRoadmapTasks(action.payload.exam, action.payload.track);
    },
    toggleRoadmapTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.suggestedTasks.find((t) => t.id === action.payload);
      if (task) {
        task.isCompleted = !task.isCompleted;
      }
    },
    addYKSTrial: (state, action: PayloadAction<YKSTrialResult>) => {
      state.yksTrials.unshift(action.payload);
    },
    addSATTrial: (state, action: PayloadAction<SATTrialResult>) => {
      state.satTrials.unshift(action.payload);
    },
    addPartner: (state, action: PayloadAction<StudyPartner>) => {
      state.partners.push(action.payload);
    },
    removePartner: (state, action: PayloadAction<string>) => {
      state.partners = state.partners.filter((p) => p.id !== action.payload);
    },
    updateShareSettings: (state, action: PayloadAction<Partial<ShareSettings>>) => {
      state.shareSettings = { ...state.shareSettings, ...action.payload };
    },
    dismissRescheduledReason: (state, action: PayloadAction<string>) => {
      const task = state.suggestedTasks.find((t) => t.id === action.payload);
      if (task) {
        delete task.rescheduledReason;
      }
    },
    clearLastGeneratedCode: (state) => {
      state.lastGeneratedInviteCode = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPartners
    builder.addCase(fetchPartners.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(fetchPartners.fulfilled, (state, action) => {
      state.partnersLoading = false;
      state.partners = action.payload.partners;
      state.incomingInvites = action.payload.incomingInvites;
    });
    builder.addCase(fetchPartners.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // sendPartnerInvite
    builder.addCase(sendPartnerInvite.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(sendPartnerInvite.fulfilled, (state, action) => {
      state.partnersLoading = false;
      state.lastGeneratedInviteCode = action.payload.inviteCode;
    });
    builder.addCase(sendPartnerInvite.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // acceptPartnerCode
    builder.addCase(acceptPartnerCode.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(acceptPartnerCode.fulfilled, (state) => {
      state.partnersLoading = false;
    });
    builder.addCase(acceptPartnerCode.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // acceptIncomingInvite
    builder.addCase(acceptIncomingInvite.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(acceptIncomingInvite.fulfilled, (state) => {
      state.partnersLoading = false;
    });
    builder.addCase(acceptIncomingInvite.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // rejectIncomingInvite
    builder.addCase(rejectIncomingInvite.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(rejectIncomingInvite.fulfilled, (state) => {
      state.partnersLoading = false;
    });
    builder.addCase(rejectIncomingInvite.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // revokePartnerGrant
    builder.addCase(revokePartnerGrant.pending, (state) => {
      state.partnersLoading = true;
      state.partnersError = null;
    });
    builder.addCase(revokePartnerGrant.fulfilled, (state) => {
      state.partnersLoading = false;
    });
    builder.addCase(revokePartnerGrant.rejected, (state, action) => {
      state.partnersLoading = false;
      state.partnersError = action.payload as string;
    });

    // fetchStudyProfile
    builder.addCase(fetchStudyProfile.fulfilled, (state, action) => {
      const profile = action.payload;
      if (profile) {
        const examCode = profile.targetExamVersion?.exam?.code?.toLowerCase();
        if (examCode === 'yks' || examCode === 'sat') {
          state.selectedExam = examCode;
        } else if (profile.track && profile.track.startsWith('SAT')) {
          state.selectedExam = 'sat';
        } else if (profile.track) {
          state.selectedExam = 'yks';
        }

        if (profile.track) {
          state.targetTrack = profile.track.toLowerCase();
        }

        if (profile.targetScore) {
          state.targetScore = String(profile.targetScore);
        } else if (profile.targetRank) {
          state.targetScore = `İlk ${profile.targetRank.toLocaleString()}`;
        }

        if (profile.currentScore) {
          state.currentScore = String(profile.currentScore);
        }

        if (profile.weeklyAvailabilityMinutes) {
          state.weeklyAvailabilityHours = Math.round(profile.weeklyAvailabilityMinutes / 60);
        }

        if (profile.targetExamDate) {
          state.targetDate = profile.targetExamDate;
        }
      }
    });

    // fetchStudyProgress
    builder.addCase(fetchStudyProgress.fulfilled, (state, action) => {
      if (action.payload) {
        if (action.payload.streakDays !== undefined) {
          state.streakDays = action.payload.streakDays;
        }
      }
    });
  },
});

export const {
  setSelectedCountry,
  setAppLanguage,
  setSelectedExam,
  toggleRoadmapTaskCompletion,
  addYKSTrial,
  addSATTrial,
  addPartner,
  removePartner,
  updateShareSettings,
  dismissRescheduledReason,
  clearLastGeneratedCode,
} = roadmapSlice.actions;

export default roadmapSlice.reducer;
