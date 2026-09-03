import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Task, CreateSessionPayload, SessionMood } from '../../api/types';
import { t } from '../../utils/i18n';

interface Props {
    visible: boolean;
    task: Task | null;
    durationMinutes: number;
    startedAt: string;
    endedAt: string;
    onClose: () => void;
    onSubmit: (payload: CreateSessionPayload) => Promise<void>;
}

const MOOD_OPTIONS: { mood: SessionMood; label: string; icon: string; color: string }[] = [
    { mood: 'great', label: 'Energized', icon: 'flame', color: '#F59E0B' },
    { mood: 'good', label: 'Focused', icon: 'sparkles', color: '#3B82F6' },
    { mood: 'neutral', label: 'Normal', icon: 'checkmark-circle', color: '#10B981' },
    { mood: 'tired', label: 'Tired', icon: 'bed', color: '#8B5CF6' },
];

export const SessionResultModal: React.FC<Props> = ({
    visible,
    task,
    durationMinutes,
    startedAt,
    endedAt,
    onClose,
    onSubmit,
}) => {
    const [questionsSolved, setQuestionsSolved] = useState('');
    const [correctCount, setCorrectCount] = useState('');
    const [incorrectCount, setIncorrectCount] = useState('');
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState<SessionMood>('great');
    const [proofPhotoUri, setProofPhotoUri] = useState<string | undefined>(undefined);
    const [markTaskCompleted, setMarkTaskCompleted] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (visible) {
            setQuestionsSolved('');
            setCorrectCount('');
            setIncorrectCount('');
            setNotes('');
            setMood('great');
            setProofPhotoUri(undefined);
            setMarkTaskCompleted(true);
            setError('');
            setSubmitting(false);
        }
    }, [visible]);

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1024,
                maxHeight: 1024,
            });

            if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                setProofPhotoUri(result.assets[0].uri);
            }
        } catch (err) {
            console.warn('Image picker error:', err);
        }
    };

    const handleSubmit = async (skipDetails = false) => {
        let qTotal = parseInt(questionsSolved, 10);
        let qCorrect = parseInt(correctCount, 10);
        let qIncorrect = parseInt(incorrectCount, 10);

        if (isNaN(qTotal)) qTotal = 0;
        if (isNaN(qCorrect)) qCorrect = 0;
        if (isNaN(qIncorrect)) qIncorrect = 0;

        if (!skipDetails && (qCorrect + qIncorrect > qTotal) && qTotal > 0) {
            setError('Correct + Incorrect count cannot exceed total questions solved.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            const payload: CreateSessionPayload = {
                taskId: task?.id,
                taskTitle: task?.title,
                courseName: task?.courseName,
                topicName: task?.topicName,
                durationMinutes: Math.max(1, durationMinutes),
                startedAt,
                endedAt,
                questionsSolved: skipDetails ? undefined : (qTotal || undefined),
                correctCount: skipDetails ? undefined : (qCorrect || undefined),
                incorrectCount: skipDetails ? undefined : (qIncorrect || undefined),
                notes: skipDetails ? undefined : (notes.trim() || undefined),
                mood: skipDetails ? undefined : mood,
                proofPhotoUri: skipDetails ? undefined : proofPhotoUri,
                markTaskCompleted: Boolean(task && markTaskCompleted),
            };

            await onSubmit(payload);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save session');
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.sheetContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.congratsIconWrap}>
                                <Ionicons name="sparkles" size={20} color="#F59E0B" />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>Session Completed!</Text>
                                <Text style={styles.headerSubtitle}>
                                    {durationMinutes} min focus session logged
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close" size={22} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {error ? (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {/* Focused Task Card & Completion Toggle */}
                        {task ? (
                            <View style={styles.taskCard}>
                                <View style={styles.taskCardHeader}>
                                    <View style={styles.taskCardCourseBadge}>
                                        <Text style={styles.taskCardCourseText}>
                                            {task.courseName || 'Task'}
                                        </Text>
                                    </View>
                                    <Text style={styles.taskCardTitle} numberOfLines={1}>
                                        {task.title}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.markCompleteToggle}
                                    onPress={() => setMarkTaskCompleted(!markTaskCompleted)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={markTaskCompleted ? 'checkbox' : 'square-outline'}
                                        size={22}
                                        color={markTaskCompleted ? '#10B981' : '#94A3B8'}
                                    />
                                    <Text style={styles.markCompleteToggleText}>
                                        Mark this task as completed
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}

                        {/* Mood / Session Quality */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.sectionLabel}>How was your focus?</Text>
                            <View style={styles.moodRow}>
                                {MOOD_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.mood}
                                        style={[
                                            styles.moodChip,
                                            mood === item.mood && styles.moodChipActive,
                                        ]}
                                        onPress={() => setMood(item.mood)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name={item.icon as any} size={18} color={item.color} />
                                        <Text
                                            style={[
                                                styles.moodText,
                                                mood === item.mood && styles.moodTextActive,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Questions Solved & Accuracy */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.sectionLabel}>Questions & Targets (Optional)</Text>
                            <View style={styles.statsInputsRow}>
                                <View style={styles.statInputWrap}>
                                    <Text style={styles.inputSubLabel}>Total Solved</Text>
                                    <TextInput
                                        style={styles.numberInput}
                                        placeholder="0"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="number-pad"
                                        value={questionsSolved}
                                        onChangeText={setQuestionsSolved}
                                    />
                                </View>

                                <View style={styles.statInputWrap}>
                                    <Text style={[styles.inputSubLabel, { color: '#059669' }]}>
                                        Correct
                                    </Text>
                                    <TextInput
                                        style={[styles.numberInput, styles.numberInputGreen]}
                                        placeholder="0"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="number-pad"
                                        value={correctCount}
                                        onChangeText={setCorrectCount}
                                    />
                                </View>

                                <View style={styles.statInputWrap}>
                                    <Text style={[styles.inputSubLabel, { color: '#DC2626' }]}>
                                        Incorrect
                                    </Text>
                                    <TextInput
                                        style={[styles.numberInput, styles.numberInputRed]}
                                        placeholder="0"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="number-pad"
                                        value={incorrectCount}
                                        onChangeText={setIncorrectCount}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Notes / Takeaways */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.sectionLabel}>Study Notes / Reflection</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="What did you learn? Any questions to review later?"
                                placeholderTextColor="#94A3B8"
                                multiline
                                numberOfLines={3}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>

                        {/* Photo Proof / Notes Attachment */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.sectionLabel}>Photo Proof / Notes (Optional)</Text>
                            {proofPhotoUri ? (
                                <View style={styles.photoPreviewContainer}>
                                    <Image source={{ uri: proofPhotoUri }} style={styles.photoPreview} />
                                    <TouchableOpacity
                                        style={styles.removePhotoBtn}
                                        onPress={() => setProofPhotoUri(undefined)}
                                    >
                                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addPhotoBtn}
                                    onPress={handlePickImage}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="camera-outline" size={20} color="#2563EB" />
                                    <Text style={styles.addPhotoBtnText}>Attach Notes Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.skipBtn}
                            onPress={() => handleSubmit(true)}
                            disabled={submitting}
                        >
                            <Text style={styles.skipBtnText}>Skip Details</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}
                            onPress={() => handleSubmit(false)}
                            disabled={submitting}
                        >
                            <Text style={styles.saveBtnText}>
                                {submitting ? 'Saving...' : 'Save Summary'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    },
    congratsIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '500',
    },
    closeBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: 10,
        borderRadius: 8,
        marginBottom: 14,
        gap: 6,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '500',
    },
    taskCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    taskCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    taskCardCourseBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    taskCardCourseText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
    },
    taskCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    markCompleteToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    markCompleteToggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    inputGroup: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    moodRow: {
        flexDirection: 'row',
        gap: 8,
    },
    moodChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 10,
        gap: 6,
    },
    moodChipActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    moodText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    moodTextActive: {
        color: '#1E40AF',
        fontWeight: '700',
    },
    statsInputsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    statInputWrap: {
        flex: 1,
    },
    inputSubLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 4,
        textAlign: 'center',
    },
    numberInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
    },
    numberInputGreen: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        color: '#059669',
    },
    numberInputRed: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        color: '#DC2626',
    },
    textArea: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1E293B',
        minHeight: 70,
        textAlignVertical: 'top',
    },
    addPhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 14,
        gap: 8,
    },
    addPhotoBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563EB',
    },
    photoPreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    photoPreview: {
        width: '100%',
        height: 140,
        borderRadius: 12,
    },
    removePhotoBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },
    skipBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    saveBtn: {
        flex: 1.8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default SessionResultModal;
