import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { imageUploadService } from './CloudinaryService.jsx';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from 'firebase/firestore';
import { firebaseApp } from '../config/firebase';

const db = getFirestore(firebaseApp);
const normalizePhoneNumber = (input) => {
    let phone = input.replace(/[^\d+]/g, '');

    if (!phone.startsWith('+')) {
        if (phone.startsWith('0')) {
            phone = '+62' + phone.substring(1);
        } else if (phone.startsWith('62')) {
            phone = '+' + phone;
        } else {
            phone = '+62' + phone;
        }
    }

    return phone;
};

export const authService = {
    login: async (emailOrPhone, password) => {
        try {
            let emailToLogin = emailOrPhone.trim();

            // Jika input bukan email, cari berdasarkan nomor telepon
            if (!emailOrPhone.includes('@')) {
                let cleanPhone = emailOrPhone.replace(/[^\d+]/g, '');
                const normalizedPhone = normalizePhoneNumber(cleanPhone);

                // Cari user berdasarkan nomor telepon
                const q = query(
                    collection(db, 'users'),
                    where('phoneNumber', '==', normalizedPhone)
                );
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    throw new Error('Nomor telepon tidak ditemukan');
                }

                const userData = snapshot.docs[0].data();
                emailToLogin = userData.email;
            }

            // Login dengan email
            const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
            const user = userCredential.user;

            // Update lastLoginAt (optional, tidak perlu await)
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    lastLoginAt: new Date().toISOString()
                });

            } catch (e) {
                console.warn('[WARNING] Gagal update lastLoginAt:', e.message);
            }

            // Ambil data user dari Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;

            if (!userData) {
                throw new Error('Data pengguna tidak ditemukan');
            }
            return { user, userData };
        } catch (error) {
            console.error('[ERROR] Login gagal:', error);
            // lempar kembali error as-is jika sudah Error
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(String(error) || 'Login gagal');
            }
        }
    },

    register: async (email, password, userData = {}) => {
        try {
            // Validasi email sudah ada atau belum
            const emailQuery = query(
                collection(db, 'users'),
                where('email', '==', email)
            );
            const emailSnapshot = await getDocs(emailQuery);
            if (!emailSnapshot.empty) {
                throw new Error('Email sudah terdaftar');
            }

            // Validasi nomor telepon sudah ada atau belum
            if (userData.phoneNumber) {
                const normalizedPhone = normalizePhoneNumber(userData.phoneNumber);
                const phoneQuery = query(
                    collection(db, 'users'),
                    where('phoneNumber', '==', normalizedPhone)
                );
                const phoneSnapshot = await getDocs(phoneQuery);
                if (!phoneSnapshot.empty) {
                    throw new Error('Nomor telepon sudah terdaftar');
                }
            }

            // Buat user di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Siapkan data user untuk disimpan di Firestore
            const userDataToSave = {
                uid: user.uid,
                email: email,
                name: userData.name || '',
                phoneNumber: userData.phoneNumber || '',
                dateOfBirth: userData.dateOfBirth || null,
                gender: userData.gender || null,
                address: userData.address || null,
                city: userData.city || null,
                province: userData.province || null,
                postalCode: userData.postalCode || null,
                favoriteCategories: userData.favoriteCategories || [],
                emailVerified: false,
                phoneVerified: false,
                seller: userData.seller || false,
                profileImageUrl: null,
                tokenFCM: null,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                namaToko: userData.namaToko || null
            };

            // Simpan data user ke Firestore
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userDataToSave);

            console.log('[SUCCESS] User berhasil didaftarkan:', user.uid);
            return user;
        } catch (error) {
            console.error('[ERROR] Registrasi gagal:', error);
            throw new Error(error.message || 'Registrasi gagal');
        }
    },

    registerSeller: async (formData) => {
        try {
            // 1. Register ke Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            const uid = user.uid;
            const timestamp = Date.now();

            await updateProfile(user, { displayName: formData.store_name });

            // 2. Upload logo dan banner (jika ada)
            let logoUrl = '';
            let bannerUrl = '';

            if (formData.logo && formData.logo instanceof File) {
                logoUrl = await imageUploadService.uploadToCloudinary(formData.logo, 'image', 'sellers/logo');
            }

            if (formData.banner && formData.banner instanceof File) {
                bannerUrl = await imageUploadService.uploadToCloudinary(formData.banner, 'image', 'sellers/banner');
            }

            // 3. Simpan ke 'users'
            const userData = {
                uid,
                name: formData.store_name,
                email: formData.email,
                phoneNumber: formData.phone_number ? normalizePhoneNumber(formData.phone_number) : '',
                seller: true,
                address: formData.address || null,
                city: formData.city || null,
                province: formData.province || null,
                postalCode: formData.postal_code || null,
                namaToko: formData.store_name,
                profileImageUrl: logoUrl || null,
                emailVerified: false,
                phoneVerified: false,
                dateOfBirth: null,
                gender: null,
                favoriteCategories: [],
                tokenFCM: null,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
            };

            await setDoc(doc(db, 'users', uid), userData);

            // 4. Simpan ke 'sellers' - PERBAIKAN: Hilangkan spread operator yang salah
            const sellerData = {
                id: uid,
                nameToko: formData.store_name,
                description: formData.description,
                location: `${formData.address}, ${formData.city}, ${formData.province} ${formData.postal_code}`,
                category: formData.category || 'Lainnya',
                isVerified: true,
                joinedDate: timestamp,
                profileImage: logoUrl,
                bannerImage: bannerUrl,
                rating: 0,
                tags: ['Halal', 'Vegetarian', 'Spicy', 'Sweet', 'Traditional'],
                totalProducts: 0,
                tokenFCM: null,
            };

            // PERBAIKAN: Gunakan setDoc dengan benar
            await setDoc(doc(db, 'sellers', uid), sellerData);

            // Tunggu sebentar untuk memastikan data tersimpan
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('[SUCCESS] Seller berhasil didaftarkan:', uid);
            return { uid, email: formData.email };
        } catch (error) {
            console.error('[ERROR] Register Seller:', error);
            throw new Error(error.message || 'Gagal mendaftarkan seller');
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout gagal:', error);
            throw error;
        }
    },

    getCurrentUser: () => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    },

    getUserData: async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                throw new Error('Data user tidak ditemukan');
            }
        } catch (error) {
            console.error('[ERROR] Gagal mengambil data user:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(error.message || 'Gagal mengambil data user');
        }
    },

    updateUserData: async (uid, updateData) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, updateData, { merge: true });
            console.log('[SUCCESS] Data user berhasil diupdate');
            return true;
        } catch (error) {
            console.error('[ERROR] Gagal mengupdate data user:', error);
            throw new Error(error.message || 'Gagal mengupdate data user');
        }
    },

    verifyEmail: async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                emailVerified: true
            }, { merge: true });
            console.log('[SUCCESS] Email berhasil diverifikasi');
            return true;
        } catch (error) {
            console.error('[ERROR] Gagal memverifikasi email:', error);
            throw new Error(error.message || 'Gagal memverifikasi email');
        }
    },

    verifyPhone: async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                phoneVerified: true
            }, { merge: true });
            console.log('[SUCCESS] Nomor telepon berhasil diverifikasi');
            return true;
        } catch (error) {
            console.error('[ERROR] Gagal memverifikasi nomor telepon:', error);
            throw new Error(error.message || 'Gagal memverifikasi nomor telepon');
        }
    }
};

export default authService;