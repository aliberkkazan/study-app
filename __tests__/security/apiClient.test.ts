import { resolveBaseUrl, PRODUCTION_API_URL } from '../../src/api/client';
import { handleApiError, AppError } from '../../src/api/error';

describe('API Client & Error Security', () => {
    describe('resolveBaseUrl', () => {
        const originalDev = (global as any).__DEV__;

        afterEach(() => {
            (global as any).__DEV__ = originalDev;
        });

        it('should allow local URLs in development mode', () => {
            (global as any).__DEV__ = true;
            const url = resolveBaseUrl('http://localhost:3001');
            expect(url).toBe('http://localhost:3001/');
        });

        it('should reject localhost and enforce HTTPS in release/production mode', () => {
            (global as any).__DEV__ = false;
            const insecureLocal = resolveBaseUrl('http://localhost:3001');
            expect(insecureLocal).toBe(`${PRODUCTION_API_URL}/`);

            const insecureHttp = resolveBaseUrl('http://my-backend.com');
            expect(insecureHttp).toBe(`${PRODUCTION_API_URL}/`);
        });

        it('should preserve valid HTTPS URLs in release/production mode', () => {
            (global as any).__DEV__ = false;
            const validHttps = resolveBaseUrl('https://api.studyapp.com');
            expect(validHttps).toBe('https://api.studyapp.com/');
        });
    });

    describe('handleApiError normalization', () => {
        it('should handle 403 Forbidden with clear permission message', () => {
            const mock403 = {
                isAxiosError: true,
                response: {
                    status: 403,
                    data: { message: 'Forbidden resource' },
                },
                config: { url: '/tasks/other-user-task' },
            };

            const appError = handleApiError(mock403);
            expect(appError).toBeInstanceOf(AppError);
            expect(appError.status).toBe(403);
            expect(appError.message).toBe('Forbidden resource');
        });

        it('should sanitize 500 server errors and not leak internal details', () => {
            const mock500 = {
                isAxiosError: true,
                response: {
                    status: 500,
                    data: {
                        message: 'Database query failed at line 140 select * from users where password_hash...',
                    },
                },
                config: { url: '/users' },
            };

            const appError = handleApiError(mock500);
            expect(appError.status).toBe(500);
            expect(appError.message).toBe('Server error. Please try again later.');
        });

        it('should format array of validation error messages cleanly', () => {
            const mock400 = {
                isAxiosError: true,
                response: {
                    status: 400,
                    data: {
                        message: ['email must be an email', 'password is too weak'],
                    },
                },
                config: { url: '/auth/register' },
            };

            const appError = handleApiError(mock400);
            expect(appError.message).toBe('email must be an email, password is too weak');
        });

        it('should recognize 401 session expiration on protected routes', () => {
            const mock401 = {
                isAxiosError: true,
                response: {
                    status: 401,
                    data: {},
                },
                config: { url: '/study-sessions' },
            };

            const appError = handleApiError(mock401);
            expect(appError.status).toBe(401);
            expect(appError.message).toBe('Session expired. Please login again.');
        });
    });
});
