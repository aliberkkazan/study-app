import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../redux/store';
import { impersonateUser, logout } from '../../redux/authSlice';
import client from '../../api/client';
import { Loading } from '@/components';
import { useAppLanguage } from '../../utils/i18n';

interface AccountUser {
  id: string;
  name: string;
  email?: string;
  role: 'student' | 'mentor' | 'admin';
  mentorCode?: string;
  createdAt?: string;
}

export const AdminAccountSelectionScreen = () => {
  const { t } = useAppLanguage();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { user: currentUser, adminOriginalUser } = useSelector(
    (state: RootState) => state.auth
  );

  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeRoleFilter, setActiveRoleFilter] = useState<'all' | 'student' | 'mentor'>('all');

  // Strict Admin Guard: caller must have admin role
  const isAdmin = currentUser?.role === 'admin' || adminOriginalUser?.role === 'admin';

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch users from backend
      let fetchedUsers: AccountUser[] = [];

      try {
        const res = await client.get('/users');
        if (Array.isArray(res.data)) {
          fetchedUsers = res.data;
        } else if (res.data && Array.isArray((res.data as any).data)) {
          fetchedUsers = (res.data as any).data;
        }
      } catch (err) {
        console.warn('Direct /users fetch failed, trying role-based query fallback:', err);
      }

      // If /users returned empty or requires query parameter
      if (fetchedUsers.length === 0) {
        try {
          const [studentsRes, mentorsRes] = await Promise.all([
            client.get('/users', { params: { role: 'student' } }).catch(() => ({ data: [] })),
            client.get('/users', { params: { role: 'mentor' } }).catch(() => ({ data: [] })),
          ]);

          const studentsData = Array.isArray(studentsRes.data)
            ? studentsRes.data
            : (studentsRes.data as any)?.data || [];
          const mentorsData = Array.isArray(mentorsRes.data)
            ? mentorsRes.data
            : (mentorsRes.data as any)?.data || [];

          const map = new Map<string, AccountUser>();
          [...studentsData, ...mentorsData].forEach((u: any) => {
            const id = u.id || u.sub;
            if (id) {
              map.set(id, { ...u, id });
            }
          });
          fetchedUsers = Array.from(map.values());
        } catch (e) {
          console.error('Failed to fetch role-filtered users:', e);
        }
      }

      // Normalize IDs
      const normalizedUsers = fetchedUsers.map((u: any) => ({
        ...u,
        id: u.id || u.sub,
      }));

      setUsers(normalizedUsers);
    } catch (error: any) {
      console.error('Failed to fetch users for admin account selector:', error);
      Alert.alert(t('common.error'), error?.message || 'Could not load accounts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleSelectAccount = (selectedUser: AccountUser) => {
    if (!isAdmin) {
      Alert.alert(t('common.error'), t('admin.unauthorized'));
      return;
    }

    dispatch(impersonateUser(selectedUser));

    if (selectedUser.role === 'mentor') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MentorTab' }],
      });
    } else if (selectedUser.role === 'student') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }],
      });
    } else {
      Alert.alert(t('admin.panelTitle'), `${selectedUser.name} (${selectedUser.role})`);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logoutTitle'),
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
        },
      },
    ]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (activeRoleFilter !== 'all' && u.role !== activeRoleFilter) {
        return false;
      }
      // Search filter
      if (!searchQuery.trim()) {
        return true;
      }
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchCode = u.mentorCode?.toLowerCase().includes(q);
      const matchId = u.id?.toLowerCase().includes(q);
      return matchName || matchEmail || matchCode || matchId;
    });
  }, [users, activeRoleFilter, searchQuery]);

  const studentCount = useMemo(() => users.filter((u) => u.role === 'student').length, [users]);
  const mentorCount = useMemo(() => users.filter((u) => u.role === 'mentor').length, [users]);

  // Security barrier
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.unauthorizedContainer}>
          <Ionicons name="lock-closed" size={64} color="#EF4444" />
          <Text style={styles.unauthorizedTitle}>{t('admin.unauthorized')}</Text>
          <TouchableOpacity
            style={styles.unauthorizedBtn}
            onPress={() => dispatch(logout())}
          >
            <Text style={styles.unauthorizedBtnText}>{t('profile.logoutTitle')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderUserItem = ({ item }: { item: AccountUser }) => {
    const isCurrent = currentUser?.id === item.id;
    const isMentor = item.role === 'mentor';
    const isStudent = item.role === 'student';

    const roleBadgeBg = isMentor ? '#ECFDF5' : isStudent ? '#EFF6FF' : '#FDF4FF';
    const roleBadgeText = isMentor ? '#059669' : isStudent ? '#2563EB' : '#9333EA';
    const roleIcon = isMentor ? 'school' : isStudent ? 'person' : 'shield-checkmark';

    const initials = item.name
      ? item.name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';

    return (
      <TouchableOpacity
        style={[styles.card, isCurrent && styles.activeCard]}
        onPress={() => handleSelectAccount(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: isMentor ? '#10B981' : isStudent ? '#3B82F6' : '#8B5CF6' },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.nameCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.name || t('profile.user')}
                </Text>
                {isCurrent && (
                  <View style={styles.currentChip}>
                    <Text style={styles.currentChipText}>{t('admin.activeAccount')}</Text>
                  </View>
                )}
              </View>
              {item.email ? (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {item.email}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: roleBadgeBg }]}>
            <Ionicons name={roleIcon} size={12} color={roleBadgeText} style={{ marginRight: 4 }} />
            <Text style={[styles.roleBadgeText, { color: roleBadgeText }]}>
              {item.role === 'mentor'
                ? t('profile.roleMentor')
                : item.role === 'student'
                ? t('profile.roleStudent')
                : t('profile.roleAdmin')}
            </Text>
          </View>
        </View>

        {isMentor && item.mentorCode ? (
          <View style={styles.mentorCodeRow}>
            <Text style={styles.codeLabel}>{t('mentor.mentorCodeLabel') || 'Mentor Kodu'}:</Text>
            <Text style={styles.codeValue}>{item.mentorCode}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.userIdText} numberOfLines={1}>
            ID: {item.id}
          </Text>
          <View style={styles.selectBtn}>
            <Text style={styles.selectBtnText}>{t('admin.switchInto')}</Text>
            <Ionicons name="arrow-forward" size={14} color="#2563EB" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <Loading visible={loading && !refreshing} />

      {/* TOP ADMIN BANNER & HEADER */}
      <View style={styles.topContainer}>
        <View style={styles.headerTopRow}>
          <View style={styles.adminTag}>
            <Ionicons name="shield-checkmark" size={14} color="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.adminTagText}>{t('admin.badge')}</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={styles.logoutBtnText}>{t('profile.logoutTitle')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerTitle}>{t('admin.accountSelectionTitle')}</Text>
        <Text style={styles.headerSubtitle}>{t('admin.accountSelectionSubtitle')}</Text>

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('admin.searchPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>

        {/* ROLE FILTER TABS */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeRoleFilter === 'all' && styles.filterChipActive]}
            onPress={() => setActiveRoleFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeRoleFilter === 'all' && styles.filterChipTextActive]}>
              {t('admin.filterAll')} ({users.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeRoleFilter === 'student' && styles.filterChipActive]}
            onPress={() => setActiveRoleFilter('student')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeRoleFilter === 'student' && styles.filterChipTextActive]}>
              {t('admin.filterStudents')} ({studentCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeRoleFilter === 'mentor' && styles.filterChipActive]}
            onPress={() => setActiveRoleFilter('mentor')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeRoleFilter === 'mentor' && styles.filterChipTextActive]}>
              {t('admin.filterMentors')} ({mentorCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* USER LIST */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={44} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>{t('admin.noUsersFound')}</Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchBtnText}>{t('common.clear') || 'Aramayı Temizle'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topContainer: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 14 : 6,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  adminTagText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    minHeight: '100%',
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#F0F7FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  nameCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  currentChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentChipText: {
    color: '#1E40AF',
    fontSize: 10,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mentorCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  codeLabel: {
    fontSize: 11,
    color: '#64748B',
    marginRight: 6,
    fontWeight: '600',
  },
  codeValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userIdText: {
    fontSize: 10,
    color: '#94A3B8',
    maxWidth: '50%',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  clearSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  unauthorizedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  unauthorizedTitle: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  unauthorizedBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  unauthorizedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdminAccountSelectionScreen;
