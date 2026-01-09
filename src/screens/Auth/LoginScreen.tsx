import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Button } from '@/components';

import { loginUser } from '../../redux/authSlice';
import { AppDispatch, RootState } from '../../redux/store';
import { lightTheme } from '../../theme/theme';
import {
    saveRememberedEmail,
    loadRememberedEmail,
    clearRememberedEmail,
} from '../../utils/authStorage';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const loadEmail = async () => {
            const savedEmail = await loadRememberedEmail();
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberMe(true);
            }
        };
        loadEmail();
    }, []);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) return;

        if (rememberMe) {
            saveRememberedEmail(email.trim());
        } else {
            clearRememberedEmail();
        }

        dispatch(loginUser({ email: email.trim(), password: password.trim() }));
    };

    const toggleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    return (
        <ImageBackground
            source={require('../../assets/images/login_background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View style={[styles.inputWrapper, styles.passwordWrapper]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color="rgba(255,255,255,0.7)"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.rememberContainer}
                            onPress={toggleRememberMe}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={rememberMe ? 'checkbox' : 'square-outline'}
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.rememberText}>Remember Me</Text>
                        </TouchableOpacity>
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        Login
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay for better contrast
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassmorphism effect
        borderRadius: 20,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 40,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    inputWrapper: {
        marginBottom: 15,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        width: '100%',
        height: 55,
        paddingHorizontal: 20,
        color: '#fff',
        fontSize: 16,
    },
    passwordInput: {
        flex: 1,
        height: 55,
        paddingHorizontal: 20,
        color: '#fff',
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
        paddingRight: 15,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        paddingLeft: 5,
    },

    rememberText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
    errorText: {
        color: '#FF6B6B',
        marginBottom: 15,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: lightTheme.colors.primary,
        elevation: 0,
        shadowOpacity: 0,
        marginTop: 10,
    },
    buttonContent: {
        height: 55,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});

export default LoginScreen;
