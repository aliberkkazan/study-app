/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '../redux/store';
import { checkAuth } from '../redux/authSlice';

import MainTabNavigator from './MainTabNavigator';
import MentorNavigator from './MentorNavigator';
import { AUTH_ROUTES, COMMON_STACK_ROUTES, ADMIN_STACK_ROUTES } from './routes';
import { Loading, IconButton } from '@/components';
import { BootSplash } from '@/components/shared/BootSplash';

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {AUTH_ROUTES.map((route) => (
            <Stack.Screen
                key={route.name}
                name={route.name}
                component={route.component}
                options={route.options}
            />
        ))}
    </Stack.Navigator>
);

const AuthenticatedStack = () => {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Core User Experience */}
            <Stack.Screen name="MainTab" component={MainTabNavigator} />

            {/* Admin Screens */}
            {user?.role === 'admin' && (
                ADMIN_STACK_ROUTES.map((route) => (
                    <Stack.Screen
                        key={route.name}
                        name={route.name}
                        component={route.component}
                        options={route.options}
                    />
                ))
            )}

            {/* Common Screens (Profile Settings, Join Mentor, etc) */}
            {COMMON_STACK_ROUTES.map((route) => (
                <Stack.Screen
                    key={route.name}
                    name={route.name}
                    component={route.component}
                    options={route.options}
                />
            ))}

            {/* Legacy Mentor Screens - moved here for Profile -> More access */}
            <Stack.Screen
                name="MentorDashboard"
                component={MentorNavigator}
                options={({ route, navigation }: any) => ({
                    headerShown: true,
                    title: route.params?.student?.name || 'Dashboard',
                    headerLeft: () => (
                        <IconButton
                            icon="account-group"
                            size={24}
                            iconColor="#007AFF"
                            onPress={() => navigation.goBack()}
                            style={{ marginLeft: 6 }}
                        />
                    ),
                })}
            />
            {/* Legacy Mentor Dashboard or related old screens can be accessed via Profile -> More */}
        </Stack.Navigator>
    );
};

const RootNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
    const [visible, setVisible] = useState(true);

    const onAnimationEnd = () => setVisible(false);
    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    useEffect(() => {
        if (isInitialized && !isAuthenticated && navigationRef.isReady()) {
            navigationRef.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                })
            );
        }
    }, [isAuthenticated, isInitialized]);

    if (!isInitialized) {
        return (
            <Loading visible={isInitialized} />
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            {visible && <BootSplash onAnimationEnd={onAnimationEnd} />}
            {isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default RootNavigator;
