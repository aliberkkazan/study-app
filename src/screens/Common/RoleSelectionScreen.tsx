import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { darkTheme, lightTheme } from '../../theme/theme';

const RoleSelectionScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Admin</Text>
            <Text style={styles.subtitle}>Select a role to continue:</Text>

            <View style={styles.buttonContainer}>
                <Button
                    onPress={() => navigation.navigate('StudentHome')}
                    style={styles.button}
                >
                    Student View
                </Button>

                <Button
                    onPress={() => navigation.navigate('MentorHome')}
                    style={styles.button}
                >
                    Mentor View
                </Button>
            </View>

            <Button
                mode="text"
                textColor="red"
                onPress={handleLogout}
                style={styles.logoutButton}
            >
                Logout
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: lightTheme.colors.background,
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: lightTheme.colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        gap: 20,
        marginBottom: 40,
    },
    button: {
        width: '100%',
    },
    logoutButton: {
        padding: 0,
    },
});

export default RoleSelectionScreen;
