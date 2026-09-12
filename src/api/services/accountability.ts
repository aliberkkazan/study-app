import client from '../client';
import {
    AccessGrant,
    CreateInvitePayload,
    CreateInviteResponse,
    AcceptInvitePayload,
    CreateShareTokenPayload,
} from '../types';

/**
 * Creates an invite code (e.g. AG-XXXXXX) for partner, mentor, parent, or supporter.
 */
export const createInvite = async (payload: CreateInvitePayload): Promise<CreateInviteResponse> => {
    const response = await client.post<CreateInviteResponse>('/accountability/grants/invite', payload);
    return response.data;
};

/**
 * Accepts an access grant invite using the 9-character code.
 */
export const acceptInvite = async (payload: AcceptInvitePayload): Promise<AccessGrant> => {
    const response = await client.post<AccessGrant>('/accountability/grants/accept', payload);
    return response.data;
};

/**
 * Retrieves list of access grants given to others by the current user (sent invites & active partners).
 */
export const getGrantedAccessList = async (): Promise<AccessGrant[]> => {
    try {
        const response = await client.get<AccessGrant[]>('/accountability/grants/granted');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.warn('Failed to fetch granted access list from backend:', error);
        return [];
    }
};

/**
 * Retrieves list of students/partners who granted access to the current user.
 */
export const getReceivedAccessList = async (): Promise<AccessGrant[]> => {
    try {
        const response = await client.get<AccessGrant[]>('/accountability/grants/received');
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.warn('Failed to fetch received access list from backend:', error);
        return [];
    }
};

/**
 * Revokes an existing access grant.
 */
export const revokeGrant = async (grantId: string): Promise<AccessGrant> => {
    const response = await client.delete<AccessGrant>(`/accountability/grants/${grantId}/revoke`);
    return response.data;
};

/**
 * Creates a temporary share token for weekly/monthly study reports.
 */
export const createShareToken = async (payload: CreateShareTokenPayload): Promise<{ id: string; token: string; shareUrl?: string }> => {
    const response = await client.post<{ id: string; token: string; shareUrl?: string }>('/accountability/reports/share', payload);
    return response.data;
};
