// src/utils/i18n.ts
export type Language = 'en' | 'tr';

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.today': 'Today',
    'nav.focus': 'Focus',
    'nav.progress': 'Progress',
    'nav.profile': 'Profile',
    'nav.more': 'More',

    // Today / Tasks
    'task.quickAdd': 'Quick Add Task',
    'task.createTask': 'Create Task',
    'task.editTask': 'Edit Task',
    'task.title': 'Task Title',
    'task.titlePlaceholder': 'e.g., Solve 30 Math problems',
    'task.course': 'Course / Subject',
    'task.coursePlaceholder': 'e.g., Mathematics, Physics...',
    'task.topic': 'Topic (Optional)',
    'task.topicPlaceholder': 'e.g., Quadratic Equations',
    'task.source': 'Source / Material (Optional)',
    'task.sourcePlaceholder': 'e.g., Question Bank, Chapter 2',
    'task.goal': 'Target / Goal (Optional)',
    'task.goalPlaceholder': 'e.g., 40 questions, 15 pages',
    'task.dueDate': 'Due Date',
    'task.dueToday': 'Today',
    'task.dueTomorrow': 'Tomorrow',
    'task.dueFlexible': 'Flexible / Someday',
    'task.dueCustom': 'Pick Date',
    'task.startFocus': 'Start Focus Session',
    'task.archive': 'Archive',
    'task.unarchive': 'Unarchive',
    'task.assignedBy': 'Assigned by',
    'task.assignedByMentor': 'Assigned by Mentor',
    'task.categoryToday': 'Today',
    'task.categoryUpcoming': 'Upcoming',
    'task.categoryFlexible': 'Flexible',
    'task.categoryArchived': 'Archived',
    'task.emptyToday': 'No tasks scheduled for today. Ready to add one?',
    'task.emptyUpcoming': 'No upcoming tasks.',
    'task.emptyFlexible': 'No flexible tasks added yet.',
    'task.emptyArchived': 'No archived tasks.',
    'task.completed': 'Completed',
    'task.markComplete': 'Mark Complete',
    'task.markIncomplete': 'Mark Incomplete',
    'task.tasksOverview': 'Tasks Overview',
    'task.completedCount': 'completed',
    
    // Focus
    'focus.start': 'Start',
    'focus.pause': 'Pause',
    'focus.resume': 'Resume',
    'focus.end': 'End Session',
    'focus.cancel': 'Cancel',

    // Progress
    'progress.dailyTotal': 'Daily Total',
    'progress.weeklyTotal': 'Weekly Total',
    'progress.completionRate': 'Completion Rate',
    'progress.recentSessions': 'Recent Sessions',

    // General / Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.add': 'Add',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred.',
    'common.offline': 'You are offline.',
    'common.empty': 'No data available.',
    'common.retry': 'Retry',
  },
  tr: {},
};

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const t = (key: string): string => {
  return translations[currentLanguage]?.[key] || translations['en'][key] || key;
};
