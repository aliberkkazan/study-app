// src/components/roadmap/AccountabilityModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import {
  fetchPartners,
  sendPartnerInvite,
  acceptPartnerCode,
  acceptIncomingInvite,
  rejectIncomingInvite,
  revokePartnerGrant,
  updateShareSettings,
  clearLastGeneratedCode,
  StudyPartner,
} from '../../redux/roadmapSlice';
import { PartnerDetailModal } from './PartnerDetailModal';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AccountabilityModal: React.FC<Props> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    partners,
    incomingInvites = [],
    partnersLoading,
    partnersError,
    lastGeneratedInviteCode,
    shareSettings,
    streakDays,
  } = useSelector((state: RootState) => state.roadmap);

  const [activeTab, setActiveTab] = useState<'list' | 'invite' | 'join'>('list');
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedPartnerForDetail, setSelectedPartnerForDetail] = useState<StudyPartner | null>(null);

  useEffect(() => {
    if (visible) {
      dispatch(fetchPartners());
    }
  }, [visible, dispatch]);

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen partner olarak eklemek istediğiniz kişinin e-posta adresini girin.');
      return;
    }

    try {
      const email = inviteEmail.trim().toLowerCase();
      const res: any = await dispatch(
        sendPartnerInvite({
          email,
        })
      ).unwrap();

      if (res.userExists) {
        Alert.alert(
          'Davet Gönderildi 🎉',
          `${res.targetUser?.name || email} adlı kullanıcıya partnerlik davetiniz başarıyla iletildi!\n\nKarşı taraf uygulamada onayladığında partner listenizde aktif olarak görünecektir.`,
          [
            {
              text: 'Tamam',
              onPress: () => {
                setInviteEmail('');
                setActiveTab('list');
              },
            },
          ]
        );
      } else {
        const code = res.inviteCode;
        Alert.alert(
          'Kullanıcı Bulunamadı 📲',
          `Bu e-posta adresine (${email}) kayıtlı bir Study App hesabı bulunamadı.\n\nArkadaşınızı uygulamaya davet etmek için davet kodunu (${code}) ve bağlantıyı hemen paylaşabilirsiniz!`,
          [
            {
              text: 'Davet Linkini Paylaş',
              onPress: () => {
                Share.share({
                  message: `Study App'te birlikte ders çalışalım! 📚✨\nUygulamayı indir ve partner davet kodumu gir: ${code}\nDavet Linki: https://studyapp.link/invite/${code}`,
                });
                setInviteEmail('');
                setActiveTab('list');
              },
            },
            {
              text: 'Kapat',
              style: 'cancel',
              onPress: () => {
                setInviteEmail('');
                setActiveTab('list');
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Davet Hatası', err || 'Davet oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleQuickShare = async () => {
    try {
      const res: any = await dispatch(sendPartnerInvite({})).unwrap();
      const code = res.inviteCode;
      Share.share({
        message: `Study App'te birlikte ders çalışalım! 📚✨\nUygulamayı indir ve partner davet kodumu gir: ${code}\nDavet Linki: https://studyapp.link/invite/${code}`,
      });
      setActiveTab('list');
    } catch (err: any) {
      Alert.alert('Hata', err || 'Davet linki oluşturulamadı.');
    }
  };

  const handleAcceptIncoming = async (invite: StudyPartner) => {
    try {
      await dispatch(
        acceptIncomingInvite({
          grantId: invite.grantId,
          inviteCode: invite.inviteCode,
        })
      ).unwrap();
      Alert.alert('Harika! 🎉', `${invite.name} ile artık çalışma partnerisiniz!`);
    } catch (err: any) {
      Alert.alert('Hata', err || 'Davet onaylanamadı.');
    }
  };

  const handleRejectIncoming = async (invite: StudyPartner) => {
    Alert.alert(
      'Daveti Reddet',
      `${invite.name} adlı kullanıcıdan gelen partnerlik davetini reddetmek istediğinize emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            try {
              if (invite.grantId) {
                await dispatch(rejectIncomingInvite(invite.grantId)).unwrap();
              }
            } catch (err: any) {
              Alert.alert('Hata', err || 'Davet reddedilemedi.');
            }
          },
        },
      ]
    );
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen 9 haneli davet kodunu girin (Örn: AG-12AB34).');
      return;
    }

    try {
      await dispatch(acceptPartnerCode(joinCode.trim().toUpperCase())).unwrap();
      Alert.alert('Başarılı! 🎉', 'Partner daveti kabul edildi ve hesabınız eşleşti!');
      setJoinCode('');
      setActiveTab('list');
    } catch (err: any) {
      Alert.alert('Eşleşme Hatası', err || 'Geçersiz veya süresi dolmuş davet kodu.');
    }
  };

  const handleRevoke = (partner: StudyPartner) => {
    const grantId = partner.grantId || partner.id;
    dispatch(revokePartnerGrant(grantId))
      .unwrap()
      .then(() => {
        setSelectedPartnerForDetail(null);
        Alert.alert('İşlem Başarılı', `${partner.name} ile bağlantı sonlandırıldı.`);
      })
      .catch((err) => {
        Alert.alert('Hata', err || 'Bağlantı kaldırılamadı.');
      });
  };

  const handleShareInviteCode = (code: string) => {
    Share.share({
      message: `Study App'te birlikte ders çalışalım! Partner Davet Kodum: ${code}\nDavet Linki: https://studyapp.link/invite/${code}`,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Çalışma Partnerleri</Text>
              <Text style={styles.subtitle}>Birlikte çalışın, devamlılığı koruyun</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Segmented Navigation */}
          <View style={styles.segmentedRow}>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'list' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('list')}
            >
              <Text
                style={[styles.segmentText, activeTab === 'list' && styles.segmentTextActive]}
              >
                Partnerlerim ({partners.length})
                {incomingInvites.length > 0 ? ` • 📬 ${incomingInvites.length}` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'invite' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('invite')}
            >
              <Text
                style={[styles.segmentText, activeTab === 'invite' && styles.segmentTextActive]}
              >
                + Partner Ekle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, activeTab === 'join' && styles.segmentBtnActive]}
              onPress={() => setActiveTab('join')}
            >
              <Text
                style={[styles.segmentText, activeTab === 'join' && styles.segmentTextActive]}
              >
                Kodu Gir
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Streak & Consistency Highlight */}
            <View style={styles.streakCard}>
              <View style={styles.streakIconWrapper}>
                <Ionicons name="flame" size={28} color="#FF9500" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.streakTitle}>{streakDays} Günlük Seri!</Text>
                <Text style={styles.streakSubtitle}>
                  Çalışma devamlılığınız partnerlerinize ilham veriyor.
                </Text>
              </View>
            </View>

            {/* TAB 1: PARTNERS LIST */}
            {activeTab === 'list' && (
              <View>
                {/* Incoming Invites Section */}
                {incomingInvites.length > 0 && (
                  <View style={styles.incomingSection}>
                    <View style={styles.incomingHeaderRow}>
                      <Ionicons name="mail-unread" size={20} color="#0284C7" />
                      <Text style={styles.incomingSectionTitle}>
                        Gelen Partnerlik İstekleri ({incomingInvites.length})
                      </Text>
                    </View>
                    {incomingInvites.map((invite) => (
                      <View key={invite.grantId || invite.id} style={styles.incomingCard}>
                        <View style={styles.incomingAvatarCircle}>
                          <Text style={styles.incomingAvatarLetter}>
                            {(invite.name || 'P').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 10 }}>
                          <Text style={styles.incomingPartnerName} numberOfLines={1}>
                            {invite.name}
                          </Text>
                          {invite.email && (
                            <Text style={styles.incomingPartnerEmail} numberOfLines={1}>
                              {invite.email}
                            </Text>
                          )}
                          <Text style={styles.incomingSubtitle}>
                            Seni çalışma partneri olarak eklemek istiyor.
                          </Text>
                        </View>
                        <View style={styles.incomingActionCol}>
                          <TouchableOpacity
                            style={styles.incomingAcceptBtn}
                            onPress={() => handleAcceptIncoming(invite)}
                            disabled={partnersLoading}
                          >
                            <Ionicons name="checkmark-sharp" size={16} color="#fff" />
                            <Text style={styles.incomingAcceptText}>Kabul Et</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.incomingRejectBtn}
                            onPress={() => handleRejectIncoming(invite)}
                            disabled={partnersLoading}
                          >
                            <Ionicons name="close-sharp" size={14} color="#64748B" />
                            <Text style={styles.incomingRejectText}>Reddet</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionHeader}>Kayıtlı Partnerler</Text>
                  {partnersLoading && <ActivityIndicator size="small" color="#007AFF" />}
                </View>

                {partners.length === 0 ? (
                  <View style={styles.emptyPartnerCard}>
                    <Ionicons name="people-outline" size={36} color="#94A3B8" />
                    <Text style={styles.emptyPartnerTitle}>Henüz partner eklenmedi</Text>
                    <Text style={styles.emptyPartnerSub}>
                      Birlikte çalışmak ve birbirinizi motive etmek için "Partner Ekle" sekmesinden e-posta ile davet gönderebilir veya davet linki paylaşabilirsiniz.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setActiveTab('invite')}
                    >
                      <Text style={styles.emptyActionBtnText}>Hemen Bir Partner Ekle</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  partners.map((partner) => {
                    const isActive = partner.status === 'active';
                    return (
                      <TouchableOpacity
                        key={partner.id}
                        style={styles.partnerCard}
                        onPress={() => setSelectedPartnerForDetail(partner)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.avatarCircle,
                            { backgroundColor: isActive ? '#007AFF' : '#94A3B8' },
                          ]}
                        >
                          <Text style={styles.avatarLetter}>
                            {(partner.name || 'P').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.partnerName}>{partner.name}</Text>
                            <View
                              style={[
                                styles.miniBadge,
                                { backgroundColor: isActive ? '#DCFCE7' : '#FEF3C7' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.miniBadgeText,
                                  { color: isActive ? '#15803D' : '#B45309' },
                                ]}
                              >
                                {isActive ? 'Aktif Partner' : 'Davet Bekleniyor'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.partnerMeta}>
                            🎯 Çalışma Partneri • {partner.lastActive || 'Bugün'}
                          </Text>
                          {isActive && partner.weeklyMinutes !== undefined && (
                            <Text style={styles.partnerHours}>
                              Bu hafta: {Math.round(partner.weeklyMinutes / 60)} saat
                            </Text>
                          )}
                          {!isActive && partner.inviteCode && (
                            <View style={styles.codeSnippetRow}>
                              <Text style={styles.codeSnippetText}>Kod: {partner.inviteCode}</Text>
                              <TouchableOpacity
                                onPress={() => handleShareInviteCode(partner.inviteCode!)}
                                style={styles.shareIconBtn}
                              >
                                <Ionicons name="share-outline" size={14} color="#007AFF" />
                                <Text style={styles.shareIconBtnText}>Kodu Paylaş</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {/* TAB 2: INVITE NEW PARTNER */}
            {activeTab === 'invite' && (
              <View style={styles.inviteCard}>
                <Text style={styles.inviteCardTitle}>Yeni Çalışma Partneri Ekle</Text>
                <Text style={styles.inviteCardSub}>
                  Arkadaşınızın e-posta adresini girerek partnerlik isteği gönderin. Hesap uygulamada kayıtlıysa istek doğrudan hesabına ulaşır; yoksa davet linkini hemen paylaşabilirsiniz.
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Arkadaşının E-posta Adresi (Örn: ali@ornek.com)"
                  placeholderTextColor="#999"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />

                <TouchableOpacity
                  style={styles.inviteSubmitBtn}
                  onPress={handleCreateInvite}
                  disabled={partnersLoading}
                >
                  {partnersLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.inviteSubmitText}>Partner Ekle</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.orDividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>VEYA</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.quickShareBtn}
                  onPress={handleQuickShare}
                  disabled={partnersLoading}
                >
                  <Ionicons name="share-social-outline" size={18} color="#007AFF" style={{ marginRight: 8 }} />
                  <Text style={styles.quickShareBtnText}>Hızlı Davet Linki / Kodu Paylaş</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 3: JOIN WITH INVITE CODE */}
            {activeTab === 'join' && (
              <View style={styles.joinCard}>
                <Text style={styles.inviteCardTitle}>Davet Kodu ile Partner Ol</Text>
                <Text style={styles.inviteCardSub}>
                  Başka bir çalışma arkadaşının veya mentorunun seninle paylaştığı 9 haneli davet kodunu girerek hesaplarınızı eşleştirin.
                </Text>

                <TextInput
                  style={[styles.input, styles.joinInput]}
                  placeholder="AG-XXXXXX"
                  placeholderTextColor="#999"
                  value={joinCode}
                  onChangeText={(text) => setJoinCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={9}
                />

                <TouchableOpacity
                  style={[styles.inviteSubmitBtn, { backgroundColor: '#10B981' }]}
                  onPress={handleJoinWithCode}
                  disabled={partnersLoading}
                >
                  {partnersLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="link-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.inviteSubmitText}>Kodu Kabul Et & Eşleş</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Verification Badges Info */}
            <Text style={styles.sectionHeader}>Oturum Doğrulama Rozetleri</Text>
            <View style={styles.badgesInfoCard}>
              <View style={styles.badgeRow}>
                <View style={[styles.badgeTag, { backgroundColor: '#e3fafc' }]}>
                  <Text style={[styles.badgeTagText, { color: '#0c8599' }]}>⚡ Hızlı</Text>
                </View>
                <Text style={styles.badgeDesc}>Sayaç tamamlandı, süre kaydedildi.</Text>
              </View>
              <View style={styles.badgeRow}>
                <View style={[styles.badgeTag, { backgroundColor: '#ebfbee' }]}>
                  <Text style={[styles.badgeTagText, { color: '#2b8a3e' }]}>🎯 Sonuçlu</Text>
                </View>
                <Text style={styles.badgeDesc}>Çözülen soru, doğru ve yanlış girildi.</Text>
              </View>
              <View style={styles.badgeRow}>
                <View style={[styles.badgeTag, { backgroundColor: '#f3f0ff' }]}>
                  <Text style={[styles.badgeTagText, { color: '#6741d9' }]}>🛡️ Doğrulanmış</Text>
                </View>
                <Text style={styles.badgeDesc}>Fotoğraf kanıtı eklenmiş güvenilir oturum.</Text>
              </View>
            </View>

            {/* Sharing & Privacy Settings */}
            <Text style={styles.sectionHeader}>Paylaşım ve Gizlilik İzinleri</Text>
            <View style={styles.privacyCard}>
              <View style={styles.privacyRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.privacyTitle}>Haftalık Çalışma Süresi</Text>
                  <Text style={styles.privacyDesc}>Partnerlerin toplam süreni görebilir.</Text>
                </View>
                <Switch
                  value={shareSettings.shareStudyTime}
                  onValueChange={(val) => dispatch(updateShareSettings({ shareStudyTime: val }))}
                  trackColor={{ true: '#007AFF', false: '#ccc' }}
                />
              </View>

              <View style={styles.privacyRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.privacyTitle}>Tamamlanan Görevler</Text>
                  <Text style={styles.privacyDesc}>Bitirdiğin görevlerin başlıkları görünür.</Text>
                </View>
                <Switch
                  value={shareSettings.shareCompletedTasks}
                  onValueChange={(val) => dispatch(updateShareSettings({ shareCompletedTasks: val }))}
                  trackColor={{ true: '#007AFF', false: '#ccc' }}
                />
              </View>

              <View style={[styles.privacyRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.privacyTitle}>Deneme Netleri / Skorlar</Text>
                  <Text style={styles.privacyDesc}>Deneme sınavı netlerin partnerlerinle paylaşılır.</Text>
                </View>
                <Switch
                  value={shareSettings.shareScores}
                  onValueChange={(val) => dispatch(updateShareSettings({ shareScores: val }))}
                  trackColor={{ true: '#007AFF', false: '#ccc' }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Partner Detail Modal */}
      <PartnerDetailModal
        visible={!!selectedPartnerForDetail}
        partner={selectedPartnerForDetail}
        onClose={() => setSelectedPartnerForDetail(null)}
        onRevoke={handleRevoke}
      />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 13,
    color: '#868e96',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 10,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#007AFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9DB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  streakIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF3BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E67700',
  },
  streakSubtitle: {
    fontSize: 12,
    color: '#D97706',
    marginTop: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
  },
  emptyPartnerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyPartnerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptyPartnerSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyActionBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
  },
  emptyActionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  miniBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  partnerMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  partnerHours: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 3,
  },
  codeSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  codeSnippetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginRight: 8,
  },
  shareIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shareIconBtnText: {
    fontSize: 11,
    color: '#007AFF',
    marginLeft: 3,
    fontWeight: '600',
  },
  inviteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
  },
  joinCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    marginBottom: 20,
  },
  inviteCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  inviteCardSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 10,
  },
  joinInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    borderColor: '#10B981',
  },
  incomingSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    marginBottom: 16,
  },
  incomingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  incomingSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0369A1',
    marginLeft: 6,
  },
  incomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 10,
    marginBottom: 8,
  },
  incomingAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingAvatarLetter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomingPartnerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  incomingPartnerEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  incomingSubtitle: {
    fontSize: 11,
    color: '#0369A1',
    marginTop: 2,
  },
  incomingActionCol: {
    gap: 6,
  },
  incomingAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  incomingAcceptText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  incomingRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  incomingRejectText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginHorizontal: 10,
  },
  quickShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 12,
  },
  quickShareBtnText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inviteSubmitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  badgesInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
  },
  badgeTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 10,
    flex: 1,
  },
  privacyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 30,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  privacyDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});
