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
    increment,
    getFirestore,
    writeBatch
} from 'firebase/firestore';

const db = getFirestore()

class KontenService {
    constructor() {
        this.edukasiCollection = 'edukasi';
        this.kontenCollection = 'konten';
        this.userLikesCollection = 'user_likes';
        this.userLikesKontenCollection = 'user_likes_konten';
        this.cloudinaryConfig = {
            cloudName: 'de2bfha4g',
            uploadPreset: 'your_upload_preset',
            apiKey: 'your_api_key',
            apiSecret: 'your_api_secret'
        };
    }

    // ============ USER LIKES FUNCTIONS ============

    /**
     * Cek apakah user sudah like konten edukasi
     * @param {string} userId - ID user
     * @param {string} edukasiId - ID konten edukasi
     * @returns {Promise<boolean>} Status like
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
     * Cek apakah user sudah like konten promosi
     * @param {string} userId - ID user
     * @param {string} kontenId - ID konten promosi
     * @returns {Promise<boolean>} Status like
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
     * Ambil semua like user untuk edukasi
     * @param {string} userId - ID user
     * @returns {Promise<Array>} Array ID edukasi yang di-like
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
     * Ambil semua like user untuk konten promosi
     * @param {string} userId - ID user
     * @returns {Promise<Array>} Array ID konten yang di-like
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
     * Ambil semua like user (edukasi + konten)
     * @param {string} userId - ID user
     * @returns {Promise<Object>} Object berisi liked edukasi dan konten
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

    // ============ CLOUDINARY FUNCTIONS ============

    async uploadToCloudinary(file, type = 'image', folder = 'konten') {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
            formData.append('folder', folder);

            if (type === 'video') {
                formData.append('resource_type', 'video');
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/${type}/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    }

    async deleteFromCloudinary(publicId, resourceType = 'image') {
        try {
            const timestamp = Math.round(new Date().getTime() / 1000);
            const signature = this.generateSignature(publicId, timestamp);

            const formData = new FormData();
            formData.append('public_id', publicId);
            formData.append('signature', signature);
            formData.append('api_key', this.cloudinaryConfig.apiKey);
            formData.append('timestamp', timestamp);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/${resourceType}/destroy`,
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
    }

    extractPublicId(url) {
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return filename.split('.')[0];
    }

    // ============ EDUKASI FUNCTIONS ============

    async createEdukasi(edukasiData, videoFile, thumbnailFile) {
        try {
            let videoUrl = '';
            let imageUrl = '';

            if (videoFile) {
                videoUrl = await this.uploadToCloudinary(
                    videoFile,
                    'video',
                    `edukasi/videos/${edukasiData.sellerId}`
                );
            }

            if (thumbnailFile) {
                imageUrl = await this.uploadToCloudinary(
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
                    const oldVideoPublicId = this.extractPublicId(existingData.videoUrl);
                    await this.deleteFromCloudinary(oldVideoPublicId, 'video');
                }

                videoUrl = await this.uploadToCloudinary(
                    videoFile,
                    'video',
                    `edukasi/videos/${existingData.sellerId}`
                );
            }

            if (thumbnailFile) {
                if (existingData.imageUrl) {
                    const oldImagePublicId = this.extractPublicId(existingData.imageUrl);
                    await this.deleteFromCloudinary(oldImagePublicId, 'image');
                }

                imageUrl = await this.uploadToCloudinary(
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

    async deleteEdukasi(id) {
        try {
            const docRef = doc(db, this.edukasiCollection, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('Konten edukasi tidak ditemukan');
            }

            const data = docSnap.data();
            const batch = writeBatch(db);

            // Hapus file dari Cloudinary
            if (data.videoUrl) {
                const videoPublicId = this.extractPublicId(data.videoUrl);
                await this.deleteFromCloudinary(videoPublicId, 'video');
            }

            if (data.imageUrl) {
                const imagePublicId = this.extractPublicId(data.imageUrl);
                await this.deleteFromCloudinary(imagePublicId, 'image');
            }

            // Hapus semua likes untuk edukasi ini
            const likesQuery = query(
                collection(db, this.userLikesCollection),
                where('edukasiId', '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);

            likesSnapshot.forEach((likeDoc) => {
                batch.delete(likeDoc.ref);
            });

            // Hapus dokumen edukasi
            batch.delete(docRef);

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error deleting edukasi:', error);
            throw error;
        }
    }

    // ============ KONTEN (PROMOSI) FUNCTIONS ============

    async createKonten(kontenData, imageFile) {
        try {
            let imageUrl = '';

            if (imageFile) {
                imageUrl = await this.uploadToCloudinary(
                    imageFile,
                    'image',
                    `konten/images/${kontenData.sellerId}`
                );
            }

            const newKonten = {
                ...kontenData,
                imageUrl,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                likes: 0,
                views: 0,
                status: 'Published'
            };

            const docRef = await addDoc(collection(db, this.kontenCollection), newKonten);

            return {
                id: docRef.id,
                ...newKonten,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating konten:', error);
            throw error;
        }
    }

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
                    const oldImagePublicId = this.extractPublicId(existingData.imageUrl);
                    await this.deleteFromCloudinary(oldImagePublicId, 'image');
                }

                imageUrl = await this.uploadToCloudinary(
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

    async deleteKonten(id) {
        try {
            const docRef = doc(db, this.kontenCollection, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                throw new Error('Konten promosi tidak ditemukan');
            }

            const data = docSnap.data();
            const batch = writeBatch(db);

            // Hapus file dari Cloudinary
            if (data.imageUrl) {
                const imagePublicId = this.extractPublicId(data.imageUrl);
                await this.deleteFromCloudinary(imagePublicId, 'image');
            }

            // Hapus semua likes untuk konten ini
            const likesQuery = query(
                collection(db, this.userLikesKontenCollection),
                where('kontenId', '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);

            likesSnapshot.forEach((likeDoc) => {
                batch.delete(likeDoc.ref);
            });

            // Hapus dokumen konten
            batch.delete(docRef);

            await batch.commit();
            return true;
        } catch (error) {
            console.error('Error deleting konten:', error);
            throw error;
        }
    }

    // ============ UTILITY FUNCTIONS ============

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
     * Toggle like untuk konten dengan tracking user
     * @param {string} id - ID konten
     * @param {string} type - Tipe konten ('edukasi' atau 'konten')
     * @param {string} userId - ID user yang melakukan like
     * @returns {Promise<Object>} Status dan informasi like
     */
    async toggleLike(id, type = 'edukasi', userId) {
        try {
            const batch = writeBatch(db);
            const collectionName = type === 'edukasi' ? this.edukasiCollection : this.kontenCollection;
            const likesCollectionName = type === 'edukasi' ? this.userLikesCollection : this.userLikesKontenCollection;
            const contentIdField = type === 'edukasi' ? 'edukasiId' : 'kontenId';

            // Cek apakah user sudah like
            const likesQuery = query(
                collection(db, likesCollectionName),
                where('userId', '==', userId),
                where(contentIdField, '==', id)
            );
            const likesSnapshot = await getDocs(likesQuery);
            const isCurrentlyLiked = !likesSnapshot.empty;

            // Reference ke dokumen konten
            const contentRef = doc(db, collectionName, id);

            if (isCurrentlyLiked) {
                // Hapus like
                likesSnapshot.forEach((likeDoc) => {
                    batch.delete(likeDoc.ref);
                });

                // Kurangi counter likes
                batch.update(contentRef, {
                    likes: increment(-1)
                });
            } else {
                // Tambah like
                const newLikeRef = doc(collection(db, likesCollectionName));
                batch.set(newLikeRef, {
                    userId,
                    [contentIdField]: id,
                    likedAt: serverTimestamp()
                });

                // Tambah counter likes
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
}

export default new KontenService();