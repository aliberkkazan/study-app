// src/screens/Roadmap/RoadmapScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../redux/store';
import {
  toggleRoadmapTaskCompletion,
  dismissRescheduledReason,
  ensureRoadmapTasks,
  resetRoadmapTasks,
} from '../../redux/roadmapSlice';
import { addNewTask, setActiveFocusTask } from '../../redux/tasksSlice';
import { TrialExamModal } from '../../components/roadmap/TrialExamModal';
import { RoadmapTaskItem, RoadmapTaskType } from '../../data/examPacks';
import { getLocalDateString } from '../../utils/date';

export const RoadmapScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const {
    selectedExam,
    targetTrack,
    targetScore,
    suggestedTasks,
    yksTrials,
    satTrials,
  } = useSelector((state: RootState) => state.roadmap);

  const [activeTab, setActiveTab] = useState<'tasks' | 'trials'>('tasks');
  const [trialModalVisible, setTrialModalVisible] = useState(false);

  React.useEffect(() => {
    if (
      selectedExam &&
      selectedExam !== 'none' &&
      (!suggestedTasks || suggestedTasks.length === 0)
    ) {
      dispatch(ensureRoadmapTasks());
    }
  }, [selectedExam, suggestedTasks?.length, dispatch]);

  const examTitle =
    selectedExam === 'yks'
      ? `YKS 2027 (${targetTrack?.toUpperCase() || 'SAYISAL'})`
      : selectedExam === 'sat'
      ? 'Digital SAT'
      : 'Sınavsız / Serbest Çalışma';

  const getTypeBadgeStyle = (type: RoadmapTaskType) => {
    switch (type) {
      case 'learn':
        return { bg: '#e7f5ff', text: '#1864ab', label: 'Öğren / Konu' };
      case 'practice':
        return { bg: '#ebfbee', text: '#2b8a3e', label: 'Soru Pratiği' };
      case 'review':
        return { bg: '#fff4e6', text: '#d9480f', label: 'Tekrar' };
      case 'simulate':
        return { bg: '#f3f0ff', text: '#6741d9', label: 'Deneme Sınavı' };
      default:
        return { bg: '#f1f3f5', text: '#495057', label: 'Görev' };
    }
  };

  const handleStartFocus = (task: RoadmapTaskItem) => {
    dispatch(
      setActiveFocusTask({
        id: task.id,
        title: task.title,
        courseName: task.courseName,
        topicName: task.topicName,
        completed: task.isCompleted,
        status: task.isCompleted ? 'completed' : 'pending',
        createdAt: new Date().toISOString(),
      })
    );
    navigation.navigate('Focus');
  };

  const handleAddToToday = async (task: RoadmapTaskItem) => {
    const today = getLocalDateString();
    await dispatch(
      addNewTask({
        title: task.title,
        courseName: task.courseName,
        topicName: task.topicName,
        goal: task.questionGoal ? `${task.questionGoal} soru hedefi` : `${task.targetMinutes} dk odaklanma`,
        dueDate: today,
        isFlexible: false,
      })
    );
    Alert.alert('Eklendi', `"${task.title}" görevi Today listene eklendi!`, [
      { text: 'Tamam' },
      { text: "Today'e Git", onPress: () => navigation.navigate('Today') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Top Header Card */}
      <View style={styles.topCard}>
        <View style={styles.topCardHeader}>
          <View>
            <View style={styles.examTag}>
              <Ionicons name="compass" size={14} color="#007AFF" />
              <Text style={styles.examTagText}>{examTitle}</Text>
            </View>
            <Text style={styles.targetLabel}>
              Hedef: <Text style={styles.targetBold}>{targetScore || 'Belirlenmedi'}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeExamBtn}
            onPress={() => navigation.navigate('ExamSelection')}
          >
            <Ionicons name="options-outline" size={16} color="#007AFF" />
            <Text style={styles.changeExamText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Milestone Indicator */}
        <View style={styles.milestoneRow}>
          <View style={styles.milestoneProgress}>
            <View style={[styles.milestoneFill, { width: '35%' }]} />
          </View>
          <Text style={styles.milestoneText}>Hafta 1 / 24 • Genel Müfredat İlerlemesi %35</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tasks' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={activeTab === 'tasks' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
            Önerilen Görevler ({suggestedTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'trials' && styles.tabBtnActive]}
          onPress={() => setActiveTab('trials')}
        >
          <Ionicons
            name="analytics-outline"
            size={18}
            color={activeTab === 'trials' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'trials' && styles.tabTextActive]}>
            Deneme Sonuçları
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'tasks' ? (
          <>
            {selectedExam === 'none' || !selectedExam ? (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles-outline" size={48} color="#adb5bd" />
                <Text style={styles.emptyTitle}>Henüz bir sınav seçilmedi</Text>
                <Text style={styles.emptySubtitle}>
                  Sınavını seçerek haftalık önerilen yol haritası görevlerini görebilirsin.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => navigation.navigate('ExamSelection')}
                >
                  <Text style={styles.emptyActionText}>Sınav Seç</Text>
                </TouchableOpacity>
              </View>
            ) : (!suggestedTasks || suggestedTasks.length === 0) ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#2b8a3e" />
                <Text style={styles.emptyTitle}>Önerilen Görev Bulunmuyor</Text>
                <Text style={styles.emptySubtitle}>
                  Bu haftaya ait tüm görevleri tamamlamış olabilirsin veya görev listesi henüz oluşturulmadı.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={() => dispatch(resetRoadmapTasks())}
                >
                  <Text style={styles.emptyActionText}>Görevleri Yenile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              suggestedTasks.map((item) => {
                const badge = getTypeBadgeStyle(item.type);

                return (
                  <View key={item.id} style={styles.taskCard}>
                    {/* Rescheduled Explanation Notice */}
                    {item.rescheduledReason && (
                      <View style={styles.rescheduledNotice}>
                        <Ionicons name="information-circle" size={16} color="#d9480f" />
                        <Text style={styles.rescheduledText}>{item.rescheduledReason}</Text>
                        <TouchableOpacity
                          onPress={() => dispatch(dismissRescheduledReason(item.id))}
                        >
                          <Ionicons name="close" size={14} color="#d9480f" />
                        </TouchableOpacity>
                      </View>
                    )}

                    <View style={styles.taskCardTop}>
                      <View style={[styles.taskTypeBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.taskTypeBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => dispatch(toggleRoadmapTaskCompletion(item.id))}
                      >
                        <Ionicons
                          name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                          size={24}
                          color={item.isCompleted ? '#2b8a3e' : '#ced4da'}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={[
                        styles.taskTitle,
                        item.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {item.title}
                    </Text>

                    <Text style={styles.taskMeta}>
                      📚 {item.courseName} • 🎯 {item.topicName}
                      {item.questionGoal ? ` • ✍️ ${item.questionGoal} Soru` : ''} • ⏱️ {item.targetMinutes} dk
                    </Text>

                    {/* Actions */}
                    <View style={styles.taskActionsRow}>
                      <TouchableOpacity
                        style={styles.actionBtnSecondary}
                        onPress={() => handleAddToToday(item)}
                      >
                        <Ionicons name="calendar-outline" size={15} color="#007AFF" />
                        <Text style={styles.actionBtnSecondaryText}>Today'e Ekle</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtnPrimary}
                        onPress={() => handleStartFocus(item)}
                      >
                        <Ionicons name="play" size={14} color="#fff" />
                        <Text style={styles.actionBtnPrimaryText}>Odaklan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          /* Trials Tab */
          <>
            <TouchableOpacity
              style={styles.logTrialHeaderBtn}
              onPress={() => setTrialModalVisible(true)}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.logTrialHeaderBtnText}>
                {selectedExam === 'sat' ? 'Yeni SAT Skoru Gir' : 'Yeni Deneme Neti Ekle'}
              </Text>
            </TouchableOpacity>

            {selectedExam === 'sat' ? (
              /* SAT Trials */
              satTrials.length === 0 ? (
                <View style={[styles.emptyState, { marginTop: 12 }]}>
                  <Ionicons name="document-text-outline" size={44} color="#adb5bd" />
                  <Text style={styles.emptyTitle}>Henüz SAT Denemesi Eklenmedi</Text>
                  <Text style={styles.emptySubtitle}>
                    Çözdüğün Bluebook veya deneme sınavlarının skorlarını yukarıdaki butona basarak kaydedebilirsin.
                  </Text>
                </View>
              ) : (
                satTrials.map((t) => (
                  <View key={t.id} style={styles.trialCard}>
                    <View style={styles.trialCardHeader}>
                      <Text style={styles.trialCardTitle}>{t.testName}</Text>
                      <Text style={styles.trialCardDate}>{t.date}</Text>
                    </View>
                    <View style={styles.satScoresRow}>
                      <View style={styles.satScoreBox}>
                        <Text style={styles.satScoreLabel}>Reading & Writing</Text>
                        <Text style={styles.satScoreValue}>{t.readingWritingScore}</Text>
                      </View>
                      <View style={styles.satScoreBox}>
                        <Text style={styles.satScoreLabel}>Math</Text>
                        <Text style={styles.satScoreValue}>{t.mathScore}</Text>
                      </View>
                      <View style={[styles.satScoreBox, styles.satTotalScoreBox]}>
                        <Text style={styles.satTotalScoreLabel}>Toplam Skor</Text>
                        <Text style={styles.satTotalScoreValue}>{t.totalScore} / 1600</Text>
                      </View>
                    </View>
                  </View>
                ))
              )
            ) : (
              /* YKS Trials */
              yksTrials.length === 0 ? (
                <View style={[styles.emptyState, { marginTop: 12 }]}>
                  <Ionicons name="document-text-outline" size={44} color="#adb5bd" />
                  <Text style={styles.emptyTitle}>Henüz Deneme Neti Eklenmedi</Text>
                  <Text style={styles.emptySubtitle}>
                    Girdiğin TYT veya AYT deneme sınavı netlerini yukarıdaki butona basarak kaydedebilirsin.
                  </Text>
                </View>
              ) : (
                yksTrials.map((t) => (
                  <View key={t.id} style={styles.trialCard}>
                    <View style={styles.trialCardHeader}>
                      <View style={styles.trialBadgeRow}>
                        <View style={styles.examSubtypeBadge}>
                          <Text style={styles.examSubtypeText}>{t.examType}</Text>
                        </View>
                        <Text style={styles.trialCardTitle}>{t.publisher || 'Deneme'}</Text>
                      </View>
                      <Text style={styles.trialCardDate}>{t.date}</Text>
                    </View>

                    {/* Net Breakdown */}
                    <View style={styles.subjectsGrid}>
                      {t.subjects.map((sub, sIdx) => (
                        <View key={sIdx} style={styles.subjectNetItem}>
                          <Text style={styles.subjectNetName}>{sub.name}</Text>
                          <Text style={styles.subjectNetNumbers}>
                            {sub.correct}D {sub.incorrect}Y = <Text style={styles.netHighlight}>{sub.net}</Text>
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.trialFooter}>
                      <Text style={styles.trialTotalLabel}>Toplam Net:</Text>
                      <Text style={styles.trialTotalValue}>{t.totalNet} Net</Text>
                    </View>
                  </View>
                ))
              )
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Trial Exam Modal */}
      <TrialExamModal
        visible={trialModalVisible}
        onClose={() => setTrialModalVisible(false)}
        examType={selectedExam === 'sat' ? 'sat' : 'yks'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  examTagText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  targetLabel: {
    fontSize: 13,
    color: '#666',
  },
  targetBold: {
    fontWeight: '700',
    color: '#007AFF',
  },
  changeExamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeExamText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  milestoneRow: {
    marginTop: 14,
  },
  milestoneProgress: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  milestoneFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  milestoneText: {
    fontSize: 11,
    color: '#868e96',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rescheduledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  rescheduledText: {
    flex: 1,
    fontSize: 11,
    color: '#d9480f',
    fontWeight: '500',
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#868e96',
  },
  taskMeta: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
  taskActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 10,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  actionBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#343a40',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#868e96',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  logTrialHeaderBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  logTrialHeaderBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  trialCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  trialCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    paddingBottom: 8,
  },
  trialBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  examSubtypeBadge: {
    backgroundColor: '#e7f5ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  examSubtypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },
  trialCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
  },
  trialCardDate: {
    fontSize: 11,
    color: '#adb5bd',
  },
  subjectsGrid: {
    gap: 6,
    marginBottom: 12,
  },
  subjectNetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectNetName: {
    fontSize: 12,
    color: '#495057',
  },
  subjectNetNumbers: {
    fontSize: 12,
    color: '#6c757d',
  },
  netHighlight: {
    fontWeight: '700',
    color: '#007AFF',
  },
  trialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trialTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  trialTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007AFF',
  },
  satScoresRow: {
    flexDirection: 'row',
    gap: 8,
  },
  satScoreBox: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  satTotalScoreBox: {
    backgroundColor: '#e7f5ff',
    borderWidth: 1,
    borderColor: '#a5d8ff',
  },
  satScoreLabel: {
    fontSize: 10,
    color: '#868e96',
    fontWeight: '600',
    textAlign: 'center',
  },
  satScoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginTop: 4,
  },
  satTotalScoreLabel: {
    fontSize: 10,
    color: '#1864ab',
    fontWeight: '700',
    textAlign: 'center',
  },
  satTotalScoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1864ab',
    marginTop: 4,
  },
});
