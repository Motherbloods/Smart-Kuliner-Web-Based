import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';

const db = getFirestore();

export const authService = {
    login: async (emailOrPhone, password) => {
        try {
            let emailToLogin = emailOrPhone.trim();

            // Jika input adalah nomor (bukan email), cari email-nya di Firestore
            if (!emailOrPhone.includes('@')) {
                console.log('[DEBUG] Mendeteksi input sebagai phone number:', emailOrPhone);

                // Normalisasi nomor (contoh: +62 format)
                let cleanPhone = emailOrPhone.replace(/[^\d+]/g, '');
                if (!cleanPhone.startsWith('+')) {
                    if (cleanPhone.startsWith('0')) {
                        cleanPhone = '+62' + cleanPhone.substring(1);
                    } else if (cleanPhone.startsWith('62')) {
                        cleanPhone = '+' + cleanPhone;
                    } else {
                        cleanPhone = '+62' + cleanPhone;
                    }
                }

                const q = query(
                    collection(db, 'users'),
                    where('phoneNumber', '==', cleanPhone)
                );

                console.log(q)
                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    throw new Error('Nomor telepon tidak ditemukan');
                }

                const userData = snapshot.docs[0].data();
                emailToLogin = userData.email;
            }

            // Login pakai Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
            const user = userCredential.user;

            // Update lastLoginAt
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);
            const userDataSave = userSnapshot.data();
            await setDoc(userRef, {
                lastLoginAt: new Date().toISOString()
            }, { merge: true });

            const idToken = await user.getIdToken();
            localStorage.setItem('firebase_id_token', idToken);
            const userInfo = {
                uid: user.uid,
                ...(userDataSave.namaToko ? { nameToko: userDataSave.namaToko } : { name: userDataSave.name }),
            };
            localStorage.setItem('user_info', JSON.stringify(userInfo));


            return { user, idToken };
        } catch (error) {
            console.error('[ERROR] Login gagal:', error);
            throw new Error(error.message || 'Login gagal');
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
                const phoneQuery = query(
                    collection(db, 'users'),
                    where('phoneNumber', '==', userData.phoneNumber)
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
                dateOfBirth: userData.dateOfBirth || '',
                gender: userData.gender || '',
                address: userData.address || '',
                city: userData.city || '',
                province: userData.province || '',
                postalCode: userData.postalCode || '',
                favoriteCategories: userData.favoriteCategories || [],
                emailVerified: false,
                phoneVerified: false,
                seller: false,
                profileImageUrl: null,
                tokenFCM: null,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
                namaToko: null // untuk seller
            };

            // Simpan data user ke Firestore
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, userDataToSave);
            const idToken = await user.getIdToken();

            // Simpan token ke localStorage
            localStorage.setItem('firebase_id_token', idToken);
            console.log('[SUCCESS] User berhasil didaftarkan:', user.uid);
            return user;
        } catch (error) {
            console.error('[ERROR] Registrasi gagal:', error);
            throw new Error(error.message || 'Registrasi gagal');
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('firebase_id_token');
        } catch (error) {
            console.error('Logout gagal:', error);
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

    // Fungsi untuk mendapatkan data user dari Firestore
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
            throw new Error(error.message || 'Gagal mengambil data user');
        }
    },

    // Fungsi untuk update data user
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

    // Fungsi untuk verifikasi email
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

    // Fungsi untuk verifikasi nomor telepon
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