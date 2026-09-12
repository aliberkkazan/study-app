import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../redux/store';
import { stopImpersonating } from '../../redux/authSlice';
import { useAppLanguage } from '../../utils/i18n';

export const AdminImpersonationBanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user, adminOriginalUser } = useSelector((state: RootState) => state.auth);
  const { t } = useAppLanguage();

  if (!adminOriginalUser) {
    return null;
  }

  const roleText =
    user?.role === 'mentor'
      ? t('profile.roleMentor')
      : user?.role === 'student'
      ? t('profile.roleStudent')
      : user?.role || '';

  const handleReturnToAdmin = () => {
    dispatch(stopImpersonating());
    navigation.reset({
      index: 0,
      routes: [{ name: 'AdminAccountSelection' }],
    });
  };

  const handleChangeAccount = () => {
    navigation.navigate('AdminAccountSelection');
  };

  return (
    <View style={styles.safeContainer} pointerEvents="box-none">
      <View style={styles.banner}>
        <View style={styles.leftCol}>
          <View style={styles.badgeRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={14} color="#F59E0B" />
            </View>
            <Text style={styles.badgeText}>{t('admin.impersonationActive')}</Text>
          </View>
          <Text style={styles.userText} numberOfLines={1}>
            {user?.name || t('profile.user')} <Text style={styles.roleSub}>({roleText})</Text>
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.switchBtn}
            onPress={handleChangeAccount}
            activeOpacity={0.8}
          >
            <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.switchBtnText}>{t('admin.changeAccount')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={handleReturnToAdmin}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 10,
    left: 12,
    right: 12,
    zIndex: 99999,
    elevation: 10,
  },
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  userText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  roleSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  exitBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminImpersonationBanner;
