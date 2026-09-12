/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Icon, Loading } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import {
  logout,
  fetchCurrentUser,
  refreshMentorCode,
  switchUserRole,
} from '../../redux/authSlice';
import {
  fetchStudyProfile,
  fetchStudyProgress,
  setAppLanguage,
} from '../../redux/roadmapSlice';
import { fetchStudents, fetchConnectionRequests, removeMentor } from '../../redux/dataSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  saveLanguagePreference,
} from '../../utils/userPreferences';
import { useAppLanguage } from '../../utils/i18n';
import DeviceInfo from 'react-native-device-info';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user: currentUser, adminOriginalUser, isAuthenticated, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { loading: dataLoading, students, connectionRequests } = useSelector(
    (state: RootState) => state.data
  );
  const {
    streakDays,
    weeklyAvailabilityHours,
  } = useSelector((state: RootState) => state.roadmap);
  const { language, t } = useAppLanguage();

  const route = useRoute();
  const studentParam = (route.params as any)?.student;
  const isViewingStudent = !!studentParam;
  const displayedUser = isViewingStudent ? studentParam : currentUser;

  const roleSwitchUsed = !!currentUser?.hasSwitchedRole;
  const [disconnectingMentorId, setDisconnectingMentorId] = React.useState<string | null>(null);

  const loading = authLoading || dataLoading || !!disconnectingMentorId;

  React.useEffect(() => {
    if (!isViewingStudent && isAuthenticated) {
      dispatch(fetchCurrentUser());
      dispatch(fetchStudyProfile());
      dispatch(fetchStudyProgress());
      dispatch(fetchStudents());
      dispatch(fetchConnectionRequests());
    }
  }, [dispatch, isViewingStudent, isAuthenticated]);

  const handleSwitchRole = () => {
    if (!currentUser?.id) return;
    const targetRole = currentUser.role === 'mentor' ? 'student' : 'mentor';
    const targetRoleName = targetRole === 'mentor' ? t('profile.roleMentor') : t('profile.roleStudent');

    Alert.alert(
      t('profile.switchRoleTitle'),
      t('profile.switchRoleConfirm', { role: targetRoleName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.change'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(switchUserRole()).unwrap();
              Alert.alert(
                t('common.success'),
                t('profile.roleSwitchedSuccess', { role: targetRoleName }),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => {
                      dispatch(logout());
                    },
                  },
                ],
                { cancelable: false }
              );
            } catch (err: any) {
              Alert.alert(t('common.error'), err || t('profile.roleSwitchFailed'));
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logoutTitle'),
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      t('profile.appLanguage'),
      t('profile.selectLang'),
      [
        {
          text: `Türkçe 🇹🇷 ${language === 'tr' ? '✓' : ''}`,
          onPress: async () => {
            if (language !== 'tr') {
              dispatch(setAppLanguage('tr'));
              await saveLanguagePreference('tr');
            }
          },
        },
        {
          text: `English 🇬🇧 ${language === 'en' ? '✓' : ''}`,
          onPress: async () => {
            if (language !== 'en') {
              dispatch(setAppLanguage('en'));
              await saveLanguagePreference('en');
            }
          },
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

  const handleRefreshCode = () => {
    Alert.alert(
      t('profile.refreshMentorCode'),
      t('profile.refreshCodeConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.refresh'),
          style: 'destructive',
          onPress: () => dispatch(refreshMentorCode()),
        },
      ]
    );
  };

  const handleDisconnectMentor = (mentor: { id: string; name: string }) => {
    Alert.alert(
      t('profile.disconnectMentor'),
      t('profile.disconnectMentorConfirm', { name: mentor.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setDisconnectingMentorId(mentor.id);
            try {
              await dispatch(removeMentor(mentor.id)).unwrap();
              Alert.alert(t('common.success'), t('profile.mentorDisconnected'));
            } catch (err: any) {
              Alert.alert(t('common.error'), err || t('common.error'));
            } finally {
              setDisconnectingMentorId(null);
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = () => {
    if (displayedUser?.mentorCode) {
      Clipboard.setString(displayedUser.mentorCode);
      Alert.alert(t('profile.copied'), t('profile.codeCopied'));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };


  const roleLabel =
    displayedUser?.role === 'mentor'
      ? t('profile.roleMentor')
      : displayedUser?.role === 'admin'
        ? t('profile.roleAdmin')
        : t('profile.roleStudent');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Loading visible={loading} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO PROFILE CARD */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{getInitials(displayedUser?.name)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#0284C7" />
            </View>
          </View>

          <Text style={styles.userName}>{displayedUser?.name || t('profile.user')}</Text>
          <Text style={styles.userEmail}>{displayedUser?.email || ''}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleChip}>
              <Ionicons
                name={displayedUser?.role === 'mentor' ? 'school' : 'person'}
                size={13}
                color="#4338CA"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.roleChipText}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        {/* QUICK STATS BAR */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flame" size={20} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>{streakDays} {t('profile.days')}</Text>
            <Text style={styles.statLabel}>{t('profile.studyStreak')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="time" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{weeklyAvailabilityHours || 0} {t('profile.hours')}</Text>
            <Text style={styles.statLabel}>{t('profile.weeklyTarget')}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="trophy" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {t('profile.general')}
            </Text>
            <Text style={styles.statLabel}>{t('profile.target')}</Text>
          </View>
        </View>

        {/* MENTORSHIP & MY STUDENTS (FOR MENTORS ONLY) */}
        {!isViewingStudent && currentUser?.role === 'mentor' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="key" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardSectionTitle}>
                  {t('profile.mentorshipStudents')}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t('profile.studentsCodeSub')}
                </Text>
              </View>
            </View>

            <View style={styles.mentorCodeBox}>
              <TouchableOpacity onPress={copyToClipboard} style={styles.mentorCodeTouch}>
                <Text style={styles.mentorCodeText}>
                  {displayedUser?.mentorCode || '------'}
                </Text>
                <Ionicons name="copy-outline" size={18} color="#4338CA" style={{ marginLeft: 8 }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRefreshCode}
                style={styles.refreshCodeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => navigation.navigate('MentorStudents')}
                activeOpacity={0.8}
              >
                <Ionicons name="people" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryActionButtonText}>
                  {t('profile.manageStudents')} ({students?.length || 0})
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.requestsButton}
                onPress={() => navigation.navigate('MentorRequests')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-unread-outline" size={18} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={styles.requestsButtonText}>
                  {t('profile.incomingRequests')}
                </Text>
                {connectionRequests?.filter((r) => r.status === 'pending').length > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>
                      {connectionRequests.filter((r) => r.status === 'pending').length}
                    </Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color="#007AFF" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CONNECTED MENTORS (FOR STUDENTS ONLY) */}
        {!isViewingStudent && currentUser?.role === 'student' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="school" size={18} color="#4338CA" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardSectionTitle}>
                  {t('profile.connectedMentors')}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {t('profile.mentorsSub')}
                </Text>
              </View>
            </View>

            {displayedUser?.mentors && displayedUser.mentors.length > 0 ? (
              <>
                {displayedUser.mentors.map((m: any) => (
                  <View key={m.id} style={styles.mentorItemRow}>
                    <View style={styles.mentorItemAvatar}>
                      <Text style={styles.mentorItemAvatarText}>
                        {getInitials(m.name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.mentorItemName}>{m.name}</Text>
                      <Text style={styles.mentorItemEmail}>{m.email || 'Mentor'}</Text>
                    </View>
                    <View style={styles.mentorStatusPill}>
                      <Text style={styles.mentorStatusText}>
                        {t('profile.active')}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDisconnectMentor(m)}
                      style={styles.disconnectMentorBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={disconnectingMentorId === m.id || loading}
                    >
                      {disconnectingMentorId === m.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Icon source="link-off" size={16} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.secondaryActionButton, { marginTop: 10 }]}
                  onPress={() => navigation.navigate('JoinMentor')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                  <Text style={styles.secondaryActionButtonText}>
                    {t('profile.addNewMentor')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ paddingTop: 6 }}>
                <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 12 }}>
                  {t('profile.connectMentorSub')}
                </Text>
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => navigation.navigate('JoinMentor')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="link-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryActionButtonText}>
                    {t('profile.connectWithCode')}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ADMIN ACCESS CARD */}
        {!isViewingStudent && (currentUser?.role === 'admin' || !!adminOriginalUser) && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={[styles.statIconWrap, { backgroundColor: '#FEF3C7', marginRight: 12 }]}>
                <Ionicons name="shield-checkmark" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>
                  {t('admin.panelTitle')}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {adminOriginalUser
                    ? t('admin.actingAs', { name: currentUser?.name || '', role: roleLabel })
                    : t('admin.accountSelectionSubtitle')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation.navigate('AdminAccountSelection')}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionButtonText}>
                {adminOriginalUser ? t('admin.changeAccount') : t('admin.accountSelectionTitle')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        )}

        {/* ACCOUNT ROLE & SWITCH */}
        {!isViewingStudent && (
          <View style={styles.compactRoleCard}>
            <View style={styles.compactRoleTopRow}>
              <View style={styles.compactRoleLeft}>
                <View
                  style={[
                    styles.compactRoleIconWrap,
                    {
                      backgroundColor:
                        currentUser?.role === 'mentor' ? '#F5F3FF' : '#EFF6FF',
                    },
                  ]}
                >
                  <Ionicons
                    name={currentUser?.role === 'mentor' ? 'school' : 'person'}
                    size={16}
                    color={currentUser?.role === 'mentor' ? '#7C3AED' : '#2563EB'}
                  />
                </View>
                <View>
                  <Text style={styles.compactRoleLabel}>
                    {t('profile.accountRole')}
                  </Text>
                  <Text style={styles.compactRoleValue}>
                    {roleLabel}
                  </Text>
                </View>
              </View>

              {!roleSwitchUsed ? (
                <TouchableOpacity
                  style={styles.compactSwitchBtn}
                  onPress={handleSwitchRole}
                  activeOpacity={0.8}
                >
                  <Ionicons name="repeat-outline" size={14} color="#0F172A" style={{ marginRight: 4 }} />
                  <Text style={styles.compactSwitchBtnText}>
                    {currentUser?.role === 'mentor'
                      ? t('profile.toStudent')
                      : t('profile.toMentor')}
                  </Text>
                  <View style={styles.compactOneTimeBadge}>
                    <Text style={styles.compactOneTimeBadgeText}>1x</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.compactLockedBadge}>
                  <Ionicons name="lock-closed" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                  <Text style={styles.compactLockedBadgeText}>
                    {t('profile.locked')}
                  </Text>
                </View>
              )}
            </View>

            {!roleSwitchUsed && (
              <Text style={styles.compactRoleHint}>
                {t('profile.oneTimeNotice')}
              </Text>
            )}
          </View>
        )}

        {/* SETTINGS & PREFERENCES */}
        <View style={styles.card}>
          <Text style={[styles.cardSectionTitle, { marginBottom: 12 }]}>
            {t('profile.appPreferences')}
          </Text>

          <TouchableOpacity
            style={styles.settingItemRow}
            onPress={handleLanguageChange}
            activeOpacity={0.7}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="globe-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.settingItemLabel}>
              {t('profile.appLanguage')}
            </Text>
            <View style={styles.settingValueChip}>
              <Text style={styles.settingValueChipText}>
                {language === 'en' ? 'English 🇬🇧' : 'Türkçe 🇹🇷'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={[styles.settingItemRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.settingItemLabel}>
              {t('profile.version')}
            </Text>
            <Text style={styles.versionText}>{DeviceInfo.getVersion()}</Text>
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        {!isViewingStudent && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // HERO CARD
  profileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4338CA',
  },

  // STATS ROW
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },

  // CARDS
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },

  // CARD BUTTONS
  cardActionRow: {
    gap: 8,
    marginTop: 4,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  secondaryActionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // MENTOR CODE
  mentorCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  mentorCodeTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mentorCodeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4338CA',
    letterSpacing: 3,
  },
  refreshCodeBtn: {
    padding: 6,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  requestsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  badgePill: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // CONNECTED MENTORS
  mentorItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  mentorItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4338CA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorItemAvatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  mentorItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  mentorItemEmail: {
    fontSize: 11,
    color: '#64748B',
  },
  mentorStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  mentorStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  disconnectMentorBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },

  // SETTINGS ROWS
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  settingValueChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settingValueChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  versionText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },

  // COMPACT ROLE CARD
  compactRoleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  compactRoleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactRoleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  compactRoleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRoleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  compactRoleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  compactSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  compactSwitchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  compactOneTimeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  compactOneTimeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  compactLockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactLockedBadgeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  compactRoleHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    marginLeft: 42,
  },
});

export default ProfileScreen;