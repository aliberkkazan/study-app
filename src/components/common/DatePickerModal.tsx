import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getLocalDateString, normalizeDateString, formatDisplayDate } from '../../utils/date';
import { t } from '../../utils/i18n';

interface DatePickerModalProps {
    visible: boolean;
    initialDate?: string; // YYYY-MM-DD
    minDate?: string; // YYYY-MM-DD (optional, default: today)
    onClose: () => void;
    onSelectDate: (dateStr: string) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    visible,
    initialDate,
    minDate,
    onClose,
    onSelectDate,
}) => {
    const todayStr = getLocalDateString();
    const effectiveMin = minDate !== undefined ? minDate : todayStr;

    // Parse initial date or default to today
    const parseInitial = () => {
        if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
            const [y, m, d] = initialDate.split('-').map(Number);
            return { year: y, month: m - 1, date: initialDate };
        }
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth(), date: todayStr };
    };

    const init = parseInitial();
    const [currentYear, setCurrentYear] = useState(init.year);
    const [currentMonth, setCurrentMonth] = useState(init.month);
    const [selectedDateStr, setSelectedDateStr] = useState<string>(init.date);

    // Sync on open
    React.useEffect(() => {
        if (visible) {
            const parsed = parseInitial();
            setCurrentYear(parsed.year);
            setCurrentMonth(parsed.month);
            setSelectedDateStr(parsed.date);
        }
    }, [visible, initialDate]);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const handleConfirm = () => {
        if (selectedDateStr) {
            onSelectDate(selectedDateStr);
        }
        onClose();
    };

    const handleQuickSelect = (type: 'today' | 'tomorrow' | 'nextWeek') => {
        const d = new Date();
        if (type === 'tomorrow') {
            d.setDate(d.getDate() + 1);
        } else if (type === 'nextWeek') {
            d.setDate(d.getDate() + 7);
        }
        const dateStr = getLocalDateString(d);
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
        setSelectedDateStr(dateStr);
    };

    // Calculate calendar matrix
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Day of week: 0 = Sun, 1 = Mon ... In EU/ISO: Mon = 0
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const calendarCells: {
        dayNumber: number;
        dateStr: string;
        isCurrentMonth: boolean;
        isToday: boolean;
        isSelected: boolean;
        isDisabled: boolean;
    }[] = [];

    // Previous month filler days
    for (let i = startDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const dStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarCells.push({
            dayNumber: day,
            dateStr: dStr,
            isCurrentMonth: false,
            isToday: dStr === todayStr,
            isSelected: dStr === selectedDateStr,
            isDisabled: Boolean(effectiveMin && dStr < effectiveMin),
        });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarCells.push({
            dayNumber: day,
            dateStr: dStr,
            isCurrentMonth: true,
            isToday: dStr === todayStr,
            isSelected: dStr === selectedDateStr,
            isDisabled: Boolean(effectiveMin && dStr < effectiveMin),
        });
    }

    // Next month filler days (fill up to complete weeks)
    const remainingCells = 42 - calendarCells.length;
    if (remainingCells < 7 && remainingCells > 0) {
        for (let day = 1; day <= remainingCells; day++) {
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const dStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            calendarCells.push({
                dayNumber: day,
                dateStr: dStr,
                isCurrentMonth: false,
                isToday: dStr === todayStr,
                isSelected: dStr === selectedDateStr,
                isDisabled: Boolean(effectiveMin && dStr < effectiveMin),
            });
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Ionicons name="calendar" size={20} color="#2563EB" />
                            <Text style={styles.headerTitle}>Select Due Date</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close" size={20} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Quick Shortcuts */}
                    <View style={styles.shortcutsRow}>
                        <TouchableOpacity
                            style={[
                                styles.shortcutChip,
                                selectedDateStr === todayStr && styles.shortcutChipActive,
                            ]}
                            onPress={() => handleQuickSelect('today')}
                        >
                            <Text
                                style={[
                                    styles.shortcutChipText,
                                    selectedDateStr === todayStr && styles.shortcutChipTextActive,
                                ]}
                            >
                                Today
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shortcutChip}
                            onPress={() => handleQuickSelect('tomorrow')}
                        >
                            <Text style={styles.shortcutChipText}>Tomorrow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.shortcutChip}
                            onPress={() => handleQuickSelect('nextWeek')}
                        >
                            <Text style={styles.shortcutChipText}>Next Week</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Month Navigator */}
                    <View style={styles.monthNav}>
                        <TouchableOpacity
                            style={styles.navArrow}
                            onPress={handlePrevMonth}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chevron-back" size={18} color="#1E293B" />
                        </TouchableOpacity>

                        <Text style={styles.monthLabel}>
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </Text>

                        <TouchableOpacity
                            style={styles.navArrow}
                            onPress={handleNextMonth}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="chevron-forward" size={18} color="#1E293B" />
                        </TouchableOpacity>
                    </View>

                    {/* Days of Week Header */}
                    <View style={styles.weekHeader}>
                        {DAYS_OF_WEEK.map((d, index) => (
                            <Text key={index} style={styles.weekHeaderText}>
                                {d}
                            </Text>
                        ))}
                    </View>

                    {/* Days Grid */}
                    <View style={styles.daysGrid}>
                        {calendarCells.map((cell, index) => {
                            const isCellSelected = cell.dateStr === selectedDateStr;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayCell,
                                        isCellSelected && styles.dayCellSelected,
                                        cell.isToday && !isCellSelected && styles.dayCellToday,
                                    ]}
                                    disabled={cell.isDisabled}
                                    onPress={() => setSelectedDateStr(cell.dateStr)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.dayCellText,
                                            !cell.isCurrentMonth && styles.dayCellTextMuted,
                                            cell.isDisabled && styles.dayCellTextDisabled,
                                            cell.isToday && !isCellSelected && styles.dayCellTextToday,
                                            isCellSelected && styles.dayCellTextSelected,
                                        ]}
                                    >
                                        {cell.dayNumber}
                                    </Text>
                                    {cell.isToday && !isCellSelected && (
                                        <View style={styles.todayDot} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Selected Date Preview & Footer */}
                    <View style={styles.footer}>
                        <View style={styles.selectedPreview}>
                            <Text style={styles.selectedPreviewLabel}>Selected:</Text>
                            <Text style={styles.selectedPreviewValue}>
                                {formatDisplayDate(selectedDateStr, { includeYear: true })}
                            </Text>
                        </View>

                        <View style={styles.footerActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    closeBtn: {
        padding: 4,
    },
    shortcutsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    shortcutChip: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    shortcutChipActive: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    shortcutChipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    shortcutChipTextActive: {
        color: '#2563EB',
        fontWeight: '700',
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginBottom: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    navArrow: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: '#F8FAFC',
    },
    monthLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 6,
    },
    weekHeaderText: {
        width: 38,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    dayCell: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
    },
    dayCellSelected: {
        backgroundColor: '#2563EB',
    },
    dayCellToday: {
        backgroundColor: '#EFF6FF',
    },
    dayCellText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    dayCellTextMuted: {
        color: '#CBD5E1',
    },
    dayCellTextDisabled: {
        color: '#E2E8F0',
    },
    dayCellTextToday: {
        color: '#2563EB',
        fontWeight: '700',
    },
    dayCellTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    todayDot: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2563EB',
    },
    footer: {
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    selectedPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    selectedPreviewLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },
    selectedPreviewValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563EB',
    },
    footerActions: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    confirmBtn: {
        flex: 1.5,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default DatePickerModal;
