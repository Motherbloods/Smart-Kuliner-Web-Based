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
    writeBatch,
    setDoc
} from 'firebase/firestore';
import { imageUploadService } from './CloudinaryService.jsx';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

class KontenService {
    constructor() {
        this.kontenCollection = 'konten';
        this.userLikesKontenCollection = 'user_likes_konten';
        this.cloudinaryService = imageUploadService;
    }

    /**
     * Create new promotional content
     * @param {Object} kontenData - Promotional content data
     * @param {File} imageFile - Image file
     * @returns {Promise<Object>} Created promotional content
     */
    async createKonten(kontenData, imageFile) {
        try {
            let imageUrl = '';

            if (imageFile) {
                imageUrl = await this.cloudinaryService.uploadToCloudinary(
                    imageFile,
                    'image',
                    `konten/images/${kontenData.sellerId}`
                );
            }

            const now = new Date().toISOString();

            const newKonten = {
                ...kontenData,
                imageUrl,
                createdAt: now,
                updatedAt: now,
                likes: 0,
                views: 0,
                status: kontenData.status || 'Published'
            };

            const docRef = await addDoc(collection(db, this.kontenCollection), newKonten);
            await setDoc(docRef, { id: docRef.id }, { merge: true });

            return {
                id: docRef.id,
                ...newKonten
            };
        } catch (error) {
            console.error('Error creating konten:', error);
            throw error;
        }
    }


    /**
     * Get all promotional content with optional filters
     * @param {Object} filters - Filtering options
     * @returns {Promise<Array>} Array of promotional content
     */
    async getAllKonten(filters = {}) {
        try {
            let q = collection(db, this.kontenCollection);

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
            const kontenList = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                kontenList.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            });

            return kontenList;
        } catch (error) {
            console.error('Error getting konten:', error);
            throw error;
        }
    }

    /**
     * Get promotional content by ID
     * @param {string} id - Promotional content ID
     * @returns {Promise<Object>} Promotional content
     */

    /**
 * Get all konten (promotional content) by seller ID
 * @param {string} sellerId - The seller's UID
 * @returns {Promise<Array>} List of konten
 */
    async getKontenBySellerId(sellerId) {
        try {
            const kontenRef = collection(db, this.kontenCollection);
            const q = query(
                kontenRef,
                where('sellerId', '==', sellerId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const results = [];

            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                results.push({
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            });

            return results;
        } catch (error) {
            console.error('Error getting konten by sellerId:', error);
            throw error;
        }
    }

    async getKontenById(id) {
        try {
            const docRef = doc(db, this.kontenCollection, id);
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
                throw new Error('Konten promosi tidak ditemukan');
            }
        } catch (error) {
            console.error('Error getting konten by ID:', error);
            throw error;
        }
    }

    /**
     * Update promotional content
     * @param {string} id - Promotional content ID
     * @param {Object} updateData - Updated data
     * @param {File} imageFile - New image file (optional)
     * @returns {Promise<Object>} Updated promotional content
     */
    async updateKonten(id, updateData, imageFile = null) {
        try {
            const docRef = doc(db, this.kontenCollection, id);
            const existingDoc = await getDoc(docRef);

            if (!existingDoc.exists()) {
                throw new Error('Konten promosi tidak ditemukan');
            }

            const existingData = existingDoc.data();
            let imageUrl = existingData.imageUrl;

            if (imageFile) {
                if (existingData.imageUrl) {
                    const oldImagePublicId = this.cloudinaryService.extractPublicId(existingData.imageUrl);
                    await this.cloudinaryService.deleteFromCloudinary(oldImagePublicId, 'image');
                }

                imageUrl = await this.cloudinaryService.uploadToCloudinary(
                    imageFile,
                    'image',
                    `konten/images/${existingData.sellerId}`
                );
            }

            const updatedData = {
                ...updateData,
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
            console.error('Error updating konten:', error);
            throw error;
        }
    }

    /**
     * Delete promotional content
     * @param {string} id - Promotional content ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteKonten(id) {
        try {
            const docRef = doc(db, this.kontenCollection, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('Konten promosi tidak ditemukan');
            }

            const data = docSnap.data();
            const batch = writeBatch(db);

            // Delete files from Cloudinary
            if (data.imageUrl) {
                const imagePublicId = this.cloudinaryService.extractPublicId(data.imageUrl);
                await this.cloudinaryService.deleteFromCloudinary(imagePublicId, 'image');
            }

            // Delete all likes for this promotional content
            const likesQuery = query(
                collection(db, this.userLikesKontenCollection),
                where('kontenId', '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);

            likesSnapshot.forEach((likeDoc) => {
                batch.delete(likeDoc.ref);
            });

            // Delete promotional content document
            batch.delete(docRef);

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error deleting konten:', error);
            throw error;
        }
    }
}

export default new KontenService();