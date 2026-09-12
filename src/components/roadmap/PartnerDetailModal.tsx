// src/components/roadmap/PartnerDetailModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StudyPartner } from '../../redux/roadmapSlice';

interface Props {
  visible: boolean;
  partner: StudyPartner | null;
  onClose: () => void;
  onRevoke: (partner: StudyPartner) => void;
}

export const PartnerDetailModal: React.FC<Props> = ({
  visible,
  partner,
  onClose,
  onRevoke,
}) => {
  if (!partner) return null;

  const isActive = partner.status === 'active';
  const roleLabel = '🎯 Çalışma Partneri';

  const handleShareCode = async () => {
    if (!partner.inviteCode) return;
    try {
      await Share.share({
        message: `Study App'te birlikte çalışalım! Partner Davet Kodum: ${partner.inviteCode}`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Partner Profili</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Avatar & Basic Info */}
            <View style={styles.profileHero}>
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: isActive ? '#3B82F6' : '#94A3B8' },
                ]}
              >
                <Text style={styles.avatarLetter}>
                  {(partner.name || 'P').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerRole}>{roleLabel}</Text>
              {partner.email && <Text style={styles.partnerEmail}>{partner.email}</Text>}

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? '#DCFCE7' : '#FEF3C7' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isActive ? '#16A34A' : '#D97706' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isActive ? '#15803D' : '#B45309' },
                  ]}
                >
                  {isActive ? 'Aktif Eşleşme' : 'Davet Bekleniyor (Onaylanmadı)'}
                </Text>
              </View>
            </View>

            {/* If pending invite, show the invite code prominently */}
            {!isActive && partner.inviteCode && (
              <View style={styles.inviteCodeCard}>
                <View style={styles.inviteCodeHeader}>
                  <Ionicons name="key-outline" size={20} color="#D97706" />
                  <Text style={styles.inviteCodeTitle}>Davet Kodu</Text>
                </View>
                <Text style={styles.inviteCodeSub}>
                  Arkadaşın uygulamadaki "Davet Kodu Gir" alanına bu kodu girdiğinde otomatik eşleşeceksiniz:
                </Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{partner.inviteCode}</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
                  <Ionicons name="share-social-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.shareBtnText}>Kodu Paylaş / Gönder</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Study Stats Overview */}
            <Text style={styles.sectionTitle}>Çalışma & İlerleme Durumu</Text>
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="time-outline" size={22} color="#3B82F6" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.statLabel}>Haftalık Odak Süresi</Text>
                  <Text style={styles.statValue}>
                    {isActive
                      ? `${Math.round((partner.weeklyMinutes || 180) / 60)} saat`
                      : 'Eşleşme sonrası açılacak'}
                  </Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="flame-outline" size={22} color="#EA580C" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.statLabel}>Devamlılık Serisi (Streak)</Text>
                  <Text style={styles.statValue}>{isActive ? 'Aktif Çalışıyor 🔥' : 'Beklemede'}</Text>
                </View>
              </View>

              <View style={[styles.statRow, { borderBottomWidth: 0 }]}>
                <View style={styles.statIconWrap}>
                  <Ionicons name="checkmark-done-circle-outline" size={22} color="#16A34A" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.statLabel}>Son Oturum / Aktiflik</Text>
                  <Text style={styles.statValue}>{partner.lastActive || 'Bugün'}</Text>
                </View>
              </View>
            </View>

            {/* Permissions & Data Sharing */}
            <Text style={styles.sectionTitle}>Erişim ve Paylaşım İzinleri</Text>
            <View style={styles.permissionsCard}>
              <View style={styles.permItem}>
                <Ionicons name="eye-outline" size={18} color="#16A34A" />
                <Text style={styles.permText}>Haftalık çalışma süresi ve oturumlar paylaşılıyor</Text>
              </View>
              <View style={styles.permItem}>
                <Ionicons name="checkbox-outline" size={18} color="#16A34A" />
                <Text style={styles.permText}>Tamamlanan görev özetleri görüntülenebilir</Text>
              </View>
              <View style={styles.permItem}>
                <Ionicons
                  name={partner.permissions?.canAssignTasks ? 'create-outline' : 'close-circle-outline'}
                  size={18}
                  color={partner.permissions?.canAssignTasks ? '#16A34A' : '#94A3B8'}
                />
                <Text style={styles.permText}>
                  {partner.permissions?.canAssignTasks
                    ? 'Görev atama yetkisi aktif'
                    : 'Görev atama yetkisi kapalı'}
                </Text>
              </View>
            </View>

            {/* Revoke Action */}
            <TouchableOpacity
              style={styles.revokeButton}
              onPress={() => {
                Alert.alert(
                  'Partnerliği Sonlandır',
                  `${partner.name} ile olan partnerlik bağlantısını kesmek istediğinize emin misiniz?`,
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    {
                      text: 'Bağlantıyı Kes',
                      style: 'destructive',
                      onPress: () => onRevoke(partner),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.revokeButtonText}>
                {isActive ? 'Partnerliği Sonlandır' : 'Daveti İptal Et'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  partnerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  partnerRole: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  partnerEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inviteCodeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inviteCodeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 6,
  },
  inviteCodeSub: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 10,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  statsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  permissionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 24,
  },
  permItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  permText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 10,
    flex: 1,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 4,
  },
  revokeButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
});
