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
} from 'react-native';
import { Loading } from '@/components';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import {
  logout,
  fetchCurrentUser,
  refreshMentorCode,
} from '../../redux/authSlice';
import {
  fetchStudyProfile,
  fetchStudyProgress,
} from '../../redux/roadmapSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { t } from '../../utils/i18n';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useSelector(
    (state: RootState) => state.auth
  );
  const { loading: dataLoading } = useSelector((state: RootState) => state.data);
  const {
    selectedExam,
    targetTrack,
    targetScore,
    streakDays,
    weeklyAvailabilityHours,
  } = useSelector((state: RootState) => state.roadmap);

  const route = useRoute();
  const studentParam = (route.params as any)?.student;
  const isViewingStudent = !!studentParam;
  const displayedUser = isViewingStudent ? studentParam : currentUser;

  const loading = authLoading || dataLoading;

  React.useEffect(() => {
    if (!isViewingStudent && isAuthenticated) {
      dispatch(fetchCurrentUser());
      dispatch(fetchStudyProfile());
      dispatch(fetchStudyProgress());
    }
  }, [dispatch, isViewingStudent, isAuthenticated]);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const handleRefreshCode = () => {
    Alert.alert(
      'Mentor Kodunu Yenile',
      'Mentor kodunuzu yenilemek istediğinize emin misiniz? Bu işlem her 12 saatte bir yapılabilir.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Yenile',
          style: 'destructive',
          onPress: () => dispatch(refreshMentorCode()),
        },
      ]
    );
  };

  const copyToClipboard = () => {
    if (displayedUser?.mentorCode) {
      Clipboard.setString(displayedUser.mentorCode);
      Alert.alert('Kopyalandı! 📋', 'Mentor kodunuz panoya kopyalandı.');
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

  const examLabel =
    selectedExam === 'yks'
      ? `YKS (${targetTrack ? targetTrack.toUpperCase() : 'Alan Seçilmedi'})`
      : selectedExam === 'sat'
      ? `Digital SAT (${targetTrack ? targetTrack.toUpperCase() : 'Genel'})`
      : 'Sınavsız / Serbest Çalışma';

  const roleLabel =
    displayedUser?.role === 'mentor'
      ? 'Mentor / Eğitmen'
      : displayedUser?.role === 'admin'
      ? 'Yönetici'
      : 'Öğrenci';

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

          <Text style={styles.userName}>{displayedUser?.name || 'Kullanıcı'}</Text>
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

            {selectedExam && selectedExam !== 'none' && (
              <View style={styles.examChip}>
                <Ionicons name="sparkles" size={13} color="#0369A1" style={{ marginRight: 4 }} />
                <Text style={styles.examChipText}>
                  {selectedExam === 'yks' ? 'YKS' : 'SAT'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* QUICK STATS BAR */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="flame" size={20} color="#EA580C" />
            </View>
            <Text style={styles.statValue}>{streakDays} Gün</Text>
            <Text style={styles.statLabel}>Çalışma Serisi</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="time" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{weeklyAvailabilityHours || 0} Saat</Text>
            <Text style={styles.statLabel}>Haftalık Hedef</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="trophy" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {targetScore || (targetTrack ? targetTrack.toUpperCase() : 'Belirlenmedi')}
            </Text>
            <Text style={styles.statLabel}>Hedef</Text>
          </View>
        </View>

        {/* EXAM & ROADMAP CARD */}
        {!isViewingStudent && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="compass" size={18} color="#0284C7" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardSectionTitle}>HEDEF VE SINAV PLANI</Text>
                <Text style={styles.cardMainText}>{examLabel}</Text>
              </View>
            </View>

            <View style={styles.cardActionRow}>
              {selectedExam && selectedExam !== 'none' && (
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  onPress={() => navigation.navigate('Roadmap')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryActionButtonText}>Haftalık Yol Haritası</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => navigation.navigate('ExamSelection')}
                activeOpacity={0.8}
              >
                <Ionicons name="options-outline" size={16} color="#0F172A" style={{ marginRight: 6 }} />
                <Text style={styles.secondaryActionButtonText}>Sınavı Değiştir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MENTOR CODE SECTION (FOR MENTORS) */}
        {!isViewingStudent && displayedUser?.role === 'mentor' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="key" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardSectionTitle}>MENTOR BAĞLANTI KODUNUZ</Text>
                <Text style={styles.cardSubtitle}>
                  Öğrencileriniz bu kodu kullanarak size bağlanabilir
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

            <TouchableOpacity
              style={styles.requestsButton}
              onPress={() => navigation.navigate('MentorRequests' as never)}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={18} color="#007AFF" style={{ marginRight: 8 }} />
              <Text style={styles.requestsButtonText}>Gelen Bağlantı İstekleri</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        )}

        {/* CONNECTED MENTORS (FOR STUDENTS) */}
        {displayedUser?.mentors && displayedUser.mentors.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="school" size={18} color="#4338CA" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.cardSectionTitle}>BAĞLI MENTOR(LAR)</Text>
                <Text style={styles.cardSubtitle}>Gelişiminizi takip eden mentorlarınız</Text>
              </View>
            </View>

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
                  <Text style={styles.mentorStatusText}>Aktif</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SETTINGS & PREFERENCES */}
        <View style={styles.card}>
          <Text style={[styles.cardSectionTitle, { marginBottom: 12 }]}>
            UYGULAMA VE TERCİHLER
          </Text>

          <View style={styles.settingItemRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="globe-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.settingItemLabel}>Uygulama Dili</Text>
            <View style={styles.settingValueChip}>
              <Text style={styles.settingValueChipText}>Türkçe</Text>
            </View>
          </View>

          <View style={styles.settingItemRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="notifications-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.settingItemLabel}>Çalışma Hatırlatıcıları</Text>
            <View style={styles.settingValueChip}>
              <Text style={styles.settingValueChipText}>Açık</Text>
            </View>
          </View>

          <View style={[styles.settingItemRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#334155" />
            </View>
            <Text style={styles.settingItemLabel}>Sürüm</Text>
            <Text style={styles.versionText}>v1.2.0</Text>
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
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  examChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
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
});

export default ProfileScreen;