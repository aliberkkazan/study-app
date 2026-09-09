import React, { useState } from 'react';
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
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '@/components';
import client from '../../api/client';
import { lightTheme } from '../../theme/theme';
import { useAppLanguage } from '../../utils/i18n';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
    const { t } = useAppLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigation = useNavigation();
    const role = 'student'; // Default role for onboarding

    const handleRegister = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert(t('common.error'), t('auth.fillAllFields'));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('common.error'), t('auth.passwordLength'));
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/register', {
                email: email.trim(),
                password: password.trim(),
                name: name.trim(),
                role: role,
            });

            Alert.alert(
                t('auth.registrationSuccess'),
                t('auth.registrationSuccessMsg'),
                [
                    {
                        text: t('common.ok'),
                        onPress: () => navigation.navigate('Login' as never),
                    },
                ]
            );
        } catch (error: any) {
            const message = error.response?.data?.message || t('auth.registrationFailed');
            Alert.alert(t('common.error'), message);
        } finally {
            setLoading(false);
        }
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
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.title}>{t('auth.createAccount')}</Text>
                    <Text style={styles.subtitle}>{t('auth.signUpToGetStarted')}</Text>

                    <View style={styles.inputContainer}>
                        {/* Role selection has been removed to make solo-student the default onboarding flow */}

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.fullName')}
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder={t('auth.email')}
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
                                placeholder={t('auth.password')}
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
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                    >
                        {t('auth.register')}
                    </Button>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>{t('auth.haveAccount')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                            <Text style={styles.loginLink}>{t('auth.login')}</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 1,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        width: '100%',
        justifyContent: 'space-between',
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 5,
    },
    roleButtonActive: {
        backgroundColor: lightTheme.colors.primary,
        borderColor: lightTheme.colors.primary,
    },
    roleText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        marginLeft: 8,
        fontWeight: '600',
    },
    roleTextActive: {
        color: '#fff',
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
    loginContainer: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    loginLink: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default RegisterScreen;
