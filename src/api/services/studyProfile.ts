import client from '../client';

export interface StudyProfileData {
  id: string;
  userId: string;
  targetExamVersionId?: string;
  targetExamVersion?: {
    id: string;
    versionName: string;
    year: number;
    exam?: {
      id: string;
      name: string;
      code: string;
    };
  };
  track: 'SAYISAL' | 'ESIT_AGIRLIK' | 'SOZEL' | 'DIL' | 'TYT_ONLY' | 'SAT_ALL' | 'SAT_MATH_FOCUS' | 'SAT_RW_FOCUS' | 'GENERAL';
  targetExamDate: string;
  targetScore?: number;
  currentScore?: number;
  targetRank?: number;
  weeklyAvailabilityMinutes: number;
  dailyAvailability?: Record<string, number>;
  currentLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  timezone?: string;
}

export const getStudyProfile = async (): Promise<StudyProfileData> => {
  const response = await client.get<StudyProfileData>('/study-profile');
  return response.data;
};

export const createOrUpdateStudyProfile = async (
  payload: Partial<StudyProfileData>
): Promise<StudyProfileData> => {
  const response = await client.post<StudyProfileData>('/study-profile', payload);
  return response.data;
};

export const updateStudyProfile = async (
  payload: Partial<StudyProfileData>
): Promise<StudyProfileData> => {
  const response = await client.patch<StudyProfileData>('/study-profile', payload);
  return response.data;
};

export const getDiagnosticResults = async (): Promise<any[]> => {
  const response = await client.get<any[]>('/study-profile/diagnostics');
  return response.data;
};
