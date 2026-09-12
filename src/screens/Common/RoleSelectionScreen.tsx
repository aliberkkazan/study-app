import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { useNavigation } from '@react-navigation/native';
import { updateUserRole, setUserRole, refreshMentorCode, fetchCurrentUser } from '../../redux/authSlice';
import { setOnboardingCompleted, saveUserPreferences } from '../../utils/userPreferences';
import { useAppLanguage } from '../../utils/i18n';

export const RoleSelectionScreen = () => {
    const { t } = useAppLanguage();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [selectedRole, setSelectedRole] = useState<'student' | 'mentor'>('student');
    const [submitting, setSubmitting] = useState(false);

    const handleConfirmRole = async () => {
        let userId = user?.id || (user as any)?.sub;

        if (!userId) {
            try {
                const fetched: any = await dispatch(fetchCurrentUser()).unwrap();
                userId = fetched?.id || fetched?.sub;
            } catch (e) {
                console.error('Failed to recover user profile in role selection:', e);
            }
        }

        if (!userId) {
            Alert.alert(t('common.error'), t('role.sessionNotFound'));
            return;
        }

        setSubmitting(true);
        try {
            // Update role on backend & Redux
            dispatch(setUserRole(selectedRole));
            await dispatch(updateUserRole(selectedRole)).unwrap();

            // If mentor, ensure code is refreshed
            if (selectedRole === 'mentor') {
                dispatch(refreshMentorCode());
            }

            await setOnboardingCompleted(userId);
            await saveUserPreferences(userId, {
                roleSelected: true,
                onboardingCompleted: true,
            });

            navigation.reset({
                index: 0,
                routes: [{ name: selectedRole === 'mentor' ? 'MentorTab' : 'MainTab' }],
            });
        } catch (error: any) {
            console.error('Role update API note:', error);
            await setOnboardingCompleted(userId);
            await saveUserPreferences(userId, {
                roleSelected: true,
                onboardingCompleted: true,
            });

            navigation.reset({
                index: 0,
                routes: [{ name: selectedRole === 'mentor' ? 'MentorTab' : 'MainTab' }],
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.badge}>{t('role.badge')}</Text>
                    <Text style={styles.title}>{t('role.title')}</Text>
                    <Text style={styles.subtitle}>
                        {t('role.subtitle')}
                    </Text>
                </View>

                {/* ROLE CARDS */}
                <View style={styles.cardsContainer}>
                    {/* STUDENT CARD */}
                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            selectedRole === 'student' && styles.roleCardActive,
                        ]}
                        onPress={() => setSelectedRole('student')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardTopRow}>
                            <View
                                style={[
                                    styles.iconBox,
                                    selectedRole === 'student'
                                        ? styles.iconBoxStudentActive
                                        : styles.iconBoxInactive,
                                ]}
                            >
                                <Ionicons
                                    name="school"
                                    size={28}
                                    color={selectedRole === 'student' ? '#2563EB' : '#64748B'}
                                />
                            </View>

                            <View
                                style={[
                                    styles.radioCircle,
                                    selectedRole === 'student' && styles.radioCircleActive,
                                ]}
                            >
                                {selectedRole === 'student' && <View style={styles.radioDot} />}
                            </View>
                        </View>

                        <Text style={styles.roleTitle}>{t('role.studentTitle')}</Text>
                        <Text style={styles.roleDesc}>
                            {t('role.studentDesc')}
                        </Text>

                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.featureText}>{t('role.studentFeature1')}</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.featureText}>{t('role.studentFeature2')}</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.featureText}>{t('role.studentFeature3')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* MENTOR CARD */}
                    <TouchableOpacity
                        style={[
                            styles.roleCard,
                            selectedRole === 'mentor' && styles.roleCardActive,
                        ]}
                        onPress={() => setSelectedRole('mentor')}
                        activeOpacity={0.85}
                    >
                        <View style={styles.cardTopRow}>
                            <View
                                style={[
                                    styles.iconBox,
                                    selectedRole === 'mentor'
                                        ? styles.iconBoxMentorActive
                                        : styles.iconBoxInactive,
                                ]}
                            >
                                <Ionicons
                                    name="people"
                                    size={28}
                                    color={selectedRole === 'mentor' ? '#7C3AED' : '#64748B'}
                                />
                            </View>

                            <View
                                style={[
                                    styles.radioCircle,
                                    selectedRole === 'mentor' && styles.radioCircleActiveMentor,
                                ]}
                            >
                                {selectedRole === 'mentor' && <View style={styles.radioDotMentor} />}
                            </View>
                        </View>

                        <Text style={styles.roleTitle}>{t('role.mentorTitle')}</Text>
                        <Text style={styles.roleDesc}>
                            {t('role.mentorDesc')}
                        </Text>

                        <View style={styles.featuresList}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                                <Text style={styles.featureText}>{t('role.mentorFeature1')}</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                                <Text style={styles.featureText}>{t('role.mentorFeature2')}</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                                <Text style={styles.featureText}>{t('role.mentorFeature3')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* BOTTOM CONFIRM BUTTON */}
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            selectedRole === 'mentor'
                                ? styles.confirmButtonMentor
                                : styles.confirmButtonStudent,
                        ]}
                        onPress={handleConfirmRole}
                        disabled={submitting}
                        activeOpacity={0.85}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.confirmButtonText}>
                                    {selectedRole === 'student'
                                        ? t('role.continueAsStudent')
                                        : t('role.continueAsMentor')}
                                </Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                            </>
                        )}
                    </TouchableOpacity>
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
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginBottom: 20,
    },
    badge: {
        fontSize: 11,
        fontWeight: '800',
        color: '#2563EB',
        letterSpacing: 1,
        marginBottom: 6,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: '#64748B',
    },
    cardsContainer: {
        gap: 16,
    },
    roleCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roleCardActive: {
        borderColor: '#2563EB',
        backgroundColor: '#F8FAFF',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBoxInactive: {
        backgroundColor: '#F1F5F9',
    },
    iconBoxStudentActive: {
        backgroundColor: '#EFF6FF',
    },
    iconBoxMentorActive: {
        backgroundColor: '#F5F3FF',
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: '#2563EB',
    },
    radioCircleActiveMentor: {
        borderColor: '#7C3AED',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2563EB',
    },
    radioDotMentor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#7C3AED',
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 6,
    },
    roleDesc: {
        fontSize: 13,
        lineHeight: 18,
        color: '#64748B',
        marginBottom: 12,
    },
    featuresList: {
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#334155',
    },
    bottomContainer: {
        paddingTop: 12,
    },
    confirmButton: {
        flexDirection: 'row',
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    confirmButtonStudent: {
        backgroundColor: '#2563EB',
    },
    confirmButtonMentor: {
        backgroundColor: '#7C3AED',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default RoleSelectionScreen;
