import { AxiosError } from 'axios';
import { ApiErrorResponse } from './types';
import { t } from '../utils/i18n';

export class AppError extends Error {
    status?: number;
    code?: string;
    details?: Record<string, unknown>;

    constructor(message: string, status?: number, code?: string, details?: Record<string, unknown>) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export const handleApiError = (error: unknown): AppError => {
    if (error && typeof error === 'object' && 'isAxiosError' in error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;

        let message = t('common.error');

        if (status) {
            switch (status) {
                case 400:
                    message = data?.message || 'Validation Error';
                    break;
                case 401:
                    message = 'Session expired. Please login again.';
                    break;
                case 403:
                    message = 'You do not have permission for this action.';
                    break;
                case 404:
                    message = 'Resource not found.';
                    break;
                case 409:
                    message = 'Conflict. Request already processed.';
                    break;
                case 422:
                    message = 'Invalid or missing data.';
                    break;
                default:
                    if (status >= 500) {
                        message = 'Server error. Please try again later.';
                    }
                    break;
            }
        } else if (axiosError.request) {
            message = t('common.offline');
        }

        return new AppError(message, status, data?.code, data?.details);
    }

    if (error instanceof Error) {
        return new AppError(error.message);
    }

    return new AppError(t('common.error'));
};
