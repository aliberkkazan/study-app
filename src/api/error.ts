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

        const requestUrl = axiosError.config?.url || '';
        const backendMessage = Array.isArray(data?.message)
            ? (data.message as string[]).join(', ')
            : data?.message;

        let message = backendMessage || t('common.error');

        if (status) {
            const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

            switch (status) {
                case 400:
                    message = backendMessage || 'Validation Error';
                    break;
                case 401:
                    if (backendMessage) {
                        message = backendMessage;
                    } else if (isAuthEndpoint) {
                        message = 'Invalid credentials';
                    } else {
                        message = 'Session expired. Please login again.';
                    }
                    break;
                case 403:
                    message = backendMessage || 'You do not have permission for this action.';
                    break;
                case 404:
                    message = backendMessage || 'Resource not found.';
                    break;
                case 409:
                    message = backendMessage || 'Conflict. Request already processed.';
                    break;
                case 422:
                    message = backendMessage || 'Invalid or missing data.';
                    break;
                default:
                    if (status >= 500) {
                        message = backendMessage || 'Server error. Please try again later.';
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
