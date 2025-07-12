import {
    collection,
    doc,
    query,
    where,
    getDocs,
    updateDoc,
    increment,
    serverTimestamp,
    getFirestore,
    writeBatch
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

class EngagementService {
    constructor() {
        this.edukasiCollection = 'edukasi';
        this.kontenCollection = 'konten';
        this.userLikesCollection = 'user_likes';
        this.userLikesKontenCollection = 'user_likes_konten';
    }

    /**
     * Add view to content
     * @param {string} id - Content ID
     * @param {string} type - Content type ('edukasi' or 'konten')
     * @returns {Promise<boolean>} Success status
     */
    async addView(id, type = 'edukasi') {
        try {
            const collectionName = type === 'edukasi' ? this.edukasiCollection : this.kontenCollection;
            const docRef = doc(db, collectionName, id);

            await updateDoc(docRef, {
                views: increment(1)
            });

            return true;
        } catch (error) {
            console.error('Error adding view:', error);
            return false;
        }
    }

    /**
     * Toggle like for content with user tracking
     * @param {string} id - Content ID
     * @param {string} type - Content type ('edukasi' or 'konten')
     * @param {string} userId - User ID who performs the like
     * @returns {Promise<Object>} Like status and information
     */
    async toggleLike(id, type = 'edukasi', userId) {
        try {
            const batch = writeBatch(db);
            const collectionName = type === 'edukasi' ? this.edukasiCollection : this.kontenCollection;
            const likesCollectionName = type === 'edukasi' ? this.userLikesCollection : this.userLikesKontenCollection;
            const contentIdField = type === 'edukasi' ? 'edukasiId' : 'kontenId';

            // Check if user has already liked the content
            const likesQuery = query(
                collection(db, likesCollectionName),
                where('userId', '==', userId),
                where(contentIdField, '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);
            const isCurrentlyLiked = !likesSnapshot.empty;

            // Reference to content document
            const contentRef = doc(db, collectionName, id);

            if (isCurrentlyLiked) {
                // Remove like
                likesSnapshot.forEach((likeDoc) => {
                    batch.delete(likeDoc.ref);
                });

                // Decrease like counter
                batch.update(contentRef, {
                    likes: increment(-1)
                });
            } else {
                // Add like
                const newLikeRef = doc(collection(db, likesCollectionName));
                batch.set(newLikeRef, {
                    userId,
                    [contentIdField]: id,
                    likedAt: serverTimestamp()
                });

                // Increase like counter
                batch.update(contentRef, {
                    likes: increment(1)
                });
            }

            await batch.commit();

            return {
                success: true,
                isLiked: !isCurrentlyLiked,
                action: isCurrentlyLiked ? 'removed' : 'added'
            };
        } catch (error) {
            console.error('Error toggling like:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default new EngagementService();