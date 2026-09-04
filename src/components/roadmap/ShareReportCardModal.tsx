// src/components/roadmap/ShareReportCardModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { getLanguage, translateCourseName } from '../../utils/i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ShareReportCardModal: React.FC<Props> = ({ visible, onClose }) => {
  const { streakDays, selectedExam, targetTrack, targetScore } = useSelector(
    (state: RootState) => state.roadmap
  );
  const { stats } = useSelector((state: RootState) => state.sessions);

  const weeklyHours = Math.round((stats.weeklyTotalMinutes / 60) * 10) / 10;
  const accuracy = Math.round(stats.accuracyRate) || 0;

  const examLabel =
    selectedExam === 'yks'
      ? `YKS (${targetTrack?.toUpperCase() || 'SAYISAL'})`
      : selectedExam === 'sat'
      ? 'Digital SAT'
      : (getLanguage() === 'tr' ? 'Serbest Çalışma' : 'General Study');

  const handleShare = async () => {
    try {
      const message = `🚀 Bu haftaki Study App çalışma raporum:\n⏱️ ${weeklyHours} saat odaklanma\n🎯 %${accuracy} soru doğruluk oranı\n🔥 ${streakDays} günlük kesintisiz çalışma serisi!\nHedef: ${examLabel} ${targetScore ? `(${targetScore})` : ''}\n\n#StudyApp #StudyWithMe #Roadmap`;
      await Share.share({
        message,
        title: 'Haftalık Çalışma Raporum',
      });
      console.log('Weekly report shared successfully');
    } catch (error) {
      console.log('Error sharing weekly report', error);
      Alert.alert('Hata', 'Rapor paylaşılırken bir sorun oluştu.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Haftalık Başarı Kartı</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Visual Share Card */}
          <View style={styles.cardPreview}>
            <View style={styles.cardHeader}>
              <View style={styles.brandRow}>
                <Ionicons name="school" size={22} color="#007AFF" />
                <Text style={styles.brandName}>Study App</Text>
              </View>
              <View style={styles.examBadge}>
                <Text style={styles.examBadgeText}>{examLabel}</Text>
              </View>
            </View>

            <Text style={styles.cardMainGreeting}>Haftalık İlerleme Özeti</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{weeklyHours}s</Text>
                <Text style={styles.statLabel}>Odaklanma</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>%{accuracy}</Text>
                <Text style={styles.statLabel}>Doğruluk</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{streakDays} Gün</Text>
                <Text style={styles.statLabel}>Seri 🔥</Text>
              </View>
            </View>

            {/* Subject Distribution Snippet */}
            {stats.subjectDistribution && stats.subjectDistribution.length > 0 && (
              <View style={styles.subjectsContainer}>
                <Text style={styles.subjectsTitle}>En Çok Çalışılan Dersler:</Text>
                <View style={styles.subjectChipsRow}>
                  {stats.subjectDistribution.slice(0, 3).map((sub, idx) => (
                    <View key={idx} style={[styles.subjectChip, { borderColor: sub.color || '#007AFF' }]}>
                      <Text style={styles.subjectChipText}>
                        {translateCourseName(sub.courseName)} ({Math.round(sub.totalMinutes / 60)}s)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterQuote}>"Küçük adımlar, büyük hedeflere ulaştırır."</Text>
            </View>
          </View>

          {/* Share Actions */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.shareBtnText}>Raporu Paylaş / Gönder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeBtn: {
    padding: 4,
  },
  cardPreview: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  examBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  examBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38bdf8',
  },
  cardMainGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '600',
  },
  subjectsContainer: {
    marginBottom: 14,
  },
  subjectsTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: '600',
  },
  subjectChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subjectChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectChipText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  cardFooterQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94a3b8',
    textAlign: 'center',
  },
  shareBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
