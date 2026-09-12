import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from '../../api/types';
import { useAppLanguage, translateCourseName } from '../../utils/i18n';
import { formatDisplayDate } from '../../utils/date';
import { Icon } from '../shared';

interface Props {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onStartFocus: (task: Task) => void;
    onDelete?: (task: Task) => void;
    onArchive?: (task: Task) => void;
    onUnarchive?: (task: Task) => void;
    onUploadImage?: (task: Task) => void;
    isDeleting?: boolean;
}

export const TaskCard: React.FC<Props> = ({
    task,
    onToggleComplete,
    onStartFocus,
    onDelete,
    onArchive,
    onUnarchive,
    onUploadImage,
    isDeleting = false,
}) => {
    const { language, t } = useAppLanguage();
    const isCompleted = task.completed || task.status === 'completed';
    const isArchived = task.status === 'archived';
    const isMentorAssigned = !!task.assignerId;

    return (
        <View style={[styles.card, isCompleted && styles.cardCompleted]}>
            {/* Header / Mentor Banner */}
            {task.assignerId && (
                <View style={styles.mentorBanner}>
                    <Ionicons name="school-outline" size={14} color="#4F46E5" />
                    <Text style={styles.mentorText}>
                        {t('task.assignedBy')}: {task.assignerName || 'Mentor'}
                    </Text>
                </View>
            )}

            {/* Main Content Row */}
            <View style={styles.mainRow}>
                {/* Completion Checkbox */}
                <TouchableOpacity
                    style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
                    onPress={() => onToggleComplete(task)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>

                {/* Title and Metadata */}
                <View style={styles.contentContainer}>
                    <Text style={[styles.title, isCompleted && styles.titleCompleted]}>
                        {task.title}
                    </Text>

                    {/* Tags row */}
                    <View style={styles.tagsRow}>
                        {task.courseName ? (
                            <View style={styles.courseBadge}>
                                <Text style={styles.courseText}>
                                    {translateCourseName(task.courseName, language)}
                                </Text>
                            </View>
                        ) : null}

                        {task.topicName ? (
                            <View style={styles.topicBadge}>
                                <Text style={styles.topicText}>{task.topicName}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Details: Goal, Source, Date */}
                    <View style={styles.detailsContainer}>
                        {task.goal ? (
                            <View style={styles.detailItem}>
                                <Ionicons name="flag-outline" size={13} color="#64748B" />
                                <Text style={styles.detailText}>{task.goal}</Text>
                            </View>
                        ) : null}

                        {task.source ? (
                            <View style={styles.detailItem}>
                                <Ionicons name="book-outline" size={13} color="#64748B" />
                                <Text style={styles.detailText}>{task.source}</Text>
                            </View>
                        ) : null}

                        {task.dueDate ? (
                            <View style={styles.detailItem}>
                                <Ionicons name="calendar-outline" size={13} color="#64748B" />
                                <Text style={styles.detailText}>{formatDisplayDate(task.dueDate)}</Text>
                            </View>
                        ) : task.isFlexible ? (
                            <View style={styles.detailItem}>
                                <Ionicons name="infinite-outline" size={13} color="#64748B" />
                                <Text style={styles.detailText}>{t('task.dueFlexible')}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                {/* Archive / Unarchive Action */}
                <View style={styles.topActionContainer}>
                    {isArchived ? (
                        <TouchableOpacity
                            onPress={() => onUnarchive && onUnarchive(task)}
                            style={styles.iconButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="arrow-undo-outline" size={18} color="#64748B" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => (onDelete ? onDelete(task) : onArchive && onArchive(task))}
                            style={styles.iconButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <Icon source="delete" size={18} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Bottom Actions */}
            {!isArchived && (
                <View style={styles.cardFooter}>
                    {!isCompleted && (
                        <TouchableOpacity
                            style={styles.focusButton}
                            onPress={() => onStartFocus(task)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="play-circle" size={18} color="#FFFFFF" />
                            <Text style={styles.focusButtonText}>{t('task.startFocus')}</Text>
                        </TouchableOpacity>
                    )}

                    {/* ONLY Mentor-Assigned Tasks: Upload Solution Image (Temporarily hidden) */}
                    {/* {isMentorAssigned && onUploadImage && (
                        <TouchableOpacity
                            style={styles.uploadPhotoButton}
                            onPress={() => onUploadImage(task)}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="camera" size={16} color="#4338CA" />
                            <Text style={styles.uploadPhotoButtonText}>{t('task.uploadPhoto')}</Text>
                        </TouchableOpacity>
                    )} */}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardCompleted: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        opacity: 0.85,
    },
    mentorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
        gap: 4,
    },
    mentorText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        lineHeight: 22,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: '#94A3B8',
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    courseBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    courseText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0284C7',
    },
    topicBadge: {
        backgroundColor: '#F3E8FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    topicText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9333EA',
    },
    detailsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    topActionContainer: {
        marginLeft: 8,
    },
    iconButton: {
        padding: 4,
    },
    cardFooter: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    focusButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E293B',
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderRadius: 10,
        gap: 6,
    },
    focusButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    uploadPhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 6,
    },
    uploadPhotoButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4338CA',
    },
});
