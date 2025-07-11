import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firebaseApp } from '../config/firebase'; // Pastikan kamu sudah export firebaseApp
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
    }
};

export default productService;
