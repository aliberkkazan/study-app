import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { checkAuth } from '../redux/authSlice';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import {
    LoginScreen,
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

import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create navigation reference for programmatic navigation control
const navigationRef = createNavigationContainerRef();

const TAB_ICON_CONFIG: Record<string, { focused: string; outline: string }> = {
    'Program': { focused: 'calendar', outline: 'calendar-outline' },
    'Pomodoro': { focused: 'timer', outline: 'timer-outline' },
    'Upload': { focused: 'cloud-upload', outline: 'cloud-upload-outline' },
    'My Submissions': { focused: 'list', outline: 'list-outline' },
    'Assign Tasks': { focused: 'create', outline: 'create-outline' },
    'Task List': { focused: 'list-circle', outline: 'list-circle-outline' },
    'Review Tests': { focused: 'checkbox', outline: 'checkbox-outline' },
    'Profile': { focused: 'person', outline: 'person-outline' },
    'Students': { focused: 'people', outline: 'people-outline' },
};

const getTabBarIcon = (routeName: string, focused: boolean, color: string, size: number) => {
    const config = TAB_ICON_CONFIG[routeName];
    const iconName = config ? (focused ? config.focused : config.outline) : 'help-circle';
    return <Ionicons name={iconName} size={size} color={color} />;
};

// Student Tab Navigator
const StudentTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
            tabBarActiveTintColor: '#007AFF', // lightTheme.colors.primary (hardcoded for now or import theme)
            tabBarInactiveTintColor: 'gray',
        })}
    >
        <Tab.Screen name="Program" component={ProgramScreen} />
        <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
        <Tab.Screen name="Upload" component={UploadTestScreen} />
        <Tab.Screen name="My Submissions" component={StudentSubmissionsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

// Mentor Tab Navigator (Dashboard for a specific student)
const MentorTabs = ({ route }: any) => {
    const { student } = route.params;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
                tabBarActiveTintColor: '#5856D6', // lightTheme.colors.secondary
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // Stack handles header
            })}
        >
            <Tab.Screen
                name="Assign Tasks"
                component={EditProgramScreen}
                initialParams={{ student }}
                options={{ title: `Assign` }}
            />
            <Tab.Screen
                name="Task List"
                component={MentorProgramListScreen}
                initialParams={{ student }}
                options={{ title: `Tasks` }}
            />
            <Tab.Screen
                name="Review Tests"
                component={ReviewTestScreen}
                initialParams={{ student }}
                options={{ title: `Review` }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: `Profile` }}
            />
        </Tab.Navigator>
    );
};

const RootNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    // Reset navigation when user logs out
    useEffect(() => {
        if (isInitialized && !isAuthenticated && navigationRef.isReady()) {
            // Reset navigation stack to Login screen
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
                screenOptions={{ headerShown: false }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : user?.role === 'admin' ? (
                    <>
                        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                        <Stack.Screen name="StudentHome" component={StudentTabs} />
                        <Stack.Screen name="MentorHome" component={MentorStudentListScreen} options={{ headerShown: true, title: 'My Students' }} />
                    </>
                ) : user?.role === 'student' ? (
                    <Stack.Screen name="StudentHome" component={StudentTabs} />
                ) : (
                    <Stack.Screen name="MentorHome" component={MentorStudentListScreen} options={{ headerShown: true, title: 'My Students' }} />
                )}

                <Stack.Screen name="JoinMentor" component={JoinMentorScreen} options={{ headerShown: true, title: 'Join Mentor' }} />
                <Stack.Screen name="MentorRequests" component={MentorRequestsScreen} options={{ headerShown: true, title: 'Requests' }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />

                <Stack.Screen
                    name="MentorDashboard"
                    component={MentorTabs}
                    options={({ route, navigation }: any) => ({
                        headerShown: true,
                        title: route.params?.student?.name || 'Dashboard',
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="people" size={24} color="#007AFF" />
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};


export default RootNavigator;
