import { validateImageAsset, MAX_FILE_SIZE_BYTES } from '../../src/utils/fileUpload';
import { Asset } from 'react-native-image-picker';

describe('Image Upload Validation', () => {
    it('should reject assets missing a file URI', () => {
        const invalidAsset: Asset = {};
        const result = validateImageAsset(invalidAsset);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Missing file URI');
    });

    it('should reject files exceeding the 5MB size limit', () => {
        const oversizedAsset: Asset = {
            uri: 'file:///data/user/0/app/cache/huge.jpg',
            fileSize: MAX_FILE_SIZE_BYTES + 1024,
            type: 'image/jpeg',
        };

        const result = validateImageAsset(oversizedAsset);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('5MB limit');
    });

    it('should reject non-whitelisted MIME types', () => {
        const pdfAsset: Asset = {
            uri: 'file:///data/document.pdf',
            fileSize: 1024 * 50,
            type: 'application/pdf',
        };

        const result = validateImageAsset(pdfAsset);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Unsupported image format');
    });

    it('should accept valid JPEG, PNG, and WebP images within limits', () => {
        const validJpeg: Asset = {
            uri: 'file:///data/photo.jpg',
            fileSize: 1024 * 1024 * 2, // 2MB
            type: 'image/jpeg',
        };
        expect(validateImageAsset(validJpeg).isValid).toBe(true);

        const validPng: Asset = {
            uri: 'file:///data/screenshot.png',
            fileSize: 1024 * 1024 * 3, // 3MB
            type: 'image/png',
        };
        expect(validateImageAsset(validPng).isValid).toBe(true);

        const validWebp: Asset = {
            uri: 'file:///data/compressed.webp',
            fileSize: 1024 * 500, // 500KB
            type: 'image/webp',
        };
        expect(validateImageAsset(validWebp).isValid).toBe(true);
    });
});
