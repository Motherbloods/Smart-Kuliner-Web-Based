import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);

export const orderService = {
    // Ambil semua pesanan
    getAllOrders: async () => {
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[ERROR] Gagal mengambil semua order:', error);
            throw new Error('Gagal mengambil semua order');
        }
    },

    getOrders: async (sellerId = null, startDate = null, endDate = null) => {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);

            const allOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Filter berdasarkan sellerId dan tanggal
            const filteredOrders = allOrders.filter(order => {
                // Jika sellerId disediakan, pastikan ada salah satu item dengan sellerId tersebut
                if (sellerId && !order.items.some(item => item.sellerId === sellerId)) {
                    return false;
                }

                // Filter tanggal mulai
                if (startDate && new Date(order.createdAt) < new Date(startDate)) {
                    return false;
                }

                // Filter tanggal akhir
                if (endDate && new Date(order.createdAt) > new Date(endDate)) {
                    return false;
                }

                return true;
            });

            return filteredOrders;
        } catch (error) {
            console.error('[ERROR] Failed to fetch orders:', error);
            throw new Error('Failed to fetch orders');
        }
    },

    // Ambil pesanan berdasarkan customerId
    getOrdersByCustomer: async (customerId) => {
        try {
            const q = query(
                collection(db, 'orders'),
                where('customerId', '==', customerId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[ERROR] Gagal mengambil order customer:', error);
            throw new Error('Gagal mengambil order dari customer');
        }
    },

    // Ambil pesanan berdasarkan sellerId
    getOrdersBySeller: async (sellerId) => {
        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const filteredOrders = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(order =>
                    order.items.some(item => item.sellerId === sellerId)
                );

            return filteredOrders;
        } catch (error) {
            console.error('[ERROR] Gagal mengambil order seller:', error);
            throw new Error('Gagal mengambil order dari seller');
        }
    },
    // Tambah order baru
    createOrder: async (orderData) => {
        try {
            const newOrderRef = await addDoc(collection(db, 'orders'), {
                ...orderData,
                createdAt: new Date().toISOString(),
                status: 'menunggu_konfirmasi', // default status
            });
            return { id: newOrderRef.id };
        } catch (error) {
            console.error('[ERROR] Gagal membuat order:', error);
            throw new Error('Gagal membuat pesanan baru');
        }
    },

    // Update status order
    updateOrderStatus: async (orderId, status) => {
        console.log('ini status', status);
        try {
            const orderRef = doc(db, 'orders', orderId);

            const timestampFieldMap = {
                confirmed: 'confirmedAt',
                processing: 'processingAt',
                shipped: 'shippedAt',
                completed: 'completedAt',
                cancelled: 'cancelledAt',
                delivered: 'deliveredAt' // optional, if you have this step
            };

            const updateData = {
                status,
            };

            // Jika status punya field waktu yang cocok, tambahkan timestamp-nya
            const timestampField = timestampFieldMap[status];
            if (timestampField) {
                updateData[timestampField] = new Date().toISOString(); // simpan sebagai ISO string
            }

            await updateDoc(orderRef, updateData);
        } catch (error) {
            console.error('[ERROR] Gagal update status order:', error);
            throw new Error('Gagal memperbarui status pesanan');
        }
    },


    // Ambil detail order by ID
    getOrderById: async (orderId) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            const docSnap = await getDoc(orderRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Pesanan tidak ditemukan');
            }
        } catch (error) {
            console.error('[ERROR] Gagal mengambil detail order:', error);
            throw new Error('Gagal mengambil detail pesanan');
        }
    }
};

export default orderService;
