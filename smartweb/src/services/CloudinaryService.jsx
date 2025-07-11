// ImageUploadService.js
const CLOUDINARY_UPLOAD_PRESET = 'flutter_products'; // Ganti dengan milikmu
const CLOUDINARY_CLOUD_NAME = 'de2bfha4g';       // Ganti dengan milikmu

export const imageUploadService = {
    // Upload single image
    uploadSingleImage: async (file, folder = 'products') => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
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
    }
};
