import React from 'react';
import { Icon } from '@/components';

export const TAB_ICON_CONFIG: Record<string, { focused: string; outline: string }> = {
    'Program': { focused: 'calendar', outline: 'calendar-outline' },
    'Pomodoro': { focused: 'timer', outline: 'timer-outline' },
    'Upload': { focused: 'cloud-upload', outline: 'cloud-upload-outline' },
    'My Submissions': { focused: 'format-list-bulleted', outline: 'clipboard-list-outline' },
    'Assign Tasks': { focused: 'pencil', outline: 'pencil-outline' },
    'Task List': { focused: 'format-list-bulleted', outline: 'format-list-bulleted' },
    'Review Tests': { focused: 'checkbox-marked', outline: 'checkbox-blank-outline' },
    'Profile': { focused: 'account', outline: 'account-outline' },
    'Students': { focused: 'account-group', outline: 'account-group-outline' },
};

export const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    const config = TAB_ICON_CONFIG[routeName];
    const iconName = config ? (focused ? config.focused : config.outline) : 'help-circle';
    return <Icon source={iconName} size={size} color={color} />;
};
