// src/utils/countryDetection.ts

export type CountryCode = 'TR' | 'US' | 'GB' | 'GLOBAL';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  defaultLanguage: 'tr' | 'en';
}

export const SUPPORTED_COUNTRIES: CountryInfo[] = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', defaultLanguage: 'tr' },
  { code: 'US', name: 'United States', flag: '🇺🇸', defaultLanguage: 'en' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', defaultLanguage: 'en' },
  { code: 'GLOBAL', name: 'International / Other', flag: '🌐', defaultLanguage: 'en' },
];

export interface ExamOption {
  id: string;
  name: string;
  fullName: string;
  country: CountryCode | 'ALL';
  badge?: string;
  description: string;
  isFreeStudy?: boolean;
}

export const ALL_EXAM_OPTIONS: ExamOption[] = [
  {
    id: 'free_study',
    name: 'General Study (No Exam)',
    fullName: 'Sınavsız / Serbest Çalışma',
    country: 'ALL',
    badge: 'Universal',
    description: 'Track custom tasks, run focus sessions, and measure productivity without an exam curriculum.',
    isFreeStudy: true,
  },
  {
    id: 'yks',
    name: 'YKS (TYT & AYT)',
    fullName: 'Yükseköğretim Kurumları Sınavı',
    country: 'TR',
    badge: 'Türkiye',
    description: 'Sayısal, Eşit Ağırlık, Sözel ve Dil alanlarına özel haftalık roadmap, deneme neti takibi ve soru hedefleri.',
  },
  {
    id: 'sat',
    name: 'Digital SAT',
    fullName: 'College Board Digital SAT',
    country: 'US',
    badge: 'USA & Global',
    description: 'Reading & Writing and Math modules, 400-1600 scoring goals, practice tests, and adaptive roadmap.',
  },
];

/**
 * Detects default device country based on timezone and Intl locale.
 */
export const detectDeviceCountry = (): CountryCode => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = (Intl.DateTimeFormat().resolvedOptions().locale || '').toLowerCase();

    // Check timezone first
    if (timeZone === 'Europe/Istanbul' || timeZone.includes('Turkey')) {
      return 'TR';
    }
    if (
      timeZone.startsWith('America/') ||
      timeZone.startsWith('US/') ||
      timeZone === 'Pacific/Honolulu'
    ) {
      return 'US';
    }
    if (timeZone === 'Europe/London' || timeZone.startsWith('Europe/Belfast')) {
      return 'GB';
    }

    // Check locale fallback
    if (locale.includes('tr') || locale.endsWith('-tr')) {
      return 'TR';
    }
    if (locale.endsWith('-us') || locale === 'en-us') {
      return 'US';
    }
    if (locale.endsWith('-gb') || locale === 'en-gb') {
      return 'GB';
    }

    return 'GLOBAL';
  } catch (error) {
    console.log('Error detecting country, falling back to GLOBAL', error);
    return 'GLOBAL';
  }
};

/**
 * Returns available exam options filtered by country.
 * CRITICAL RULE: A user in US will NEVER see YKS by default.
 */
export const getSupportedExamsByCountry = (country: CountryCode): ExamOption[] => {
  return ALL_EXAM_OPTIONS.filter((exam) => {
    if (exam.isFreeStudy || exam.country === 'ALL') {
      return true;
    }
    if (country === 'US') {
      // In USA, show SAT and never YKS
      return exam.id !== 'yks';
    }
    if (country === 'TR') {
      // In Turkey, show YKS and SAT (as an international option)
      return true;
    }
    // Global: show SAT, hide Turkey-specific YKS
    if (country === 'GLOBAL' || country === 'GB') {
      return exam.id !== 'yks';
    }
    return exam.country === country;
  });
};
