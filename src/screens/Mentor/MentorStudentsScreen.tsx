// src/screens/Mentor/MentorStudentsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../redux/store';
import {
  fetchStudents,
  removeStudent,
  fetchPrograms,
  addProgramItem,
  updateProgramItem,
  deleteProgramItem,
  fetchSubmissions,
  reviewSubmission,
  fetchConnectionRequests,
  ProgramItem,
  TestSubmission,
} from '../../redux/dataSlice';
import { Loading } from '@/components';
import { getLocalDateString } from '../../utils/date';
import { useAppLanguage } from '../../utils/i18n';

export const MentorStudentsScreen: React.FC = () => {
  const { t, language } = useAppLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { students, program, submissions, connectionRequests, loading } = useSelector(
    (state: RootState) => state.data
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'submissions'>('tasks');

  // Task Modal (Add / Edit)
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<ProgramItem | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Submission Review Modal
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<TestSubmission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const loadAllData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchStudents()),
      dispatch(fetchPrograms(selectedStudentId ? { studentId: selectedStudentId } : undefined)),
      dispatch(fetchSubmissions()),
      dispatch(fetchConnectionRequests()),
    ]);
  }, [dispatch, selectedStudentId]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  useEffect(() => {
    if (selectedStudent?.id) {
      dispatch(fetchPrograms({ studentId: selectedStudent.id }));
    }
  }, [dispatch, selectedStudent?.id]);

  const studentTasks = program.filter(
    (p) =>
      ((p.student && String(p.student.id) === String(selectedStudent?.id)) ||
        (!p.student && selectedStudent)) &&
      (!p.mentor || String(p.mentor.id) === String(user?.id))
  );

  const studentSubmissions = submissions.filter(
    (s) => s.student && String(s.student.id) === String(selectedStudent?.id)
  );

  const pendingRequestsCount = connectionRequests.filter((r) => r.status === 'pending').length;

  // Open Add Task Modal
  const handleOpenAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate(getLocalDateString());
    setTaskModalVisible(true);
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task: ProgramItem) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskDueDate(task.dueDate || task.scheduledDate || getLocalDateString());
    setTaskModalVisible(true);
  };

  // Save Task (Add or Update)
  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert(t('common.missingInfo'), t('mentor.missingTitle'));
      return;
    }

    if (!selectedStudent) {
      Alert.alert(t('common.error'), t('mentor.selectStudentFirst'));
      return;
    }

    try {
      if (editingTask) {
        await dispatch(
          updateProgramItem({
            id: editingTask.id,
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            dueDate: taskDueDate.trim() || undefined,
            scheduledDate: taskDueDate.trim() || undefined,
          })
        ).unwrap();
        Alert.alert(t('common.success'), t('mentor.taskUpdatedSuccess'));
      } else {
        await dispatch(
          addProgramItem({
            studentId: selectedStudent.id,
            mentorId: user?.id || '',
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            dueDate: taskDueDate.trim() || undefined,
            scheduledDate: taskDueDate.trim() || undefined,
          })
        ).unwrap();
        Alert.alert(t('common.success'), t('mentor.taskAssignedSuccess', { name: selectedStudent.name }));
      }
      setTaskModalVisible(false);
      dispatch(fetchPrograms(selectedStudent?.id ? { studentId: selectedStudent.id } : undefined));
    } catch (err: any) {
      Alert.alert(t('common.error'), err || t('common.error'));
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    Alert.alert(t('mentor.deleteTask'), t('mentor.deleteTaskConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteProgramItem(taskId)).unwrap();
            Alert.alert(t('common.success'), t('mentor.taskDeleted'));
            dispatch(fetchPrograms(selectedStudent?.id ? { studentId: selectedStudent.id } : undefined));
          } catch (err: any) {
            Alert.alert(t('common.error'), err || t('common.error'));
          }
        },
      },
    ]);
  };

  // Remove Student
  const handleRemoveStudent = (student: { id: string; name: string }) => {
    Alert.alert(
      t('mentor.removeStudent'),
      t('mentor.removeStudentConfirm', { name: student.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await dispatch(removeStudent(student.id));
            if (selectedStudentId === student.id) {
              const remaining = students.filter((s) => s.id !== student.id);
              setSelectedStudentId(remaining.length > 0 ? remaining[0].id : null);
            }
          },
        },
      ]
    );
  };

  // Handle Review Submission
  const handleReviewAction = (approved: boolean) => {
    if (!selectedSubmission) return;

    const confirmTitle = approved
      ? (language === 'tr' ? 'Kanıtı Onayla' : 'Approve Submission')
      : (language === 'tr' ? 'Kanıtı Reddet' : 'Reject Submission');
    const confirmMessage = approved
      ? (language === 'tr' ? 'Bu öğrenci çalışmasını onaylamak istediğinize emin misiniz?' : 'Are you sure you want to approve this student submission?')
      : (language === 'tr' ? 'Bu öğrenci çalışmasını reddetmek istediğinize emin misiniz?' : 'Are you sure you want to reject this student submission?');

    Alert.alert(confirmTitle, confirmMessage, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: approved ? (language === 'tr' ? 'Onayla' : 'Approve') : (language === 'tr' ? 'Reddet' : 'Reject'),
        style: approved ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await dispatch(
              reviewSubmission({
                id: selectedSubmission.id,
                status: approved ? 'approved' : 'rejected',
                feedback:
                  feedbackText.trim() ||
                  (approved
                    ? language === 'tr'
                      ? 'Tebrikler, gayet başarılı!'
                      : 'Great job, well done!'
                    : language === 'tr'
                    ? 'Lütfen tekrar kontrol et.'
                    : 'Please check again and revise.'),
              })
            ).unwrap();
            setReviewModalVisible(false);
            setSelectedSubmission(null);
            setFeedbackText('');
            Alert.alert(t('common.saved'), approved ? t('mentor.submissionApproved') : t('mentor.feedbackSent'));
            dispatch(fetchSubmissions());
          } catch (err: any) {
            Alert.alert(t('common.error'), err || t('common.error'));
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'Ö';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Loading visible={loading && students.length === 0} />

      {/* HEADER BAR */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenHeading}>{t('mentor.managementTitle')}</Text>
          <Text style={styles.screenSubheading}>
            {students.length} {t('mentor.connectedStudentsCount')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => navigation.navigate('MentorRequests')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={18} color="#2563EB" />
          <Text style={styles.requestsButtonText}>{t('mentor.requestsBtn')}</Text>
          {pendingRequestsCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{pendingRequestsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {students.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAllData} />}
        >
          <View style={styles.emptyIconCircle}>
            <Ionicons name="people-outline" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{t('mentor.noStudents')}</Text>
          <Text style={styles.emptyDesc}>{t('mentor.shareCodePrompt')}</Text>

          {pendingRequestsCount > 0 && (
            <TouchableOpacity
              style={styles.viewPendingBtn}
              onPress={() => navigation.navigate('MentorRequests')}
            >
              <Ionicons name="mail-unread-outline" size={18} color="#fff" />
              <Text style={styles.viewPendingBtnText}>
                {pendingRequestsCount} {t('mentor.pendingRequestsBadge')}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.mainContent}>
          {/* HORIZONTAL STUDENT SELECTOR */}
          <View style={styles.studentsSelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentsList}>
              {students.map((st) => {
                const isSelected = selectedStudent?.id === st.id;
                return (
                  <TouchableOpacity
                    key={st.id}
                    style={[styles.studentChip, isSelected && styles.studentChipActive]}
                    onPress={() => setSelectedStudentId(st.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.studentAvatar, isSelected && styles.studentAvatarActive]}>
                      <Text style={[styles.studentAvatarText, isSelected && styles.studentAvatarTextActive]}>
                        {getInitials(st.name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.studentChipName, isSelected && styles.studentChipNameActive]}>
                        {st.name}
                      </Text>
                      <Text style={[styles.studentChipRole, isSelected && styles.studentChipRoleActive]}>
                        {t('profile.roleStudent')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ACTIVE STUDENT DETAILS CARD */}
          {selectedStudent && (
            <View style={styles.studentHeroCard}>
              <View style={styles.studentHeroHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroName}>{selectedStudent.name}</Text>
                  <Text style={styles.heroEmail}>{selectedStudent.email}</Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteStudentBtn}
                  onPress={() => handleRemoveStudent(selectedStudent)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* STATS ROW */}
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{studentTasks.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('mentor.assignedTasksStat')}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>
                    {studentTasks.filter((t) => t.completed).length}
                  </Text>
                  <Text style={styles.heroStatLabel}>{t('mentor.completedStat')}</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatValue}>{studentSubmissions.length}</Text>
                  <Text style={styles.heroStatLabel}>{t('mentor.submissionsStat')}</Text>
                </View>
              </View>
            </View>
          )}

          {/* SECTION TABS: TASKS vs SUBMISSIONS */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.sectionTabBtn, activeTab === 'tasks' && styles.sectionTabBtnActive]}
              onPress={() => setActiveTab('tasks')}
            >
              <Ionicons
                name="list"
                size={16}
                color={activeTab === 'tasks' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.sectionTabText, activeTab === 'tasks' && styles.sectionTabTextActive]}>
                {t('mentor.tasksTab')} ({studentTasks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sectionTabBtn, activeTab === 'submissions' && styles.sectionTabBtnActive]}
              onPress={() => setActiveTab('submissions')}
            >
              <Ionicons
                name="images"
                size={16}
                color={activeTab === 'submissions' ? '#2563EB' : '#64748B'}
              />
              <Text style={[styles.sectionTabText, activeTab === 'submissions' && styles.sectionTabTextActive]}>
                {t('mentor.submissionsTab')} ({studentSubmissions.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVE TAB CONTENT */}
          {activeTab === 'tasks' ? (
            <View style={{ flex: 1 }}>
              {/* ASSIGN TASK BUTTON */}
              <View style={styles.actionRowContainer}>
                <TouchableOpacity
                  style={styles.addTaskPrimaryBtn}
                  onPress={handleOpenAddTask}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.addTaskPrimaryBtnText}>{t('mentor.addTask')}</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={studentTasks}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAllData} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <View style={styles.emptySectionBox}>
                    <Ionicons name="calendar-outline" size={36} color="#CBD5E1" />
                    <Text style={styles.emptySectionTitle}>{t('mentor.noTasksForStudent')}</Text>
                    <Text style={styles.emptySectionDesc}>{t('mentor.noTasksDesc')}</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={[styles.taskCard, item.completed && styles.taskCardCompleted]}>
                    <View style={styles.taskCardHeader}>
                      <View style={styles.taskCardStatusRow}>
                        <Ionicons
                          name={item.completed ? 'checkmark-circle' : 'time-outline'}
                          size={18}
                          color={item.completed ? '#10B981' : '#F59E0B'}
                        />
                        <Text style={[styles.taskCardStatusText, { color: item.completed ? '#10B981' : '#D97706' }]}>
                          {item.completed ? t('task.completedStatus') : t('task.pendingStatus')}
                        </Text>
                      </View>

                      <View style={styles.taskCardActions}>
                        <TouchableOpacity
                          style={styles.taskIconBtn}
                          onPress={() => handleOpenEditTask(item)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="pencil" size={16} color="#2563EB" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.taskIconBtn}
                          onPress={() => handleDeleteTask(item.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={[styles.taskCardTitle, item.completed && styles.taskCardTitleCompleted]}>
                      {item.title}
                    </Text>

                    {item.description ? (
                      <Text style={styles.taskCardDesc}>{item.description}</Text>
                    ) : null}

                    {(item.dueDate || item.scheduledDate) && (
                      <View style={styles.taskCardDateRow}>
                        <Ionicons name="calendar-outline" size={13} color="#64748B" />
                        <Text style={styles.taskCardDateText}>
                          {t('mentor.dueDate')}: {(item.dueDate || item.scheduledDate || '').slice(0, 10)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          ) : (
            /* SUBMISSIONS TAB */
            <FlatList
              data={studentSubmissions}
              keyExtractor={(item) => item.id}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAllData} />}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptySectionBox}>
                  <Ionicons name="images-outline" size={36} color="#CBD5E1" />
                  <Text style={styles.emptySectionTitle}>{t('mentor.noSubmissions')}</Text>
                  <Text style={styles.emptySectionDesc}>{t('mentor.noSubmissionsDesc')}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';

                return (
                  <TouchableOpacity
                    style={styles.submissionCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedSubmission(item);
                      setFeedbackText(item.feedback || '');
                      setReviewModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.submissionThumb} resizeMode="cover" />

                    <View style={styles.submissionInfo}>
                      <View style={styles.submissionStatusRow}>
                        <View
                          style={[
                            styles.statusPill,
                            isApproved
                              ? styles.statusApproved
                              : isRejected
                              ? styles.statusRejected
                              : styles.statusPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              isApproved
                                ? styles.statusTextApproved
                                : isRejected
                                ? styles.statusTextRejected
                                : styles.statusTextPending,
                            ]}
                          >
                            {isApproved
                              ? t('mentor.approvedStatus')
                              : isRejected
                              ? t('mentor.rejectedStatus')
                              : t('mentor.pendingStatus')}
                          </Text>
                        </View>
                        <Text style={styles.submissionDate}>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
                            : ''}
                        </Text>
                      </View>

                      {item.feedback ? (
                        <Text style={styles.submissionFeedback} numberOfLines={2}>
                          💬 "{item.feedback}"
                        </Text>
                      ) : (
                        <Text style={styles.reviewHint}>{t('mentor.feedbackHint')}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* ADD / EDIT TASK MODAL */}
      <Modal visible={taskModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTask
                  ? t('mentor.editTask')
                  : t('mentor.assignTaskTo', { name: selectedStudent?.name || '' })}
              </Text>
              <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>{t('mentor.taskTitle')} *</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('mentor.taskTitlePlaceholder')}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={styles.fieldLabel}>{t('mentor.taskDesc')}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={t('mentor.taskDescPlaceholder')}
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>{t('mentor.dueDatePlan')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YYYY-MM-DD"
              value={taskDueDate}
              onChangeText={setTaskDueDate}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setTaskModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveTask}>
                <Text style={styles.modalSaveText}>
                  {editingTask ? t('common.save') : t('mentor.addTask')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REVIEW SUBMISSION MODAL */}
      <Modal visible={reviewModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('mentor.reviewTitle')}</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedSubmission?.imageUrl && (
              <Image
                source={{ uri: selectedSubmission.imageUrl }}
                style={styles.fullPreviewImage}
                resizeMode="contain"
              />
            )}

            <Text style={styles.fieldLabel}>{t('mentor.feedbackLabel')}</Text>
            <TextInput
              style={[styles.textInput, { height: 70 }]}
              placeholder={t('mentor.feedbackPlaceholder')}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
            />

            <View style={styles.reviewButtonsRow}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleReviewAction(false)}
              >
                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.rejectBtnText}>{t('mentor.reject')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleReviewAction(true)}
              >
                <Ionicons name="checkmark-circle" size={16} color="#fff" />
                <Text style={styles.approveBtnText}>{t('mentor.approve')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubheading: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  requestsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  badgeCount: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  viewPendingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  viewPendingBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
  },
  studentsSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  studentsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  studentChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarActive: {
    backgroundColor: '#2563EB',
  },
  studentAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  studentAvatarTextActive: {
    color: '#FFFFFF',
  },
  studentChipName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  studentChipNameActive: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  studentChipRole: {
    fontSize: 11,
    color: '#94A3B8',
  },
  studentChipRoleActive: {
    color: '#3B82F6',
  },
  studentHeroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  studentHeroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  deleteStudentBtn: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  sectionTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  sectionTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  actionRowContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addTaskPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 11,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addTaskPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    opacity: 0.85,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  taskCardStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIconBtn: {
    padding: 4,
  },
  taskCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  taskCardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  taskCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 6,
  },
  taskCardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  taskCardDateText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptySectionBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 16,
  },
  emptySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySectionDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  submissionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    padding: 10,
    gap: 12,
  },
  submissionThumb: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  submissionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  submissionStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextApproved: {
    color: '#16A34A',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  statusTextPending: {
    color: '#D97706',
  },
  submissionDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  submissionFeedback: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
  },
  reviewHint: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullPreviewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    marginBottom: 12,
  },
  reviewButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#16A34A',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
