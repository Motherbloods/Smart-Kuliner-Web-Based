import { cloudinaryConfig } from '../config/cloudinary';
import CryptoJS from 'crypto-js';

export const imageUploadService = {
    // Upload single image
    uploadSingleImage: async (file, folder = 'products') => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', cloudinaryConfig.uploadPreset);
            formData.append('folder', folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) throw new Error('Image upload failed');

            const data = await response.json();
            return {
                url: data.secure_url,
                publicId: data.public_id
            };
        } catch (error) {
            console.error('Single image upload error:', error);
            throw error;
        }
    },

    async uploadToCloudinary(file, type = 'image', folder = 'konten') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', cloudinaryConfig.uploadPreset);
            formData.append('folder', folder);

            if (type === 'video') {
                formData.append('resource_type', 'video');
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${type}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.secure_url; // hanya kembalikan URL
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    },
    // Upload multiple images
    uploadMultipleImages: async (files, folder = 'products') => {
        try {
            const uploadPromises = files.map(file =>
                imageUploadService.uploadSingleImage(file, folder)
            );
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Multiple image upload error:', error);
            throw error;
        }
    },

    async deleteFromCloudinary(publicId, resourceType = 'image') {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const signature = this.generateSignature(publicId, cloudinaryConfig.apiSecret);

            const formData = new FormData();
            formData.append('public_id', publicId);
            formData.append('signature', signature);
            formData.append('api_key', cloudinaryConfig.apiKey);
            formData.append('timestamp', timestamp);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/destroy`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();
            return data.result === 'ok';
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
            return false;
        }
    },

    /**
     * Extract public ID from Cloudinary URL
     * @param {string} url - Cloudinary URL
     * @returns {string} Public ID
     */
    extractPublicId(url) {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    },

    /**
     * Generate signature for authenticated requests
     * @param {string} publicId - Public ID
     * @param {number} timestamp - Timestamp
     * @returns {string} Generated signature
     */
    generateSignature(params, apiSecret) {
        // Sort parameters by key
        const sortedKeys = Object.keys(params)
            .filter(key => key !== 'signature' && key !== 'api_key')
            .sort();

        // Create parameter string
        const paramString = sortedKeys
            .map(key => `${key}=${params[key]}`)
            .join('&') + apiSecret;

        console.log('🔐 Signature string:', paramString); // Debug log

        // Generate SHA1 hash using CryptoJS
        const hash = CryptoJS.SHA1(paramString);
        return hash.toString(CryptoJS.enc.Hex);
    }
};
