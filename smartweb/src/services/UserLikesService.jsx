import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    getFirestore
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

class UserLikesService {
    constructor() {
        this.userLikesCollection = 'user_likes';
        this.userLikesKontenCollection = 'user_likes_konten';
    }

    /**
     * Check if user has liked an educational content
     * @param {string} userId - User ID
     * @param {string} edukasiId - Educational content ID
     * @returns {Promise<boolean>} Like status
     */
    async isEdukasiLiked(userId, edukasiId) {
        try {
            const q = query(
                collection(db, this.userLikesCollection),
                where('userId', '==', userId),
                where('edukasiId', '==', edukasiId)
            );
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking edukasi like status:', error);
            return false;
        }
    }

    /**
     * Check if user has liked a promotional content
     * @param {string} userId - User ID
     * @param {string} kontenId - Promotional content ID
     * @returns {Promise<boolean>} Like status
     */
    async isKontenLiked(userId, kontenId) {
        try {
            const q = query(
                collection(db, this.userLikesKontenCollection),
                where('userId', '==', userId),
                where('kontenId', '==', kontenId)
            );
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking konten like status:', error);
            return false;
        }
    }

    /**
     * Get all educational content liked by user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of liked educational content IDs
     */
    async getUserLikedEdukasi(userId) {
        try {
            const q = query(
                collection(db, this.userLikesCollection),
                where('userId', '==', userId),
                orderBy('likedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const likedIds = [];

            querySnapshot.forEach((doc) => {
                likedIds.push(doc.data().edukasiId);
            });

            return likedIds;
        } catch (error) {
            console.error('Error getting user liked edukasi:', error);
            return [];
        }
    }

    /**
     * Get all promotional content liked by user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of liked promotional content IDs
     */
    async getUserLikedKonten(userId) {
        try {
            const q = query(
                collection(db, this.userLikesKontenCollection),
                where('userId', '==', userId),
                orderBy('likedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const likedIds = [];

            querySnapshot.forEach((doc) => {
                likedIds.push(doc.data().kontenId);
            });

            return likedIds;
        } catch (error) {
            console.error('Error getting user liked konten:', error);
            return [];
        }
    }

    /**
     * Get all liked content by user (both educational and promotional)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Object containing liked educational and promotional content
     */
    async getUserLikedContent(userId) {
        try {
            const [likedEdukasi, likedKonten] = await Promise.all([
                this.getUserLikedEdukasi(userId),
                this.getUserLikedKonten(userId)
            ]);

            return {
                edukasi: likedEdukasi,
                konten: likedKonten
            };
        } catch (error) {
            console.error('Error getting user liked content:', error);
            return { edukasi: [], konten: [] };
        }
    }
}

export default new UserLikesService();