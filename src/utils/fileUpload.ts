import { Asset, ImageLibraryOptions } from 'react-native-image-picker';
import client from '../api/client';
import { handleApiError } from '../api/error';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates image asset before processing or uploading
 */
export const validateImageAsset = (asset: Asset): ValidationResult => {
    if (!asset.uri) {
        return { isValid: false, error: 'Invalid image: Missing file URI' };
    }

    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (asset.fileSize / (1024 * 1024)).toFixed(1);
        return {
            isValid: false,
            error: `File size exceeds the 5MB limit (${sizeMb}MB). Please select a smaller photo.`,
        };
    }

    if (asset.type && !ALLOWED_MIME_TYPES.includes(asset.type.toLowerCase())) {
        return {
            isValid: false,
            error: `Unsupported image format (${asset.type}). Please select a JPEG, PNG, or WebP image.`,
        };
    }

    return { isValid: true };
};

/**
 * Standard secure image picker options: limits resolution and file quality
 */
export const SECURE_IMAGE_PICKER_OPTIONS: ImageLibraryOptions = {
    mediaType: 'photo',
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    includeBase64: false, // Prefer multipart upload over memory-heavy base64
};

/**
 * Uploads a local image asset using multipart/form-data to /files/upload
 */
export const uploadImageMultipart = async (asset: Asset): Promise<string> => {
    const validation = validateImageAsset(asset);
    if (!validation.isValid) {
        throw new Error(validation.error || 'Image validation failed');
    }

    if (!asset.uri) {
        throw new Error('Image asset is missing URI');
    }

    const formData = new FormData();
    const fileName = asset.fileName || `upload-${Date.now()}.${asset.type ? asset.type.split('/')[1] : 'jpg'}`;
    const fileType = asset.type || 'image/jpeg';

    formData.append('file', {
        uri: asset.uri,
        name: fileName,
        type: fileType,
    } as any);

    try {
        const response = await client.post('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000,
        });

        const url = response.data?.url || response.data?.fileUrl || response.data?.path;
        if (!url) {
            throw new Error('Server upload succeeded but did not return a file URL');
        }
        return url;
    } catch (error) {
        throw handleApiError(error);
    }
};
