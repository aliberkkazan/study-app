// src/screens/Roadmap/ExamSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../redux/store';
import {
  CountryCode,
  SUPPORTED_COUNTRIES,
  getSupportedExamsByCountry,
  ExamOption,
} from '../../utils/countryDetection';
import {
  setSelectedCountry,
  setSelectedExam,
} from '../../redux/roadmapSlice';
import { updateStudyProfile } from '../../api/services/studyProfile';
import { YKS_TRACKS } from '../../data/examPacks';
import { useAppLanguage } from '../../utils/i18n';

export const ExamSelectionScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { language, t } = useAppLanguage();

  const {
    selectedCountry,
    selectedExam,
    targetTrack: currentTrack,
    targetScore: currentTargetScore,
  } = useSelector((state: RootState) => state.roadmap);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);

  // Setup form states preloaded from current redux state
  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    selectedExam && selectedExam !== 'none' ? selectedExam : null
  );
  const [selectedTrack, setSelectedTrack] = useState<string>(currentTrack || 'sayisal');
  const [targetScore, setTargetScore] = useState<string>(currentTargetScore || 'İlk 20.000');
  const [satTargetScore, setSatTargetScore] = useState<string>(currentTargetScore || '1450');

  const currentCountryInfo =
    SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0];

  const availableExams = getSupportedExamsByCountry(selectedCountry);

  const handleCountryChange = (countryCode: CountryCode) => {
    dispatch(setSelectedCountry(countryCode));
    setSelectedExamId(null);
    setCountryPickerVisible(false);
  };

  const handleSelectExam = async (exam: ExamOption) => {
    if (exam.isFreeStudy) {
      // General Study without curriculum
      dispatch(setSelectedExam({ exam: 'none' }));
      try {
        await updateStudyProfile({ track: 'GENERAL' });
      } catch (err) {
        // Ignore background sync error
      }
      Alert.alert(
        t('roadmap.freeStudyActive'),
        t('roadmap.freeStudyActiveDesc'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
      return;
    }

    setSelectedExamId(exam.id);
  };

  const handleConfirmYKS = async () => {
    dispatch(
      setSelectedExam({
        exam: 'yks',
        track: selectedTrack,
        targetScore,
        targetDate: '2027-06-20',
      })
    );
    try {
      const rankNum = targetScore.includes('İlk')
        ? parseInt(targetScore.replace(/\D/g, ''), 10) || 10000
        : undefined;
      const scoreNum = !targetScore.includes('İlk')
        ? parseInt(targetScore.replace(/\D/g, ''), 10) || undefined
        : undefined;

      await updateStudyProfile({
        track: selectedTrack.toUpperCase() as any,
        targetExamDate: '2027-06-20',
        targetRank: rankNum,
        targetScore: scoreNum,
      });
    } catch (err) {
      // Ignore background sync error
    }
    Alert.alert(
      t('roadmap.yksReadyTitle'),
      t('roadmap.yksReadyDesc'),
      [
        {
          text: t('roadmap.goToRoadmap'),
          onPress: () => {
            navigation.navigate('Roadmap');
          },
        },
      ]
    );
  };

  const handleConfirmSAT = async () => {
    dispatch(
      setSelectedExam({
        exam: 'sat',
        targetScore: satTargetScore,
        targetDate: '2027-05-08',
      })
    );
    try {
      await updateStudyProfile({
        track: 'SAT_ALL',
        targetExamDate: '2027-05-08',
        targetScore: parseInt(satTargetScore, 10) || 1450,
      });
    } catch (err) {
      // Ignore background sync error
    }
    Alert.alert(
      t('roadmap.satReadyTitle'),
      t('roadmap.satReadyDesc'),
      [
        {
          text: t('roadmap.viewRoadmap'),
          onPress: () => {
            navigation.navigate('Roadmap');
          },
        },
      ]
    );
  };

  const getTrackName = (id: string, defaultName: string) => {
    switch (id) {
      case 'sayisal': return t('roadmap.trackSayisal');
      case 'esit_agirlik': return t('roadmap.trackEsitAgirlik');
      case 'sozel': return t('roadmap.trackSozel');
      case 'dil': return t('roadmap.trackDil');
      default: return defaultName;
    }
  };

  return (
    <View style={styles.container}>
      {/* Country Selection Header */}
      <View style={styles.regionHeader}>
        <View style={styles.regionLeft}>
          <Text style={styles.regionFlag}>{currentCountryInfo.flag}</Text>
          <View>
            <Text style={styles.regionLabel}>{t('roadmap.regionLabel')}</Text>
            <Text style={styles.regionName}>{currentCountryInfo.name}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.changeRegionBtn}
          onPress={() => setCountryPickerVisible(true)}
        >
          <Text style={styles.changeRegionText}>{t('roadmap.changeRegion')}</Text>
          <Ionicons name="chevron-forward" size={14} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{t('roadmap.selectGoalTitle')}</Text>
        <Text style={styles.screenSubtitle}>
          {t('roadmap.selectGoalSubtitle')}
        </Text>

        {/* Exams List */}
        {availableExams.map((exam) => {
          const isSelected = selectedExamId === exam.id;

          return (
            <TouchableOpacity
              key={exam.id}
              style={[
                styles.examCard,
                isSelected && styles.examCardActive,
                exam.isFreeStudy && styles.freeStudyCard,
              ]}
              onPress={() => handleSelectExam(exam)}
              activeOpacity={0.8}
            >
              <View style={styles.examCardHeader}>
                <View style={styles.examTitleRow}>
                  <Text style={styles.examName}>
                    {exam.isFreeStudy ? t('roadmap.freeStudyTitle') : exam.name}
                  </Text>
                  {exam.badge && (
                    <View style={[styles.badge, exam.isFreeStudy && styles.freeBadge]}>
                      <Text
                        style={[
                          styles.badgeText,
                          exam.isFreeStudy && styles.freeBadgeText,
                        ]}
                      >
                        {exam.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons
                  name={
                    exam.isFreeStudy
                      ? 'infinite-outline'
                      : isSelected
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={22}
                  color={isSelected || exam.isFreeStudy ? '#007AFF' : '#adb5bd'}
                />
              </View>
              <Text style={styles.examFullName}>
                {exam.isFreeStudy ? t('roadmap.freeStudyTitle') : exam.fullName}
              </Text>
              <Text style={styles.examDesc}>
                {exam.isFreeStudy ? t('roadmap.freeStudyDesc') : exam.description}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* YKS Configuration Setup */}
        {selectedExamId === 'yks' && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>{t('roadmap.yksSetupTitle')}</Text>

            <Text style={styles.setupFieldLabel}>{t('roadmap.studyTrackLabel')}</Text>
            <View style={styles.tracksGrid}>
              {YKS_TRACKS.map((tr) => (
                <TouchableOpacity
                  key={tr.id}
                  style={[
                    styles.trackOption,
                    selectedTrack === tr.id && styles.trackOptionActive,
                  ]}
                  onPress={() => setSelectedTrack(tr.id)}
                >
                  <Text
                    style={[
                      styles.trackOptionText,
                      selectedTrack === tr.id && styles.trackOptionTextActive,
                    ]}
                  >
                    {getTrackName(tr.id, tr.name)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.setupFieldLabel}>{t('roadmap.targetRankScoreLabel')}</Text>
            <TextInput
              style={styles.setupInput}
              value={targetScore}
              onChangeText={setTargetScore}
              placeholder={t('roadmap.targetRankScorePlaceholder')}
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmYKS}>
              <Text style={styles.confirmBtnText}>{t('roadmap.startYksRoadmap')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        {/* SAT Configuration Setup */}
        {selectedExamId === 'sat' && (
          <View style={styles.setupCard}>
            <Text style={styles.setupTitle}>{t('roadmap.satSetupTitle')}</Text>

            <Text style={styles.setupFieldLabel}>{t('roadmap.satScoreLabel')}</Text>
            <TextInput
              style={styles.setupInput}
              keyboardType="number-pad"
              value={satTargetScore}
              onChangeText={setSatTargetScore}
              placeholder={t('roadmap.satScorePlaceholder')}
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSAT}>
              <Text style={styles.confirmBtnText}>{t('roadmap.generateSatRoadmap')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Country Switcher Modal */}
      <Modal visible={countryPickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('roadmap.selectRegionTitle')}</Text>
              <TouchableOpacity onPress={() => setCountryPickerVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {t('roadmap.selectRegionSubtitle')}
            </Text>

            {SUPPORTED_COUNTRIES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.countryRow,
                  selectedCountry === item.code && styles.countryRowActive,
                ]}
                onPress={() => handleCountryChange(item.code)}
              >
                <Text style={styles.countryRowFlag}>{item.flag}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.countryRowName}>{item.name}</Text>
                  <Text style={styles.countryRowCode}>
                    {item.code === 'US'
                      ? 'USA (SAT, ACT - YKS hidden)'
                      : item.code === 'TR'
                      ? 'Türkiye (YKS TYT/AYT & Genel)'
                      : 'International'}
                  </Text>
                </View>
                {selectedCountry === item.code && (
                  <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  regionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  regionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  regionFlag: {
    fontSize: 26,
  },
  regionLabel: {
    fontSize: 11,
    color: '#868e96',
    fontWeight: '500',
  },
  regionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  changeRegionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
    gap: 4,
  },
  changeRegionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  examCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f8fbff',
  },
  freeStudyCard: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  badge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1864ab',
  },
  freeBadge: {
    backgroundColor: '#dcfce7',
  },
  freeBadgeText: {
    color: '#15803d',
  },
  examFullName: {
    fontSize: 12,
    color: '#868e96',
    fontWeight: '600',
    marginTop: 4,
  },
  examDesc: {
    fontSize: 13,
    color: '#495057',
    marginTop: 8,
    lineHeight: 18,
  },
  setupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  setupFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 8,
  },
  tracksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  trackOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  trackOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  trackOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  trackOptionTextActive: {
    color: '#fff',
  },
  setupInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 18,
  },
  confirmBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#868e96',
    marginTop: 4,
    marginBottom: 16,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  countryRowActive: {
    backgroundColor: '#f8fbff',
  },
  countryRowFlag: {
    fontSize: 28,
  },
  countryRowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
  },
  countryRowCode: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
