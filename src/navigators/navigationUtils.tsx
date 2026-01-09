import React from 'react';
import { Icon } from '@/components';

export const TAB_ICON_CONFIG: Record<string, { icon: string; }> = {
    'Program': { icon: 'calendar'},
    'Pomodoro': { icon: 'timer' },
    'Upload': { icon: 'cloud-upload' },
    'My Submissions': { icon: 'format-list-bulleted'},
    'Assign Tasks': { icon: 'pencil' },
    'Task List': { icon: 'format-list-bulleted' },
    'Review Tests': { icon: 'checkbox-marked' },
    'Profile': { icon: 'account' },
    'Students': { icon: 'account-group'},
};

export const getTabBarIcon = (routeName: string, icon: boolean, color: string, size: number) => {
    const config = TAB_ICON_CONFIG[routeName];
    return <Icon source={config.icon} size={size} color={color} />;
};
