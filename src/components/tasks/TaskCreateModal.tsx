import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CreateTaskPayload } from '../../api/types';
import { t } from '../../utils/i18n';
import { getLocalDateString, formatDisplayDate } from '../../utils/date';
import { DatePickerModal } from '../common/DatePickerModal';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

type DateSelection = 'today' | 'tomorrow' | 'flexible' | 'custom';

export const TaskCreateModal: React.FC<Props> = ({ visible, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [courseName, setCourseName] = useState('');
    const [topicName, setTopicName] = useState('');
    const [source, setSource] = useState('');
    const [goal, setGoal] = useState('');
    const [dateOption, setDateOption] = useState<DateSelection>('today');
    const [customDate, setCustomDate] = useState('');
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setTitle('');
        setCourseName('');
        setTopicName('');
        setSource('');
        setGoal('');
        setDateOption('today');
        setCustomDate('');
        setDatePickerVisible(false);
        setError('');
        setSubmitting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            setError('Please enter a task title');
            return;
        }

        let calculatedDueDate: string | undefined = undefined;
        let isFlexible = false;

        const now = new Date();
        if (dateOption === 'today') {
            calculatedDueDate = getLocalDateString(now);
        } else if (dateOption === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            calculatedDueDate = getLocalDateString(tomorrow);
        } else if (dateOption === 'custom' && customDate.trim()) {
            calculatedDueDate = customDate.trim();
        } else {
            isFlexible = true;
        }

        try {
            setSubmitting(true);
            setError('');
            await onSubmit({
                title: title.trim(),
                courseName: courseName.trim() || undefined,
                topicName: topicName.trim() || undefined,
                source: source.trim() || undefined,
                goal: goal.trim() || undefined,
                dueDate: calculatedDueDate,
                isFlexible,
            });
            handleClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <View style={styles.sheetContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="add-circle" size={24} color="#3B82F6" />
                            <Text style={styles.headerTitle}>{t('task.createTask')}</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
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

                        {/* Title Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                {t('task.title')} <Text style={styles.requiredStar}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('task.titlePlaceholder')}
                                placeholderTextColor="#94A3B8"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Due Date Options */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('task.dueDate')}</Text>
                            <View style={styles.dateButtonsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.dateOptionBtn,
                                        dateOption === 'today' && styles.dateOptionBtnActive,
                                    ]}
                                    onPress={() => setDateOption('today')}
                                >
                                    <Text
                                        style={[
                                            styles.dateOptionText,
                                            dateOption === 'today' && styles.dateOptionTextActive,
                                        ]}
                                    >
                                        {t('task.dueToday')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.dateOptionBtn,
                                        dateOption === 'tomorrow' && styles.dateOptionBtnActive,
                                    ]}
                                    onPress={() => setDateOption('tomorrow')}
                                >
                                    <Text
                                        style={[
                                            styles.dateOptionText,
                                            dateOption === 'tomorrow' && styles.dateOptionTextActive,
                                        ]}
                                    >
                                        {t('task.dueTomorrow')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.dateOptionBtn,
                                        dateOption === 'flexible' && styles.dateOptionBtnActive,
                                    ]}
                                    onPress={() => setDateOption('flexible')}
                                >
                                    <Text
                                        style={[
                                            styles.dateOptionText,
                                            dateOption === 'flexible' && styles.dateOptionTextActive,
                                        ]}
                                    >
                                        {t('task.dueFlexible')}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.dateOptionBtn,
                                        dateOption === 'custom' && styles.dateOptionBtnActive,
                                    ]}
                                    onPress={() => {
                                        setDateOption('custom');
                                        if (!customDate) {
                                            setCustomDate(getLocalDateString());
                                        }
                                        setDatePickerVisible(true);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.dateOptionText,
                                            dateOption === 'custom' && styles.dateOptionTextActive,
                                        ]}
                                    >
                                        {t('task.dueCustom')}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {dateOption === 'custom' && (
                                <TouchableOpacity
                                    style={styles.customDateCard}
                                    onPress={() => setDatePickerVisible(true)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.customDateCardLeft}>
                                        <Ionicons name="calendar-outline" size={18} color="#2563EB" />
                                        <Text style={styles.customDateText}>
                                            {customDate
                                                ? formatDisplayDate(customDate, { includeYear: true })
                                                : 'Tap to pick date'}
                                        </Text>
                                    </View>
                                    <View style={styles.changeDateBadge}>
                                        <Text style={styles.changeDateBadgeText}>Select</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Course / Subject */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('task.course')}</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('task.coursePlaceholder')}
                                placeholderTextColor="#94A3B8"
                                value={courseName}
                                onChangeText={setCourseName}
                            />
                        </View>

                        {/* Topic */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('task.topic')}</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={t('task.topicPlaceholder')}
                                placeholderTextColor="#94A3B8"
                                value={topicName}
                                onChangeText={setTopicName}
                            />
                        </View>

                        {/* Goal & Source Row */}
                        <View style={styles.rowInputs}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>{t('task.goal')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('task.goalPlaceholder')}
                                    placeholderTextColor="#94A3B8"
                                    value={goal}
                                    onChangeText={setGoal}
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>{t('task.source')}</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder={t('task.sourcePlaceholder')}
                                    placeholderTextColor="#94A3B8"
                                    value={source}
                                    onChangeText={setSource}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={handleClose}
                            disabled={submitting}
                        >
                            <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            <Text style={styles.submitBtnText}>
                                {submitting ? t('common.loading') : t('common.create')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Custom Date Picker Calendar Modal */}
            <DatePickerModal
                visible={datePickerVisible}
                initialDate={customDate || getLocalDateString()}
                onClose={() => setDatePickerVisible(false)}
                onSelectDate={(pickedDate) => {
                    setCustomDate(pickedDate);
                    setDateOption('custom');
                }}
            />
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
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    closeButton: {
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
        marginBottom: 16,
        gap: 6,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 13,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 16,
    },
    rowInputs: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
    },
    requiredStar: {
        color: '#EF4444',
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1E293B',
    },
    dateButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dateOptionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dateOptionBtnActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    dateOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    dateOptionTextActive: {
        color: '#2563EB',
    },
    customDateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 10,
    },
    customDateCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    customDateText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E40AF',
    },
    changeDateBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    changeDateBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563EB',
    },
    footerActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    submitBtn: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563EB',
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
