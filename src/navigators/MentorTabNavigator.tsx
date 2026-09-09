import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { MentorStudentsScreen, MentorRequestsScreen, ProfileScreen } from '../screens';
import { ProfileSettingsHeader } from '../components';
import { getTabBarIcon } from './navigationUtils';
import { useAppLanguage } from '../utils/i18n';

export type MentorTabParamList = {
    MentorStudents: undefined;
    MentorRequests: undefined;
    MentorProfile: undefined;
};

const Tab = createBottomTabNavigator<MentorTabParamList>();

export const MentorTabNavigator: React.FC = () => {
    const { t } = useAppLanguage();
    const { connectionRequests } = useSelector((state: RootState) => state.data);
    const pendingCount = connectionRequests.filter((r) => r.status === 'pending').length;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = 'Students';
                    if (route.name === 'MentorStudents') iconName = 'Students';
                    if (route.name === 'MentorRequests') iconName = 'Requests';
                    if (route.name === 'MentorProfile') iconName = 'Profile';
                    return getTabBarIcon(iconName, focused, color, size);
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="MentorStudents"
                component={MentorStudentsScreen}
                options={{
                    title: t('nav.myStudents'),
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="MentorRequests"
                component={MentorRequestsScreen}
                options={{
                    title: t('nav.requests'),
                    headerShown: true,
                    headerTitle: t('nav.incomingRequests'),
                    tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
                }}
            />
            <Tab.Screen
                name="MentorProfile"
                component={ProfileScreen}
                options={{
                    title: t('nav.profile'),
                    headerRight: () => <ProfileSettingsHeader />,
                }}
            />
        </Tab.Navigator>
    );
};

export default MentorTabNavigator;
