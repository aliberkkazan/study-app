import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../redux/store';
import { fetchSessions } from '../../redux/sessionsSlice';
import { fetchTasks } from '../../redux/tasksSlice';
import { ViewState } from '../../components/common/ViewState';
import { OfflineWarning } from '../../components/common/OfflineWarning';
import { formatDisplayDate } from '../../utils/date';
import { t, getLanguage, translateCourseName } from '../../utils/i18n';

const ProgressScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: sessions, stats, loading, error } = useSelector(
        (state: RootState) => state.sessions
    );
    const tasks = useSelector((state: RootState) => state.tasks.items);

    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(() => {
        dispatch(fetchSessions());
        dispatch(fetchTasks());
    }, [dispatch]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchSessions()),
            dispatch(fetchTasks()),
        ]);
        setRefreshing(false);
    };

    // Calculate Task Metrics
    const completedTasksCount = tasks.filter((t) => t.completed || t.status === 'completed').length;
    const totalTasksCount = tasks.filter((t) => t.status !== 'archived').length;
    const taskCompletionRate =
        totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    // Format minutes to "Xh Ym" / "Xsa Ydk" or "Xm" / "Xdk"
    const formatDuration = (mins: number) => {
        const lang = getLanguage();
        const mUnit = lang === 'tr' ? 'dk' : 'm';
        const hUnit = lang === 'tr' ? 'sa' : 'h';
        if (!mins || mins === 0) return `0${mUnit}`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}${hUnit} ${m}${mUnit}`;
        if (h > 0) return `${h}${hUnit}`;
        return `${m}${mUnit}`;
    };

    const renderHeader = () => (
        <View style={styles.headerSection}>
            <Text style={styles.screenSubtitle}>{t('progress.analyticsSubtitle')}</Text>
            <Text style={styles.screenTitle}>{t('nav.progress')}</Text>
        </View>
    );

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <OfflineWarning />

            <ViewState
                isLoading={loading && sessions.length === 0}
                error={sessions.length === 0 ? error : null}
                onRetry={loadData}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                >
                    {renderHeader()}

                    {/* 4 Main Analytics Metric Cards */}
                    <View style={styles.metricsGrid}>
                        {/* Daily Focus Card */}
                        <View style={[styles.metricCard, styles.metricCardPrimary]}>
                            <View style={styles.metricCardHeader}>
                                <View style={[styles.metricIconWrap, { backgroundColor: '#DBEAFE' }]}>
                                    <Ionicons name="flame" size={18} color="#2563EB" />
                                </View>
                                <Text style={styles.metricCardBadge}>{t('progress.today')}</Text>
                            </View>
                            <Text style={styles.metricNumber}>{formatDuration(stats.dailyTotalMinutes)}</Text>
                            <Text style={styles.metricLabel}>{t('progress.dailyTotal')}</Text>
                        </View>

                        {/* Weekly Focus Card */}
                        <View style={[styles.metricCard, styles.metricCardSecondary]}>
                            <View style={styles.metricCardHeader}>
                                <View style={[styles.metricIconWrap, { backgroundColor: '#EDE9FE' }]}>
                                    <Ionicons name="calendar" size={18} color="#7C3AED" />
                                </View>
                                <Text style={[styles.metricCardBadge, { color: '#7C3AED', backgroundColor: '#F5F3FF' }]}>
                                    {t('progress.sevenDays')}
                                </Text>
                            </View>
                            <Text style={styles.metricNumber}>{formatDuration(stats.weeklyTotalMinutes)}</Text>
                            <Text style={styles.metricLabel}>{t('progress.weeklyTotal')}</Text>
                        </View>

                        {/* Questions Solved Card */}
                        <View style={styles.metricCard}>
                            <View style={styles.metricCardHeader}>
                                <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons name="school" size={18} color="#D97706" />
                                </View>
                            </View>
                            <Text style={styles.metricNumber}>{stats.totalQuestionsSolved}</Text>
                            <Text style={styles.metricLabel}>{t('progress.questionsSolved')}</Text>
                        </View>

                        {/* Accuracy Rate Card */}
                        <View style={styles.metricCard}>
                            <View style={styles.metricCardHeader}>
                                <View style={[styles.metricIconWrap, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="checkmark-done-circle" size={18} color="#16A34A" />
                                </View>
                                {stats.accuracyRate > 0 && (
                                    <Text style={[styles.metricCardBadge, { color: '#16A34A', backgroundColor: '#F0FDF4' }]}>
                                        {stats.accuracyRate}%
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.metricNumber}>
                                {stats.totalCorrect}/{stats.totalQuestionsSolved || 0}
                            </Text>
                            <Text style={styles.metricLabel}>{t('progress.correctAccuracy')}</Text>
                        </View>
                    </View>

                    {/* Task Completion Progress Card */}
                    <View style={styles.cardSection}>
                        <View style={styles.cardSectionHeader}>
                            <View style={styles.cardTitleWithIcon}>
                                <Ionicons name="checkbox-outline" size={18} color="#2563EB" />
                                <Text style={styles.cardSectionTitle}>{t('progress.completionRate')}</Text>
                            </View>
                            <Text style={styles.cardSectionStat}>
                                {completedTasksCount}/{totalTasksCount} {t('progress.tasks')} ({taskCompletionRate}%)
                            </Text>
                        </View>

                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${taskCompletionRate}%` },
                                ]}
                            />
                        </View>
                    </View>

                    {/* Subject Distribution Breakdown Card */}
                    {stats.subjectDistribution.length > 0 ? (
                        <View style={styles.cardSection}>
                            <View style={styles.cardSectionHeader}>
                                <View style={styles.cardTitleWithIcon}>
                                    <Ionicons name="pie-chart-outline" size={18} color="#7C3AED" />
                                    <Text style={styles.cardSectionTitle}>{t('progress.subjectBreakdown')}</Text>
                                </View>
                            </View>

                            {/* Multi-segmented horizontal progress bar */}
                            <View style={styles.segmentedBar}>
                                {stats.subjectDistribution.map((sub, i) => (
                                    <View
                                        key={sub.courseName}
                                        style={[
                                            styles.segmentItem,
                                            {
                                                width: `${Math.max(5, sub.percentage)}%`,
                                                backgroundColor: sub.color,
                                                borderTopLeftRadius: i === 0 ? 6 : 0,
                                                borderBottomLeftRadius: i === 0 ? 6 : 0,
                                                borderTopRightRadius:
                                                    i === stats.subjectDistribution.length - 1 ? 6 : 0,
                                                borderBottomRightRadius:
                                                    i === stats.subjectDistribution.length - 1 ? 6 : 0,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>

                            {/* Subject Legend Rows */}
                            <View style={styles.legendContainer}>
                                {stats.subjectDistribution.map((sub) => (
                                    <View key={sub.courseName} style={styles.legendRow}>
                                        <View style={styles.legendLeft}>
                                            <View
                                                style={[
                                                    styles.legendDot,
                                                    { backgroundColor: sub.color },
                                                ]}
                                            />
                                            <Text style={styles.legendName}>{translateCourseName(sub.courseName)}</Text>
                                        </View>
                                        <View style={styles.legendRight}>
                                            <Text style={styles.legendDuration}>
                                                {formatDuration(sub.totalMinutes)}
                                            </Text>
                                            <Text style={styles.legendPercent}>
                                                ({sub.percentage}%)
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {/* Recent Sessions History Feed */}
                    <View style={styles.historySection}>
                        <View style={styles.historySectionHeader}>
                            <Ionicons name="time-outline" size={18} color="#1E293B" />
                            <Text style={styles.historySectionTitle}>
                                {t('progress.recentSessions')}
                            </Text>
                        </View>

                        {sessions.length === 0 ? (
                            <View style={styles.emptyHistoryCard}>
                                <Ionicons name="timer-outline" size={40} color="#CBD5E1" />
                                <Text style={styles.emptyHistoryTitle}>{t('progress.emptyTitle')}</Text>
                                <Text style={styles.emptyHistorySub}>
                                    {t('progress.emptySub')}
                                </Text>
                            </View>
                        ) : (
                            sessions.map((session) => (
                                <View key={session.id} style={styles.sessionCard}>
                                    <View style={styles.sessionCardTop}>
                                        <View style={styles.sessionCardMetaLeft}>
                                            <View style={styles.courseBadge}>
                                                <Text style={styles.courseBadgeText}>
                                                    {translateCourseName(session.courseName)}
                                                </Text>
                                            </View>
                                            {session.topicName ? (
                                                <Text style={styles.topicText}>• {session.topicName}</Text>
                                            ) : null}
                                        </View>

                                        <View style={styles.durationPill}>
                                            <Ionicons name="timer-outline" size={12} color="#2563EB" />
                                            <Text style={styles.durationPillText}>
                                                {session.durationMinutes}{getLanguage() === 'tr' ? 'dk' : 'm'}
                                            </Text>
                                        </View>
                                    </View>

                                    {session.taskTitle ? (
                                        <Text style={styles.sessionTaskTitle}>{session.taskTitle}</Text>
                                    ) : null}

                                    {/* Reflection notes if present */}
                                    {session.notes ? (
                                        <View style={styles.sessionNotesBox}>
                                            <Ionicons name="chatbubble-ellipses-outline" size={13} color="#64748B" />
                                            <Text style={styles.sessionNotesText} numberOfLines={2}>
                                                {session.notes}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Proof image if attached */}
                                    {session.proofPhotoUri ? (
                                        <View style={styles.sessionProofWrap}>
                                            <Image
                                                source={{ uri: session.proofPhotoUri }}
                                                style={styles.sessionProofImage}
                                            />
                                        </View>
                                    ) : null}

                                    {/* Bottom details: Date & Questions breakdown */}
                                    <View style={styles.sessionCardFooter}>
                                        <Text style={styles.sessionDateText}>
                                            {formatDisplayDate(session.startedAt)}
                                        </Text>

                                        {session.questionsSolved ? (
                                            <View style={styles.sessionScoreTag}>
                                                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                                                <Text style={styles.sessionScoreText}>
                                                    {session.correctCount ?? session.questionsSolved}/{session.questionsSolved} {t('progress.correctLabel')}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </ViewState>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingTop: 16,
        marginBottom: 16,
    },
    screenSubtitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 2,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
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
    metricCardPrimary: {
        backgroundColor: '#F0F7FF',
        borderColor: '#BFDBFE',
    },
    metricCardSecondary: {
        backgroundColor: '#FAF5FF',
        borderColor: '#E9D5FF',
    },
    metricCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metricCardBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    metricNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
    },
    metricLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        marginTop: 4,
    },
    cardSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    cardSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardTitleWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardSectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardSectionStat: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2563EB',
        borderRadius: 4,
    },
    segmentedBar: {
        flexDirection: 'row',
        height: 10,
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 14,
    },
    segmentItem: {
        height: '100%',
    },
    legendContainer: {
        gap: 8,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    legendRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    legendDuration: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
    },
    legendPercent: {
        fontSize: 12,
        color: '#64748B',
    },
    historySection: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    historySectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    historySectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    emptyHistoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emptyHistoryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 8,
    },
    emptyHistorySub: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 18,
    },
    sessionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    sessionCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    sessionCardMetaLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    courseBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    courseBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563EB',
    },
    topicText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    durationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        gap: 4,
    },
    durationPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563EB',
    },
    sessionTaskTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 6,
    },
    sessionNotesBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8FAFC',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
        gap: 6,
    },
    sessionNotesText: {
        fontSize: 12,
        color: '#475569',
        flex: 1,
        lineHeight: 16,
    },
    sessionProofWrap: {
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    sessionProofImage: {
        width: '100%',
        height: 100,
        borderRadius: 8,
    },
    sessionCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    sessionDateText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
    },
    sessionScoreTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sessionScoreText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
});

export default ProgressScreen;
