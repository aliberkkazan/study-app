/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '../redux/store';
import { checkAuth } from '../redux/authSlice';
import { MentorStudentListScreen } from '@screens';

import StudentNavigator from './StudentNavigator';
import MentorNavigator from './MentorNavigator';
import { AUTH_ROUTES, COMMON_STACK_ROUTES, ADMIN_STACK_ROUTES } from './routes';
import { Loading, IconButton } from '@/components';

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
            {/* Role Based Screens */}
            {user?.role === 'admin' ? (
                <>
                    {ADMIN_STACK_ROUTES.map((route) => (
                        <Stack.Screen
                            key={route.name}
                            name={route.name}
                            component={route.component}
                            options={route.options}
                        />
                    ))}
                    <Stack.Screen name="StudentHome" component={StudentNavigator} />
                    <Stack.Screen
                        name="MentorHome"
                        component={MentorStudentListScreen}
                        options={{ headerShown: true, title: 'My Students' }}
                    />
                </>
            ) : user?.role === 'student' ? (
                <Stack.Screen name="StudentHome" component={StudentNavigator} />
            ) : (
                <Stack.Screen
                    name="MentorHome"
                    component={MentorStudentListScreen}
                    options={{ headerShown: true, title: 'My Students' }}
                />
            )}

            {/* Common Screens */}
            {COMMON_STACK_ROUTES.map((route) => (
                <Stack.Screen
                    key={route.name}
                    name={route.name}
                    component={route.component}
                    options={route.options}
                />
            ))}

            {/* Shared Nested Navigators */}
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
        </Stack.Navigator>
    );
};

const RootNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

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
            {isAuthenticated ? <AuthenticatedStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default RootNavigator;
