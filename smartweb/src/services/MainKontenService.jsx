import EdukasiService from './EdukasiService.jsx';
import KontenService from './ContentService.jsx';
import UserLikesService from './UserLikesService.jsx';
import EngagementService from './EngagementService.jsx';
import { imageUploadService } from './CloudinaryService.jsx';

/**
 * Main service that orchestrates all content-related operations
 * This service acts as a facade for all content management functionality
 */
class MainKontenService {
    constructor() {
        this.edukasiService = EdukasiService;
        this.kontenService = KontenService;
        this.userLikesService = UserLikesService;
        this.engagementService = EngagementService;
        this.cloudinaryService = imageUploadService;
    }

    // ============ EDUKASI METHODS ============

    /**
     * Create new educational content
     */
    async createEdukasi(edukasiData, videoFile, thumbnailFile) {
        return await this.edukasiService.createEdukasi(edukasiData, videoFile, thumbnailFile);
    }

    /**
     * Get all educational content
     */
    async getAllEdukasi(filters = {}) {
        return await this.edukasiService.getAllEdukasi(filters);
    }
    async getEdukasiBySellerId(sellerId) {
        return await this.edukasiService.getEdukasiBySellerId(sellerId);
    }

    /**
     * Get educational content by ID
     */
    async getEdukasiById(id) {
        return await this.edukasiService.getEdukasiById(id);
    }

    /**
     * Update educational content
     */
    async updateEdukasi(id, updateData, videoFile = null, thumbnailFile = null) {
        return await this.edukasiService.updateEdukasi(id, updateData, videoFile, thumbnailFile);
    }

    /**
     * Delete educational content
     */
    async deleteEdukasi(id) {
        return await this.edukasiService.deleteEdukasi(id);
    }

    // ============ KONTEN (PROMOTIONAL) METHODS ============

    /**
     * Create new promotional content
     */
    async createKonten(kontenData, imageFile) {
        return await this.kontenService.createKonten(kontenData, imageFile);
    }

    /**
     * Get all promotional content
     */
    async getAllKonten(filters = {}) {
        return await this.kontenService.getAllKonten(filters);
    }

    async getKontenBySellerId(sellerId) {
        return await this.kontenService.getKontenBySellerId(sellerId);
    }

    /**
     * Get promotional content by ID
     */
    async getKontenById(id) {
        return await this.kontenService.getKontenById(id);
    }

    /**
     * Update promotional content
     */
    async updateKonten(id, updateData, imageFile = null) {
        return await this.kontenService.updateKonten(id, updateData, imageFile);
    }

    /**
     * Delete promotional content
     */
    async deleteKonten(id) {
        return await this.kontenService.deleteKonten(id);
    }

    // ============ USER LIKES METHODS ============

    /**
     * Check if user has liked educational content
     */
    async isEdukasiLiked(userId, edukasiId) {
        return await this.userLikesService.isEdukasiLiked(userId, edukasiId);
    }

    /**
     * Check if user has liked promotional content
     */
    async isKontenLiked(userId, kontenId) {
        return await this.userLikesService.isKontenLiked(userId, kontenId);
    }

    /**
     * Get all educational content liked by user
     */
    async getUserLikedEdukasi(userId) {
        return await this.userLikesService.getUserLikedEdukasi(userId);
    }

    /**
     * Get all promotional content liked by user
     */
    async getUserLikedKonten(userId) {
        return await this.userLikesService.getUserLikedKonten(userId);
    }

    /**
     * Get all liked content by user
     */
    async getUserLikedContent(userId) {
        return await this.userLikesService.getUserLikedContent(userId);
    }

    // ============ ENGAGEMENT METHODS ============

    /**
     * Add view to content
     */
    async addView(id, type = 'edukasi') {
        return await this.engagementService.addView(id, type);
    }

    /**
     * Toggle like for content
     */
    async toggleLike(id, type = 'edukasi', userId) {
        return await this.engagementService.toggleLike(id, type, userId);
    }

    // ============ CLOUDINARY METHODS ============

    /**
     * Upload file to Cloudinary
     */
    async uploadToCloudinary(file, type = 'image', folder = 'konten') {
        return await this.cloudinaryService.uploadToCloudinary(file, type, folder);
    }

    /**
     * Delete file from Cloudinary
     */
    async deleteFromCloudinary(publicId, resourceType = 'image') {
        return await this.cloudinaryService.deleteFromCloudinary(publicId, resourceType);
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    extractPublicId(url) {
        return this.cloudinaryService.extractPublicId(url);
    }

    // ============ UTILITY METHODS ============

    /**
     * Get all content (both educational and promotional)
     */
    async getAllContent(filters = {}) {
        try {
            const [edukasiData, kontenData] = await Promise.all([
                this.getAllEdukasi(filters),
                this.getAllKonten(filters)
            ]);

            return {
                edukasi: edukasiData,
                konten: kontenData
            };
        } catch (error) {
            console.error('Error getting all content:', error);
            throw error;
        }
    }

    /**
     * Get content statistics
     */
    async getContentStats(sellerId = null) {
        try {
            const filters = sellerId ? { sellerId } : {};
            const [edukasiData, kontenData] = await Promise.all([
                this.getAllEdukasi(filters),
                this.getAllKonten(filters)
            ]);

            const edukasiStats = {
                total: edukasiData.length,
                totalLikes: edukasiData.reduce((sum, item) => sum + (item.likes || 0), 0),
                totalViews: edukasiData.reduce((sum, item) => sum + (item.views || 0), 0)
            };

            const kontenStats = {
                total: kontenData.length,
                totalLikes: kontenData.reduce((sum, item) => sum + (item.likes || 0), 0),
                totalViews: kontenData.reduce((sum, item) => sum + (item.views || 0), 0)
            };

            return {
                edukasi: edukasiStats,
                konten: kontenStats,
                overall: {
                    totalContent: edukasiStats.total + kontenStats.total,
                    totalLikes: edukasiStats.totalLikes + kontenStats.totalLikes,
                    totalViews: edukasiStats.totalViews + kontenStats.totalViews
                }
            };
        } catch (error) {
            console.error('Error getting content stats:', error);
            throw error;
        }
    }
}

export default new MainKontenService();