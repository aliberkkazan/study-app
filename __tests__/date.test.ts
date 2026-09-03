import {
    getLocalDateString,
    normalizeDateString,
    isToday,
    isTomorrow,
    isYesterday,
    formatDisplayDate,
} from '../src/utils/date';

describe('Date Utilities', () => {
    it('should return YYYY-MM-DD for a date object in local timezone', () => {
        const d = new Date(2026, 7, 24); // Aug 24, 2026
        expect(getLocalDateString(d)).toBe('2026-08-24');
    });

    it('should normalize ISO timestamp strings to local YYYY-MM-DD', () => {
        expect(normalizeDateString('2026-08-24T14:30:00.000Z')).toBeDefined();
        expect(normalizeDateString('2026-08-24')).toBe('2026-08-24');
        expect(normalizeDateString('')).toBe('');
    });

    it('should correctly identify today, tomorrow, and yesterday', () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        expect(isToday(today)).toBe(true);
        expect(isToday(tomorrow)).toBe(false);
        expect(isTomorrow(tomorrow)).toBe(true);
        expect(isTomorrow(today)).toBe(false);
        expect(isYesterday(yesterday)).toBe(true);
    });

    it('should format display dates into clean labels', () => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        expect(formatDisplayDate(today)).toBe('Today');
        expect(formatDisplayDate(tomorrow)).toBe('Tomorrow');
    });
});
