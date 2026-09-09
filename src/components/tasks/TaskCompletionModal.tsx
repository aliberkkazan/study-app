import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from '../../api/types';
import { t, useAppLanguage } from '../../utils/i18n';

interface Props {
    visible: boolean;
    task: Task | null;
    onClose: () => void;
    onDirectComplete: (task: Task) => void;
    onSubmitWithSession: (
        task: Task,
        sessionData: {
            durationMinutes: number;
            questionsSolved?: number;
            correctCount?: number;
            incorrectCount?: number;
            notes?: string;
        }
    ) => Promise<void>;
}

export const TaskCompletionModal: React.FC<Props> = ({
    visible,
    task,
    onClose,
    onDirectComplete,
    onSubmitWithSession,
}) => {
    const { language } = useAppLanguage();
    const [questionsSolved, setQuestionsSolved] = useState('');
    const [correctCount, setCorrectCount] = useState('');
    const [incorrectCount, setIncorrectCount] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('30');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible && task) {
            // Auto-detect question count from task title or goal (e.g. "40 soru")
            const text = `${task.title || ''} ${task.goal || ''} ${task.description || ''}`;
            const match = text.match(/(\d+)\s*(soru|question|q)/i);
            setQuestionsSolved(match ? match[1] : '');
            setCorrectCount('');
            setIncorrectCount('');
            setDurationMinutes('30');
            setNotes('');
            setError('');
            setSubmitting(false);
        }
    }, [visible, task]);

    if (!task) return null;

    const handleSaveWithSession = async () => {
        const qTotal = parseInt(questionsSolved, 10) || 0;
        const qCorrect = parseInt(correctCount, 10) || 0;
        const qIncorrect = parseInt(incorrectCount, 10) || 0;
        const duration = parseInt(durationMinutes, 10) || 1;

        if (qCorrect + qIncorrect > qTotal && qTotal > 0) {
            setError(
                language === 'tr'
                    ? 'Doğru ve yanlış soru sayısı toplam çözülen sorudan fazla olamaz.'
                    : 'Correct and wrong questions cannot exceed total questions.'
            );
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            await onSubmitWithSession(task, {
                durationMinutes: Math.max(1, duration),
                questionsSolved: qTotal > 0 ? qTotal : undefined,
                correctCount: qTotal > 0 ? qCorrect : undefined,
                incorrectCount: qTotal > 0 ? qIncorrect : undefined,
                notes: notes.trim() || undefined,
            });
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Kaydedilirken bir hata oluştu');
            setSubmitting(false);
        }
    };

    const handleOnlyComplete = () => {
        onDirectComplete(task);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.sheetContainer}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.celebrateIconWrap}>
                                <Ionicons name="sparkles" size={20} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.title}>
                                    {language === 'tr' ? 'Tebrikler! 🎉' : 'Great Job! 🎉'}
                                </Text>
                                <Text style={styles.subtitle}>
                                    {language === 'tr'
                                        ? 'Görevi tamamladın. İlerlemene eklemek ister misin?'
                                        : 'You completed this task. Log to your progress?'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollBody}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Task Card Summary */}
                        <View style={styles.taskPreviewCard}>
                            <Text style={styles.taskPreviewTitle} numberOfLines={2}>
                                {task.title}
                            </Text>
                            {task.courseName && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{task.courseName}</Text>
                                </View>
                            )}
                        </View>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Questions Solved Grid */}
                        <Text style={styles.sectionLabel}>
                            {language === 'tr' ? 'Soru Sayıları' : 'Questions'}
                        </Text>
                        <View style={styles.inputsRow}>
                            <View style={styles.inputCol}>
                                <Text style={styles.inputSubLabel}>
                                    {language === 'tr' ? 'Toplam Soru' : 'Total'}
                                </Text>
                                <TextInput
                                    style={styles.numberInput}
                                    keyboardType="numeric"
                                    placeholder="40"
                                    placeholderTextColor="#94A3B8"
                                    value={questionsSolved}
                                    onChangeText={setQuestionsSolved}
                                    maxLength={4}
                                />
                            </View>
                            <View style={styles.inputCol}>
                                <Text style={styles.inputSubLabel}>
                                    {language === 'tr' ? 'Doğru' : 'Correct'}
                                </Text>
                                <TextInput
                                    style={[styles.numberInput, styles.correctInput]}
                                    keyboardType="numeric"
                                    placeholder="35"
                                    placeholderTextColor="#94A3B8"
                                    value={correctCount}
                                    onChangeText={setCorrectCount}
                                    maxLength={4}
                                />
                            </View>
                            <View style={styles.inputCol}>
                                <Text style={styles.inputSubLabel}>
                                    {language === 'tr' ? 'Yanlış' : 'Wrong'}
                                </Text>
                                <TextInput
                                    style={[styles.numberInput, styles.incorrectInput]}
                                    keyboardType="numeric"
                                    placeholder="5"
                                    placeholderTextColor="#94A3B8"
                                    value={incorrectCount}
                                    onChangeText={setIncorrectCount}
                                    maxLength={4}
                                />
                            </View>
                        </View>

                        {/* Duration Input */}
                        <Text style={styles.sectionLabel}>
                            {language === 'tr' ? 'Çalışma Süresi (Dakika)' : 'Duration (Minutes)'}
                        </Text>
                        <View style={styles.durationInputWrap}>
                            <Ionicons name="timer-outline" size={18} color="#64748B" />
                            <TextInput
                                style={styles.durationInput}
                                keyboardType="numeric"
                                placeholder="30"
                                placeholderTextColor="#94A3B8"
                                value={durationMinutes}
                                onChangeText={setDurationMinutes}
                                maxLength={3}
                            />
                            <Text style={styles.durationUnit}>
                                {language === 'tr' ? 'dakika' : 'mins'}
                            </Text>
                        </View>

                        {/* Notes Input */}
                        <Text style={styles.sectionLabel}>
                            {language === 'tr' ? 'Notlar (İsteğe Bağlı)' : 'Notes (Optional)'}
                        </Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder={
                                language === 'tr'
                                    ? 'Zorlandığın konular, formüller veya notlar...'
                                    : 'Reflection notes or key formulas...'
                            }
                            placeholderTextColor="#94A3B8"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={2}
                        />

                        {/* Action Buttons */}
                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSaveWithSession}
                            disabled={submitting}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="analytics" size={18} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>
                                {submitting
                                    ? language === 'tr'
                                        ? 'Kaydediliyor...'
                                        : 'Saving...'
                                    : language === 'tr'
                                    ? 'İlerlemeye Kaydet ve Tamamla'
                                    : 'Log to Progress & Complete'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleOnlyComplete}
                            disabled={submitting}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.skipButtonText}>
                                {language === 'tr'
                                    ? 'Soru/Süre Girmeden Sadece Tamamla'
                                    : 'Complete Without Logging Questions'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    celebrateIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748B',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    scrollBody: {
        padding: 20,
    },
    taskPreviewCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    taskPreviewTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    badge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        padding: 10,
        borderRadius: 10,
        marginBottom: 14,
        gap: 8,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '600',
        flex: 1,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        marginTop: 4,
    },
    inputsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    inputCol: {
        flex: 1,
    },
    inputSubLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 6,
        textAlign: 'center',
    },
    numberInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        height: 48,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    correctInput: {
        borderColor: '#86EFAC',
        backgroundColor: '#F0FDF4',
        color: '#16A34A',
    },
    incorrectInput: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        color: '#DC2626',
    },
    durationInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 16,
        gap: 8,
    },
    durationInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    durationUnit: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    notesInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 10,
        padding: 12,
        fontSize: 13,
        color: '#0F172A',
        minHeight: 56,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    skipButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    skipButtonText: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '600',
    },
});
