import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { sendConnectionRequest } from '../../redux/dataSlice';
import { useNavigation } from '@react-navigation/native';
import { useAppLanguage } from '../../utils/i18n';

export const JoinMentorScreen = () => {
    const [code, setCode] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<any>();
    const { language, t } = useAppLanguage();
    const { loading } = useSelector((state: RootState) => state.data);
    const { user } = useSelector((state: RootState) => state.auth);

    const handleJoin = async () => {
        const cleanCode = code.trim().toUpperCase();

        if (!cleanCode) {
            Alert.alert(t('common.missingInfo'), t('student.missingCode'));
            return;
        }

        if (cleanCode.length !== 6) {
            Alert.alert(t('common.error'), t('student.invalidCodeLength'));
            return;
        }

        // CRITICAL: A user cannot add themselves as mentor
        if (user?.mentorCode && cleanCode === user.mentorCode.toUpperCase()) {
            Alert.alert(
                t('common.error'),
                t('student.selfConnectError')
            );
            return;
        }

        // CRITICAL: Mentor role accounts cannot send student requests
        if (user?.role === 'mentor') {
            Alert.alert(
                t('common.error'),
                t('student.mentorRoleError')
            );
            return;
        }

        try {
            await dispatch(sendConnectionRequest(cleanCode)).unwrap();
            Alert.alert(
                t('student.requestSentTitle'),
                t('student.requestSentMsg'),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error || t('student.missingCode'));
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <View style={styles.container}>
                <View style={styles.iconCircle}>
                    <Ionicons name="school" size={44} color="#2563EB" />
                </View>

                <Text style={styles.title}>{t('student.joinTitle')}</Text>
                <Text style={styles.subtitle}>
                    {t('student.joinSubtitle')}
                </Text>

                <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>{t('student.mentorCodeLabel')}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={t('student.codePlaceholder')}
                        placeholderTextColor="#94A3B8"
                        value={code}
                        onChangeText={(text) => setCode(text.toUpperCase())}
                        autoCapitalize="characters"
                        maxLength={6}
                        autoCorrect={false}
                    />

                    <TouchableOpacity
                        style={[styles.button, (!code.trim() || loading) && styles.buttonDisabled]}
                        onPress={handleJoin}
                        disabled={loading || !code.trim()}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="link" size={18} color="#FFFFFF" />
                                <Text style={styles.buttonText}>{t('student.sendRequest')}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#64748B" />
                    <Text style={styles.infoText}>
                        {t('student.infoNote')}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 28,
        paddingHorizontal: 16,
    },
    inputCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingVertical: 14,
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 6,
        color: '#0F172A',
        marginBottom: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 14,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonDisabled: {
        backgroundColor: '#94A3B8',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 14,
        width: '100%',
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
        color: '#475569',
    },
});

export default JoinMentorScreen;
