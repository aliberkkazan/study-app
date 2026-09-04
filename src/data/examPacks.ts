// src/data/examPacks.ts

export type RoadmapTaskType = 'learn' | 'practice' | 'review' | 'simulate';

export interface RoadmapTaskItem {
  id: string;
  type: RoadmapTaskType;
  title: string;
  courseName: string;
  topicName: string;
  targetMinutes: number;
  questionGoal?: number;
  isCompleted: boolean;
  rescheduledReason?: string; // e.g., "Moved from last week because you needed more time on Algebra"
  weekNumber: number;
}

export interface YKSTrack {
  id: 'sayisal' | 'esitagirlik' | 'sozel' | 'dil';
  name: string;
  description: string;
  primarySubjects: string[];
}

export const YKS_TRACKS: YKSTrack[] = [
  {
    id: 'sayisal',
    name: 'Sayısal (MF)',
    description: 'Mühendislik, Tıp, Mimarlık vb. (TYT + AYT Mat & Fen)',
    primarySubjects: ['TYT Matematik', 'AYT Matematik', 'TYT Fen', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji', 'TYT Türkçe'],
  },
  {
    id: 'esitagirlik',
    name: 'Eşit Ağırlık (TM)',
    description: 'Hukuk, İktisat, İşletme, Psikoloji (TYT + AYT Mat & Edebiyat-Sosyal)',
    primarySubjects: ['TYT Matematik', 'AYT Matematik', 'TYT Türkçe', 'AYT Edebiyat', 'AYT Tarih-1', 'AYT Coğrafya-1'],
  },
  {
    id: 'sozel',
    name: 'Sözel (TS)',
    description: 'İletişim, Gazetecilik, Tarih, Coğrafya (TYT + AYT Edebiyat-Sosyal-1/2)',
    primarySubjects: ['TYT Türkçe', 'AYT Edebiyat', 'AYT Tarih-1', 'AYT Tarih-2', 'AYT Coğrafya-1', 'Felsefe Grubu'],
  },
  {
    id: 'dil',
    name: 'Yabancı Dil (YDT)',
    description: 'Mütercim Tercümanlık, Dilbilim, Öğretmenlik (TYT + YDT)',
    primarySubjects: ['TYT Türkçe', 'TYT Matematik', 'YDT İngilizce'],
  },
];

export interface SubjectNetInput {
  name: string;
  maxQuestions: number;
  correct: number;
  incorrect: number;
  net: number;
}

export interface YKSTrialResult {
  id: string;
  date: string;
  examType: 'TYT' | 'AYT';
  publisher?: string;
  subjects: SubjectNetInput[];
  totalNet: number;
}

export interface SATTrialResult {
  id: string;
  date: string;
  testName: string; // e.g. "Bluebook Practice Test #1"
  readingWritingScore: number; // 200 - 800
  mathScore: number;           // 200 - 800
  totalScore: number;          // 400 - 1600
}

/**
 * Calculates net score for Turkish exam system (4 wrong answers cancel 1 right answer).
 */
export const calculateYKSNet = (correct: number, incorrect: number): number => {
  const net = correct - incorrect * 0.25;
  return Math.max(0, Math.round(net * 100) / 100);
};

export const DEFAULT_TYT_SUBJECTS: { name: string; maxQuestions: number }[] = [
  { name: 'Türkçe', maxQuestions: 40 },
  { name: 'Temel Matematik', maxQuestions: 40 },
  { name: 'Fen Bilimleri (Fizik, Kimya, Biyoloji)', maxQuestions: 20 },
  { name: 'Sosyal Bilimler (Tarih, Coğrafya, Felsefe, Din)', maxQuestions: 20 },
];

export const DEFAULT_AYT_SAYISAL_SUBJECTS: { name: string; maxQuestions: number }[] = [
  { name: 'AYT Matematik', maxQuestions: 40 },
  { name: 'Fizik', maxQuestions: 14 },
  { name: 'Kimya', maxQuestions: 13 },
  { name: 'Biyoloji', maxQuestions: 13 },
];

export const DEFAULT_AYT_EA_SUBJECTS: { name: string; maxQuestions: number }[] = [
  { name: 'AYT Matematik', maxQuestions: 40 },
  { name: 'Türk Dili ve Edebiyatı', maxQuestions: 24 },
  { name: 'Tarih-1', maxQuestions: 10 },
  { name: 'Coğrafya-1', maxQuestions: 6 },
];

export const SAT_MODULES = [
  {
    name: 'Reading and Writing',
    domains: [
      'Craft and Structure',
      'Information and Ideas',
      'Standard English Conventions',
      'Expression of Ideas',
    ],
  },
  {
    name: 'Math',
    domains: [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis',
      'Geometry and Trigonometry',
    ],
  },
];

/**
 * Generates dynamic initial roadmap tasks for chosen track
 */
export const generateInitialRoadmapTasks = (exam: 'yks' | 'sat' | 'none', track?: string): RoadmapTaskItem[] => {
  if (exam === 'yks') {
    return [
      {
        id: 'yks-1',
        type: 'learn',
        title: 'Fonksiyonlar ve Grafik Çizimi',
        courseName: 'Matematik',
        topicName: 'Fonksiyonlar',
        targetMinutes: 60,
        questionGoal: 20,
        isCompleted: false,
        weekNumber: 1,
      },
      {
        id: 'yks-2',
        type: 'practice',
        title: 'Paragrafta Anlam ve Hız Egzersizi',
        courseName: 'Türkçe',
        topicName: 'Paragraf',
        targetMinutes: 45,
        questionGoal: 40,
        isCompleted: false,
        weekNumber: 1,
      },
      {
        id: 'yks-3',
        type: 'review',
        title: 'Temel Kavramlar & Bölünebilme Tekrarı',
        courseName: 'Matematik',
        topicName: 'Sayılar',
        targetMinutes: 40,
        questionGoal: 25,
        isCompleted: false,
        rescheduledReason: 'Önceki haftadan eksik kaldığı için bu haftanın tekrar planına eklendi.',
        weekNumber: 1,
      },
      {
        id: 'yks-4',
        type: 'simulate',
        title: 'Haftalık TYT Genel Deneme Sınavı (135 dk)',
        courseName: 'Genel Deneme',
        topicName: 'TYT Deneme #1',
        targetMinutes: 135,
        questionGoal: 120,
        isCompleted: false,
        weekNumber: 1,
      },
    ];
  }

  if (exam === 'sat') {
    return [
      {
        id: 'sat-1',
        type: 'learn',
        title: 'Mastering Linear Equations & Systems',
        courseName: 'Math',
        topicName: 'Algebra',
        targetMinutes: 50,
        questionGoal: 25,
        isCompleted: false,
        weekNumber: 1,
      },
      {
        id: 'sat-2',
        type: 'practice',
        title: 'Craft and Structure: Vocabulary in Context',
        courseName: 'Reading & Writing',
        topicName: 'Craft & Structure',
        targetMinutes: 45,
        questionGoal: 30,
        isCompleted: false,
        weekNumber: 1,
      },
      {
        id: 'sat-3',
        type: 'review',
        title: 'Punctuation & Sentence Boundaries Review',
        courseName: 'Reading & Writing',
        topicName: 'Standard English Conventions',
        targetMinutes: 35,
        questionGoal: 20,
        isCompleted: false,
        rescheduledReason: 'Carried over from diagnostic test recommendations.',
        weekNumber: 1,
      },
      {
        id: 'sat-4',
        type: 'simulate',
        title: 'Full-length Digital SAT Practice Test #1',
        courseName: 'Practice Test',
        topicName: 'Digital SAT Simulation',
        targetMinutes: 134,
        questionGoal: 98,
        isCompleted: false,
        weekNumber: 1,
      },
    ];
  }

  return [];
};
