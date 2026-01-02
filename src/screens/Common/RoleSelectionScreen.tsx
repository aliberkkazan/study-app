import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/authSlice';
import { lightTheme } from '../../theme/theme';

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
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: lightTheme.colors.primary }]}
                    onPress={() => navigation.navigate('StudentHome')}
                >
                    <Text style={styles.buttonText}>Student View</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: lightTheme.colors.secondary }]}
                    onPress={() => navigation.navigate('MentorHome')}
                >
                    <Text style={styles.buttonText}>Mentor View</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 10,
    },
    logoutText: {
        color: 'red',
        fontSize: 16,
    }
});

export default RoleSelectionScreen;
