import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MENTOR_TAB_ROUTES } from './routes';
import { getTabBarIcon } from './navigationUtils';

const Tab = createBottomTabNavigator();

const MentorNavigator = ({ route }: any) => {
    const { student } = route.params;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
                tabBarActiveTintColor: '#5856D6', // lightTheme.colors.secondary
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            {MENTOR_TAB_ROUTES.map((item) => (
                <Tab.Screen
                    key={item.name}
                    name={item.name}
                    component={item.component}
                    initialParams={item.name === 'Profile' ? undefined : { student }}
                    options={item.options}
                />
            ))}
        </Tab.Navigator>
    );
};

export default MentorNavigator;
