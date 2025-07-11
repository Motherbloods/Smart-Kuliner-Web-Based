import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    where,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

export const productService = {
    getAllProducts: async () => {
        try {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return products;
        } catch (error) {
            console.error('[ERROR] Gagal mengambil produk:', error);
            throw new Error('Gagal mengambil produk');
        }
    },

    getProductsBySeller: async (sellerId) => {
        try {
            const productsRef = collection(db, 'products');
            const q = query(
                productsRef,
                where('sellerId', '==', sellerId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return products;
        } catch (error) {
            console.error('[ERROR] Gagal mengambil produk seller:', error);
            throw new Error('Gagal mengambil produk dari seller');
        }
    },

    getProductById: async (productId) => {
        try {
            const productRef = doc(db, 'products', productId);
            const snapshot = await getDoc(productRef);

            if (!snapshot.exists()) {
                throw new Error('Produk tidak ditemukan');
            }

            return {
                id: snapshot.id,
                ...snapshot.data()
            };
        } catch (error) {
            console.error('[ERROR] Gagal mengambil detail produk:', error);
            throw new Error('Gagal mengambil detail produk');
        }
    },

    createProduct: async (productData) => {
        try {
            const productsRef = collection(db, 'products');
            const newProduct = {
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                rating: 0,
                sold: 0,
                isActive: true
            };

            const docRef = await addDoc(productsRef, newProduct);
            return {
                id: docRef.id,
                ...newProduct
            };
        } catch (error) {
            console.error('[ERROR] Gagal membuat produk:', error);
            throw new Error('Gagal membuat produk');
        }
    },

    updateProduct: async (productId, productData) => {
        try {
            const productRef = doc(db, 'products', productId);
            const updateData = {
                ...productData,
                updatedAt: new Date().toISOString()
            };

            await updateDoc(productRef, updateData);
            return {
                id: productId,
                ...updateData
            };
        } catch (error) {
            console.error('[ERROR] Gagal mengupdate produk:', error);
            throw new Error('Gagal mengupdate produk');
        }
    },

    deleteProduct: async (productId) => {
        try {
            const productRef = doc(db, 'products', productId);
            await deleteDoc(productRef);
            return { success: true };
        } catch (error) {
            console.error('[ERROR] Gagal menghapus produk:', error);
            throw new Error('Gagal menghapus produk');
        }
    },

    // Service untuk mendapatkan data seller
    getSellerData: async (sellerId) => {
        try {
            const sellerRef = doc(db, 'sellers', sellerId);
            const snapshot = await getDoc(sellerRef);

            if (!snapshot.exists()) {
                throw new Error('Data seller tidak ditemukan');
            }

            return {
                id: snapshot.id,
                ...snapshot.data()
            };
        } catch (error) {
            console.error('[ERROR] Gagal mengambil data seller:', error);
            throw new Error('Gagal mengambil data seller');
        }
    }
};

export default productService;