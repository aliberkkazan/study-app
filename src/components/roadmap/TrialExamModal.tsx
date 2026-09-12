// src/components/roadmap/TrialExamModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { addYKSTrial, addSATTrial } from '../../redux/roadmapSlice';
import {
  calculateYKSNet,
  DEFAULT_TYT_SUBJECTS,
  DEFAULT_AYT_SAYISAL_SUBJECTS,
  YKSTrialResult,
  SATTrialResult,
} from '../../data/examPacks';
import { getLocalDateString } from '../../utils/date';

interface Props {
  visible: boolean;
  onClose: () => void;
  examType: 'yks' | 'sat';
}

export const TrialExamModal: React.FC<Props> = ({ visible, onClose, examType }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [yksSubtype, setYksSubtype] = useState<'TYT' | 'AYT'>('TYT');
  const [publisher, setPublisher] = useState('');

  // YKS Subject Inputs
  const initialSubjects = yksSubtype === 'TYT' ? DEFAULT_TYT_SUBJECTS : DEFAULT_AYT_SAYISAL_SUBJECTS;
  const [subjectInputs, setSubjectInputs] = useState<Record<string, { correct: string; incorrect: string }>>(
    {}
  );

  // SAT Inputs
  const [satTestName, setSatTestName] = useState('Bluebook Practice Test');
  const [readingScore, setReadingScore] = useState('650');
  const [mathScore, setMathScore] = useState('700');

  const handleCorrectChange = (name: string, val: string) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [name]: { ...prev[name], correct: val },
    }));
  };

  const handleIncorrectChange = (name: string, val: string) => {
    setSubjectInputs((prev) => ({
      ...prev,
      [name]: { ...prev[name], incorrect: val },
    }));
  };

  const currentSubjects = yksSubtype === 'TYT' ? DEFAULT_TYT_SUBJECTS : DEFAULT_AYT_SAYISAL_SUBJECTS;

  // Calculate live total net for YKS
  const calculatedYKS = currentSubjects.map((sub) => {
    const c = parseInt(subjectInputs[sub.name]?.correct || '0', 10) || 0;
    const w = parseInt(subjectInputs[sub.name]?.incorrect || '0', 10) || 0;
    const net = calculateYKSNet(c, w);
    return {
      name: sub.name,
      maxQuestions: sub.maxQuestions,
      correct: c,
      incorrect: w,
      net,
    };
  });

  const totalYKSNet = calculatedYKS.reduce((acc, curr) => acc + curr.net, 0);

  // SAT Total
  const satTotal = (parseInt(readingScore || '0', 10) || 0) + (parseInt(mathScore || '0', 10) || 0);

  const handleSave = () => {
    const today = getLocalDateString();
    if (examType === 'yks') {
      const newTrial: YKSTrialResult = {
        id: `yks-${Date.now()}`,
        date: today,
        examType: yksSubtype,
        publisher: publisher.trim() || `${yksSubtype} Denemesi`,
        subjects: calculatedYKS,
        totalNet: Math.round(totalYKSNet * 100) / 100,
      };
      dispatch(addYKSTrial(newTrial));
      Alert.alert('Tebrikler!', `${yksSubtype} deneme netiniz (${newTrial.totalNet} Net) başarıyla kaydedildi.`);
    } else {
      const rw = Math.min(800, Math.max(200, parseInt(readingScore || '200', 10)));
      const m = Math.min(800, Math.max(200, parseInt(mathScore || '200', 10)));
      const newSatTrial: SATTrialResult = {
        id: `sat-${Date.now()}`,
        date: today,
        testName: satTestName.trim() || 'Digital SAT Practice',
        readingWritingScore: rw,
        mathScore: m,
        totalScore: rw + m,
      };
      dispatch(addSATTrial(newSatTrial));
      Alert.alert('Congratulations!', `SAT Practice Score (${newSatTrial.totalScore}) recorded successfully.`);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>
                {examType === 'yks' ? 'Deneme Sonucu Gir' : 'Log SAT Practice Score'}
              </Text>
              <Text style={styles.subtitle}>
                {examType === 'yks' ? 'Ders bazlı doğru ve yanlışları yazın' : 'Enter Section Scores (200 - 800)'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {examType === 'yks' ? (
              <>
                {/* YKS Subtype toggle */}
                <View style={styles.segmentContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, yksSubtype === 'TYT' && styles.segmentBtnActive]}
                    onPress={() => setYksSubtype('TYT')}
                  >
                    <Text style={[styles.segmentText, yksSubtype === 'TYT' && styles.segmentTextActive]}>
                      TYT Denemesi
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segmentBtn, yksSubtype === 'AYT' && styles.segmentBtnActive]}
                    onPress={() => setYksSubtype('AYT')}
                  >
                    <Text style={[styles.segmentText, yksSubtype === 'AYT' && styles.segmentTextActive]}>
                      AYT Denemesi
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Publisher Input */}
                <Text style={styles.fieldLabel}>Yayın / Deneme Adı (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Örn: 3D Türkiye Geneli, Bilgi Sarmal..."
                  placeholderTextColor="#999"
                  value={publisher}
                  onChangeText={setPublisher}
                />

                {/* Subject Inputs */}
                <Text style={styles.sectionHeader}>Ders Dağılımı</Text>
                {currentSubjects.map((sub) => {
                  const c = subjectInputs[sub.name]?.correct || '';
                  const w = subjectInputs[sub.name]?.incorrect || '';
                  const currentNet = calculateYKSNet(parseInt(c || '0', 10) || 0, parseInt(w || '0', 10) || 0);

                  return (
                    <View key={sub.name} style={styles.subjectRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subjectName}>{sub.name}</Text>
                        <Text style={styles.subjectMeta}>{sub.maxQuestions} soru • {currentNet} Net</Text>
                      </View>
                      <View style={styles.inputsRow}>
                        <View style={styles.miniInputGroup}>
                          <Text style={styles.miniLabel}>Doğru</Text>
                          <TextInput
                            style={styles.miniInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor="#bbb"
                            maxLength={2}
                            value={c}
                            onChangeText={(val) => handleCorrectChange(sub.name, val)}
                          />
                        </View>
                        <View style={styles.miniInputGroup}>
                          <Text style={styles.miniLabel}>Yanlış</Text>
                          <TextInput
                            style={styles.miniInput}
                            keyboardType="number-pad"
                            placeholder="0"
                            placeholderTextColor="#bbb"
                            maxLength={2}
                            value={w}
                            onChangeText={(val) => handleIncorrectChange(sub.name, val)}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Net Summary Box */}
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Hesaplanan Toplam Net:</Text>
                  <Text style={styles.summaryValue}>{Math.round(totalYKSNet * 100) / 100} Net</Text>
                </View>
              </>
            ) : (
              <>
                {/* SAT Inputs */}
                <Text style={styles.fieldLabel}>Test Name / Source</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Bluebook Practice Test #1"
                  placeholderTextColor="#999"
                  value={satTestName}
                  onChangeText={setSatTestName}
                />

                <View style={styles.satSectionCard}>
                  <Text style={styles.satSectionTitle}>Reading & Writing (200 - 800)</Text>
                  <TextInput
                    style={styles.satInput}
                    keyboardType="number-pad"
                    placeholder="Score (e.g. 680)"
                    placeholderTextColor="#999"
                    maxLength={3}
                    value={readingScore}
                    onChangeText={setReadingScore}
                  />
                </View>

                <View style={styles.satSectionCard}>
                  <Text style={styles.satSectionTitle}>Math (200 - 800)</Text>
                  <TextInput
                    style={styles.satInput}
                    keyboardType="number-pad"
                    placeholder="Score (e.g. 720)"
                    placeholderTextColor="#999"
                    maxLength={3}
                    value={mathScore}
                    onChangeText={setMathScore}
                  />
                </View>

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Total Composite Score:</Text>
                  <Text style={styles.summaryValue}>{satTotal} / 1600</Text>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
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
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  segmentTextActive: {
    color: '#007AFF',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  subjectMeta: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniInputGroup: {
    alignItems: 'center',
  },
  miniLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  miniInput: {
    width: 44,
    height: 36,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    backgroundColor: '#fff',
  },
  summaryCard: {
    backgroundColor: '#e7f5ff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d8ff',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1971c2',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1864ab',
  },
  satSectionCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  satSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  satInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
