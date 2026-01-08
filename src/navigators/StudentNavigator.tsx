import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { STUDENT_TAB_ROUTES } from './routes';
import { getTabBarIcon } from './navigationUtils';

const Tab = createBottomTabNavigator();

const StudentNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
                tabBarActiveTintColor: '#007AFF', // lightTheme.colors.primary
                tabBarInactiveTintColor: 'gray',
            })}
        >
            {STUDENT_TAB_ROUTES.map((route) => (
                <Tab.Screen
                    key={route.name}
                    name={route.name}
                    component={route.component}
                    options={route.options}
                />
            ))}
        </Tab.Navigator>
    );
};

export default StudentNavigator;
