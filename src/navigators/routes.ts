
import {
    LoginScreen,
    RegisterScreen,
    ProgramScreen,
    PomodoroScreen,
    EditProgramScreen,
    ReviewTestScreen,
    StudentSubmissionsScreen,
    UploadTestScreen,
    MentorStudentListScreen,
    MentorProgramListScreen,
    RoleSelectionScreen,
    ProfileScreen,
    JoinMentorScreen,
    MentorRequestsScreen
} from '@screens';
import React from 'react';

export interface RouteConfig {
    name: string;
    component: React.ComponentType<any>;
    options?: any;
    initialParams?: any;
}

export const STUDENT_TAB_ROUTES: RouteConfig[] = [
    { name: 'Program', component: ProgramScreen },
    { name: 'Pomodoro', component: PomodoroScreen },
    { name: 'Upload', component: UploadTestScreen },
    { name: 'My Submissions', component: StudentSubmissionsScreen },
    { name: 'Profile', component: ProfileScreen },
];

export const MENTOR_TAB_ROUTES: RouteConfig[] = [
    { name: 'Assign Tasks', component: EditProgramScreen, options: { title: 'Assign' } },
    { name: 'Task List', component: MentorProgramListScreen, options: { title: 'Tasks' } },
    { name: 'Review Tests', component: ReviewTestScreen, options: { title: 'Review' } },
    { name: 'Profile', component: ProfileScreen, options: { title: 'Profile' } },
];

export const AUTH_ROUTES: RouteConfig[] = [
    { name: 'Login', component: LoginScreen },
    { name: 'Register', component: RegisterScreen },
];

export const COMMON_STACK_ROUTES: RouteConfig[] = [
    { name: 'JoinMentor', component: JoinMentorScreen, options: { headerShown: true, title: 'Join Mentor' } },
    { name: 'MentorRequests', component: MentorRequestsScreen, options: { headerShown: true, title: 'Requests' } },
    { name: 'Profile', component: ProfileScreen, options: { headerShown: true, title: 'Profile' } },
];

export const ADMIN_STACK_ROUTES: RouteConfig[] = [
    { name: 'RoleSelection', component: RoleSelectionScreen },
    // StudentHome and MentorHome are handled specially in RootNavigator due to their navigator components
];
