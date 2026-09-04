import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen, FocusScreen, ProgressScreen, ProfileScreen } from '../screens';
import { getTabBarIcon } from './navigationUtils';
import { t } from '../utils/i18n';
import { ProfileSettingsHeader } from '../components';

export type MainTabParamList = {
    Today: undefined;
    Focus: undefined;
    Progress: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    // Map routes to existing icons in navigationUtils or provide custom ones
                    let iconName: string = route.name;
                    if (route.name === 'Today') iconName = 'Program'; // reuse calendar icon
                    if (route.name === 'Focus') iconName = 'Pomodoro'; // reuse timer icon
                    if (route.name === 'Progress') iconName = 'My Submissions'; // reuse chart icon
                    return getTabBarIcon(iconName, focused, color, size);
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen 
                name="Today" 
                component={TodayScreen} 
                options={{ title: t('nav.today') }} 
            />
            <Tab.Screen 
                name="Focus" 
                component={FocusScreen} 
                options={{ title: t('nav.focus') }} 
            />
            <Tab.Screen 
                name="Progress" 
                component={ProgressScreen} 
                options={{ title: t('nav.progress') }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ title: t('nav.profile'), headerRight: () => <ProfileSettingsHeader /> }} 
            />
        </Tab.Navigator>
    );
};

export default MainTabNavigator;
