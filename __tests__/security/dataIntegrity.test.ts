import { createTask, updateTask } from '../../src/api/services/tasks';
import { createStudySession } from '../../src/api/services/sessions';
import client from '../../src/api/client';
import { AppError } from '../../src/api/error';

jest.mock('../../src/api/client', () => {
    const actual = jest.requireActual('../../src/api/client');
    return {
        __esModule: true,
        ...actual,
        default: {
            ...actual.default,
            post: jest.fn(),
            patch: jest.fn(),
            get: jest.fn(),
            delete: jest.fn(),
        },
    };
});

describe('Data Integrity & No-Fake-ID Verification', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('createTask must NOT create fake local IDs when server fails', async () => {
        (client.post as jest.Mock).mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 500,
                data: { message: 'Internal Server Error' },
            },
        });

        const payload = {
            title: 'Math Homework',
            courseName: 'Math',
        };

        await expect(createTask(payload)).rejects.toBeInstanceOf(AppError);
    });

    it('updateTask must NOT fake local success when server rejects update', async () => {
        (client.patch as jest.Mock).mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 403,
                data: { message: 'You do not have permission to modify this task.' },
            },
        });

        await expect(updateTask({ id: 'task-999', title: 'Hacked Title' })).rejects.toBeInstanceOf(AppError);
    });

    it('createStudySession must NOT fake local session when server fails', async () => {
        (client.post as jest.Mock).mockRejectedValueOnce({
            isAxiosError: true,
            response: {
                status: 400,
                data: { message: 'Invalid session timestamps' },
            },
        });

        const sessionPayload = {
            durationMinutes: 45,
            startedAt: new Date().toISOString(),
            endedAt: new Date().toISOString(),
        };

        await expect(createStudySession(sessionPayload)).rejects.toBeInstanceOf(AppError);
    });
});
