/* eslint-disable dot-notation */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@env';
import { handleApiError } from './error';
import { getSecureRefreshToken, saveSecureSession } from '../utils/secureStorage';

export const PRODUCTION_API_URL = 'https://study-app-backend-production.up.railway.app';

/**
 * Validates and resolves the base API URL.
 * In release mode (!__DEV__), only HTTPS production URLs are permitted.
 */
export const resolveBaseUrl = (configuredUrl?: string): string => {
    const raw = (configuredUrl || API_URL || '').trim();

    const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

    if (!isDevelopment) {
        // Release build safety check
        if (
            !raw ||
            !raw.startsWith('https://') ||
            raw.includes('localhost') ||
            raw.includes('127.0.0.1') ||
            raw.includes('10.0.')
        ) {
            console.warn('Insecure or invalid release API_URL detected. Forcing production HTTPS endpoint.');
            return `${PRODUCTION_API_URL}/`;
        }
    }

    if (!raw) {
        return `${PRODUCTION_API_URL}/`;
    }

    return raw.endsWith('/') ? raw : `${raw}/`;
};

const client = axios.create({
    baseURL: resolveBaseUrl(),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let currentAuthToken: string | null = null;
type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export const registerSessionExpiredHandler = (handler: SessionExpiredHandler) => {
    sessionExpiredHandler = handler;
};

export const setAuthToken = (token: string | null) => {
    currentAuthToken = token;
    if (token) {
        client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete client.defaults.headers.common['Authorization'];
    }
};

export const getAuthToken = (): string | null => currentAuthToken;

// Request Interceptor: ensure Authorization header is present when token exists
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (currentAuthToken && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${currentAuthToken}`;
        }
        return config;
    },
    (error) => Promise.reject(handleApiError(error))
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response Interceptor: centralized error handling, 401 logout/refresh
client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const requestUrl = originalRequest?.url || '';

        const isAuthEndpoint =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/refresh');

        if (status === 401 && !isAuthEndpoint && originalRequest && !originalRequest._retry) {
            const refreshToken = await getSecureRefreshToken();

            if (refreshToken && !isRefreshing) {
                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshResponse = await axios.post(`${resolveBaseUrl()}auth/refresh`, {
                        refresh_token: refreshToken,
                    }, { timeout: 10000 });

                    const newAccessToken = refreshResponse.data?.access_token;
                    const newRefreshToken = refreshResponse.data?.refresh_token || refreshToken;
                    const user = refreshResponse.data?.user;

                    if (newAccessToken) {
                        setAuthToken(newAccessToken);
                        await saveSecureSession(newAccessToken, user, newRefreshToken);
                        processQueue(null, newAccessToken);
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return client(originalRequest);
                    }
                } catch (refreshErr) {
                    processQueue(refreshErr, null);
                } finally {
                    isRefreshing = false;
                }
            }

            // Refresh failed or no refresh token available: trigger centralized session expiration
            console.warn('Session unauthorized (401). Terminating session.');
            setAuthToken(null);
            if (sessionExpiredHandler) {
                sessionExpiredHandler();
            }
        }

        return Promise.reject(handleApiError(error));
    }
);

export default client;
