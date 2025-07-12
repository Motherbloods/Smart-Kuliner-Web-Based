import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    getFirestore,
    writeBatch
} from 'firebase/firestore';
import { imageUploadService } from './CloudinaryService.jsx';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

class EdukasiService {
    constructor() {
        this.edukasiCollection = 'edukasi';
        this.userLikesCollection = 'user_likes';
        this.imageUploadService = imageUploadService;
    }

    /**
     * Create new educational content
     * @param {Object} edukasiData - Educational content data
     * @param {File} videoFile - Video file
     * @param {File} thumbnailFile - Thumbnail file
     * @returns {Promise<Object>} Created educational content
     */
    async createEdukasi(edukasiData, videoFile, thumbnailFile) {
        try {
            let videoUrl = '';
            let imageUrl = '';

            if (videoFile) {
                videoUrl = await this.imageUploadService.uploadToCloudinary(
                    videoFile,
                    'video',
                    `edukasi/videos/${edukasiData.sellerId}`
                );
            }

            if (thumbnailFile) {
                imageUrl = await this.imageUploadService.uploadToCloudinary(
                    thumbnailFile,
                    'image',
                    `edukasi/thumbnails/${edukasiData.sellerId}`
                );
            }

            const newEdukasi = {
                ...edukasiData,
                videoUrl,
                imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                likes: 0,
                views: 0,
                status: 'Published'
            };

            const docRef = await addDoc(collection(db, this.edukasiCollection), newEdukasi);

            return {
                id: docRef.id,
                ...newEdukasi,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating edukasi:', error);
            throw error;
        }
    }

    /**
     * Get all educational content with optional filters
     * @param {Object} filters - Filtering options
     * @returns {Promise<Array>} Array of educational content
     */
    async getAllEdukasi(filters = {}) {
        try {
            let q = collection(db, this.edukasiCollection);

            if (filters.sellerId) {
                q = query(q, where('sellerId', '==', filters.sellerId));
            }

            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }

            if (filters.status) {
                q = query(q, where('status', '==', filters.status));
            }

            q = query(q, orderBy('createdAt', 'desc'));

            if (filters.limit) {
                q = query(q, limit(filters.limit));
            }

            const querySnapshot = await getDocs(q);
            const edukasiList = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                edukasiList.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            });

            return edukasiList;
        } catch (error) {
            console.error('Error getting edukasi:', error);
            throw error;
        }
    }

    /**
     * Get educational content by ID
     * @param {string} id - Educational content ID
     * @returns {Promise<Object>} Educational content
     */
    async getEdukasiById(id) {
        try {
            const docRef = doc(db, this.edukasiCollection, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                };
            } else {
                throw new Error('Konten edukasi tidak ditemukan');
            }
        } catch (error) {
            console.error('Error getting edukasi by ID:', error);
            throw error;
        }
    }

    /**
     * Update educational content
     * @param {string} id - Educational content ID
     * @param {Object} updateData - Updated data
     * @param {File} videoFile - New video file (optional)
     * @param {File} thumbnailFile - New thumbnail file (optional)
     * @returns {Promise<Object>} Updated educational content
     */
    async updateEdukasi(id, updateData, videoFile = null, thumbnailFile = null) {
        try {
            const docRef = doc(db, this.edukasiCollection, id);
            const existingDoc = await getDoc(docRef);

            if (!existingDoc.exists()) {
                throw new Error('Konten edukasi tidak ditemukan');
            }

            const existingData = existingDoc.data();
            let videoUrl = existingData.videoUrl;
            let imageUrl = existingData.imageUrl;

            if (videoFile) {
                if (existingData.videoUrl) {
                    const oldVideoPublicId = this.imageUploadService.extractPublicId(existingData.videoUrl);
                    await this.imageUploadService.deleteFromCloudinary(oldVideoPublicId, 'video');
                }

                videoUrl = await this.imageUploadService.uploadToCloudinary(
                    videoFile,
                    'video',
                    `edukasi/videos/${existingData.sellerId}`
                );
            }

            if (thumbnailFile) {
                if (existingData.imageUrl) {
                    const oldImagePublicId = this.imageUploadService.extractPublicId(existingData.imageUrl);
                    await this.imageUploadService.deleteFromCloudinary(oldImagePublicId, 'image');
                }

                imageUrl = await this.imageUploadService.uploadToCloudinary(
                    thumbnailFile,
                    'image',
                    `edukasi/thumbnails/${existingData.sellerId}`
                );
            }

            const updatedData = {
                ...updateData,
                videoUrl,
                imageUrl,
                updatedAt: serverTimestamp()
            };

            await updateDoc(docRef, updatedData);

            return {
                id,
                ...existingData,
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error updating edukasi:', error);
            throw error;
        }
    }

    /**
     * Delete educational content
     * @param {string} id - Educational content ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteEdukasi(id) {
        try {
            const docRef = doc(db, this.edukasiCollection, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('Konten edukasi tidak ditemukan');
            }

            const data = docSnap.data();
            const batch = writeBatch(db);

            // Delete files from Cloudinary
            if (data.videoUrl) {
                const videoPublicId = this.imageUploadService.extractPublicId(data.videoUrl);
                await this.imageUploadService.deleteFromCloudinary(videoPublicId, 'video');
            }

            if (data.imageUrl) {
                const imagePublicId = this.imageUploadService.extractPublicId(data.imageUrl);
                await this.imageUploadService.deleteFromCloudinary(imagePublicId, 'image');
            }

            // Delete all likes for this educational content
            const likesQuery = query(
                collection(db, this.userLikesCollection),
                where('edukasiId', '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);

            likesSnapshot.forEach((likeDoc) => {
                batch.delete(likeDoc.ref);
            });

            // Delete educational content document
            batch.delete(docRef);

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error deleting edukasi:', error);
            throw error;
        }
    }
}

export default new EdukasiService();