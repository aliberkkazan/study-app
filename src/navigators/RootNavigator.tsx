/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';

import { RootState, AppDispatch } from '../redux/store';
import { checkAuth } from '../redux/authSlice';

import MainTabNavigator from './MainTabNavigator';
import MentorTabNavigator from './MentorTabNavigator';
import MentorNavigator from './MentorNavigator';
import { AUTH_ROUTES, COMMON_STACK_ROUTES, ADMIN_STACK_ROUTES } from './routes';
import { Loading, IconButton } from '@/components';
import { BootSplash } from '@/components/shared/BootSplash';
import { OnboardingScreen, RoleSelectionScreen } from '../screens';
import { getUserPreferences, getSavedLanguage } from '../utils/userPreferences';
import { setAppLanguage } from '../redux/roadmapSlice';
import { useAppLanguage } from '../utils/i18n';

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
    const { t } = useAppLanguage();
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const checkFlow = async () => {
            const userId = user?.id || (user as any)?.sub;
            if (!userId) {
                if (isMounted) setInitialRoute('MainTab');
                return;
            }

            try {
                const prefs = await getUserPreferences(userId);
                if (!prefs.onboardingCompleted) {
                    if (isMounted) setInitialRoute('Onboarding');
                } else if (!prefs.roleSelected && !user?.role) {
                    if (isMounted) setInitialRoute('RoleSelection');
                } else if (user?.role === 'mentor') {
                    if (isMounted) setInitialRoute('MentorTab');
                } else {
                    if (isMounted) setInitialRoute('MainTab');
                }
            } catch (err) {
                console.error('Failed to check user flow preferences:', err);
                if (isMounted) {
                    setInitialRoute(user?.role === 'mentor' ? 'MentorTab' : 'MainTab');
                }
            }
        };

        checkFlow();
        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.role]);

    if (!initialRoute) {
        return <Loading visible={true} />;
    }

    const getScreenTitle = (routeName: string) => {
        switch (routeName) {
            case 'JoinMentor': return t('student.joinTitle');
            case 'MentorRequests': return t('nav.requests');
            case 'Profile': return t('nav.profile');
            case 'ProfileSettings': return t('nav.profile');
            case 'ExamSelection': return t('roadmap.selectGoalTitle');
            case 'Roadmap': return t('roadmap.viewRoadmap');
            case 'MentorStudents': return t('mentor.managementTitle');
            default: return undefined;
        }
    };

    return (
        <Stack.Navigator
            key={user?.role || 'default'}
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >
            {/* Student Experience */}
            <Stack.Screen name="MainTab" component={MainTabNavigator} />

            {/* Mentor Experience */}
            <Stack.Screen name="MentorTab" component={MentorTabNavigator} />

            {/* Onboarding & Role Selection */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

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
            {COMMON_STACK_ROUTES.filter((r) => r.name !== 'Onboarding' && r.name !== 'RoleSelection').map((route) => {
                const dynamicTitle = getScreenTitle(route.name);
                const mergedOptions = dynamicTitle
                    ? { ...route.options, title: dynamicTitle }
                    : route.options;

                return (
                    <Stack.Screen
                        key={route.name}
                        name={route.name}
                        component={route.component}
                        options={mergedOptions}
                    />
                );
            })}

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
        getSavedLanguage().then((saved) => {
            if (saved) {
                dispatch(setAppLanguage(saved));
            }
        });
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
