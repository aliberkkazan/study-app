/**
 * Date and timezone helper utilities for mobile client.
 * Ensures consistent local-date handling across different timezones.
 */

/**
 * Returns YYYY-MM-DD for a given Date object in the user's LOCAL timezone.
 */
export const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Normalizes any date input (ISO string, YYYY-MM-DD, or Date) into a local YYYY-MM-DD string.
 */
export const normalizeDateString = (dateInput?: string | Date | null): string => {
    if (!dateInput) return '';

    if (dateInput instanceof Date) {
        return getLocalDateString(dateInput);
    }

    const trimmed = dateInput.trim();
    if (!trimmed) return '';

    // If it's pure YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }

    // If it's an ISO timestamp like 2026-08-24T00:00:00.000Z
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
        return getLocalDateString(parsed);
    }

    return trimmed.split('T')[0];
};

/**
 * Formats a Date or date string to YYYY-MM-DD
 */
export const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    return normalizeDateString(date);
};

/**
 * Checks if a given date corresponds to today (in local timezone).
 */
export const isToday = (dateInput?: string | Date | null): boolean => {
    const normalized = normalizeDateString(dateInput);
    if (!normalized) return false;
    return normalized === getLocalDateString(new Date());
};

/**
 * Checks if a given date corresponds to tomorrow (in local timezone).
 */
export const isTomorrow = (dateInput?: string | Date | null): boolean => {
    const normalized = normalizeDateString(dateInput);
    if (!normalized) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return normalized === getLocalDateString(tomorrow);
};

/**
 * Checks if a given date corresponds to yesterday (in local timezone).
 */
export const isYesterday = (dateInput?: string | Date | null): boolean => {
    const normalized = normalizeDateString(dateInput);
    if (!normalized) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return normalized === getLocalDateString(yesterday);
};

/**
 * Formats a date into a clean, human-readable, localized string.
 * Example outputs: "Today", "Tomorrow", "Yesterday", "Aug 24", "Aug 24, 2026"
 */
export const formatDisplayDate = (
    dateInput?: string | Date | null,
    options: { includeYear?: boolean; locale?: string } = {}
): string => {
    if (!dateInput) return '';

    if (isToday(dateInput)) {
        return 'Today';
    }
    if (isTomorrow(dateInput)) {
        return 'Tomorrow';
    }
    if (isYesterday(dateInput)) {
        return 'Yesterday';
    }

    let parsedDate: Date;
    if (dateInput instanceof Date) {
        parsedDate = dateInput;
    } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        // Avoid timezone shift when parsing YYYY-MM-DD
        const [year, month, day] = dateInput.trim().split('-').map(Number);
        parsedDate = new Date(year, month - 1, day);
    } else {
        parsedDate = new Date(dateInput);
    }

    if (isNaN(parsedDate.getTime())) {
        return String(dateInput);
    }

    const currentYear = new Date().getFullYear();
    const showYear = options.includeYear ?? (parsedDate.getFullYear() !== currentYear);

    return parsedDate.toLocaleDateString(options.locale || undefined, {
        month: 'short',
        day: 'numeric',
        year: showYear ? 'numeric' : undefined,
    });
};
