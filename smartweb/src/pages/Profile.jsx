import React, { useState, useEffect, useContext } from 'react';
import {
    User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Star, Package, Shield, Clock, Home, Building, AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import {
    getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs
} from 'firebase/firestore';

const db = getFirestore()

const Profile = () => {
    const { userData, updateUserData } = useContext(AuthContext);
    console.log(userData)
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sellerData, setSellerData] = useState(null);
    const [loadingSellerData, setLoadingSellerData] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);

    // Fetch seller data when component mounts and when userData changes
    useEffect(() => {
        const fetchInitialData = async () => {
            if (userData?.seller && userData.uid) {
                // Fetch seller data first
                await fetchSellerData(userData.uid);

                // Then fetch seller stats (total products)
                const total = await calculateTotalProducts(userData.uid);
                setTotalProducts(total);
            }
        };

        fetchInitialData();
    }, [userData]); // Dependency on userData to refetch when user data changes

    // Initialize form data when userData and sellerData change
    useEffect(() => {
        if (userData) {
            const formData = { ...userData };
            if (sellerData) {
                formData.sellerInfo = { ...sellerData };
            }
            setEditForm(formData);
        }
    }, [userData, sellerData]);

    const fetchSellerData = async (userId) => {
        setLoadingSellerData(true);
        try {
            const sellerRef = doc(db, 'sellers', userId);
            const sellerSnap = await getDoc(sellerRef);
            console.log('Seller data:', sellerSnap.data());

            if (sellerSnap.exists()) {
                const sellerDataFromFirestore = sellerSnap.data();
                setSellerData(sellerDataFromFirestore);

                const lastUpdate = sellerDataFromFirestore.updatedAt?.toDate();
                const now = new Date();
                const hoursSinceUpdate = lastUpdate ? (now - lastUpdate) / (1000 * 60 * 60) : 24;

                if (hoursSinceUpdate > 1) { // Update jika lebih dari 1 jam
                    console.log('Updating seller stats...');
                    await updateSellerStats(userId);
                }
            } else {
                console.log('Seller data not found, creating initial seller data...');
                // Optional: Create initial seller data if it doesn't exist
                await createInitialSellerData(userId);
            }
        } catch (error) {
            console.error('Error fetching seller data:', error);
            setError('Gagal mengambil data seller');
        } finally {
            setLoadingSellerData(false);
        }
    };

    // Optional: Create initial seller data if it doesn't exist
    const createInitialSellerData = async (userId) => {
        try {
            const initialSellerData = {
                nameToko: userData?.name || '',
                description: '',
                location: '',
                category: '',
                tags: [],
                rating: 0,
                totalProducts: 0,
                isVerified: false,
                joinedDate: new Date(),
                profileImage: '',
                updatedAt: new Date()
            };

            const sellerRef = doc(db, 'sellers', userId);
            await setDoc(sellerRef, initialSellerData);
            setSellerData(initialSellerData);
            console.log('Initial seller data created');
        } catch (error) {
            console.error('Error creating initial seller data:', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // Prepare user data update
            const userUpdateData = {
                name: editForm.name || '',
                phoneNumber: editForm.phoneNumber || '',
                address: editForm.address || '',
                city: editForm.city || '',
                province: editForm.province || '',
                postalCode: editForm.postalCode || '',
                gender: editForm.gender || '',
                dateOfBirth: editForm.dateOfBirth || '',
                favoriteCategories: editForm.favoriteCategories || []
            };

            // Update user data in AuthContext
            await updateUserData(userUpdateData);

            // If user is seller, update seller data separately
            if (userData?.seller && editForm.sellerInfo) {
                const sellerUpdateData = {
                    nameToko: editForm.sellerInfo.nameToko || '',
                    description: editForm.sellerInfo.description || '',
                    location: editForm.sellerInfo.location || '',
                    category: editForm.sellerInfo.category || '',
                    tags: editForm.sellerInfo.tags || [],
                    // Preserve existing data that shouldn't be overwritten
                    rating: sellerData?.rating || 0,
                    totalProducts: sellerData?.totalProducts || 0,
                    isVerified: sellerData?.isVerified || false,
                    joinedDate: sellerData?.joinedDate || new Date(),
                    profileImage: sellerData?.profileImage || '',
                    // Update timestamp
                    updatedAt: new Date()
                };

                await updateSellerData(userData.uid, sellerUpdateData);
            }

            setSuccess('Profil berhasil diperbarui!');
            setIsEditing(false);

            // Refresh seller data if needed
            if (userData?.seller) {
                await fetchSellerData(userData.uid);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalProducts = async (sellerId) => {
        try {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('sellerId', '==', sellerId));
            const querySnapshot = await getDocs(q);
            console.log('Total products:', querySnapshot.size);
            return querySnapshot.size; // Mengembalikan jumlah dokumen
        } catch (error) {
            console.error('Error calculating total products:', error);
            return 0;
        }
    };

    const updateSellerStats = async (sellerId) => {
        try {
            setLoadingSellerData(true);
            // Hitung total produk dan rating secara paralel
            const [totalProducts] = await Promise.all([
                calculateTotalProducts(sellerId),
            ]);

            // Update data seller dengan statistik terbaru
            const sellerRef = doc(db, 'sellers', sellerId);
            const updateData = {
                totalProducts: totalProducts,
                updatedAt: new Date()
            };

            await setDoc(sellerRef, updateData, { merge: true });
            console.log(`[SUCCESS] Seller stats updated - Products: ${totalProducts}`);

            // Refresh seller data untuk menampilkan data terbaru
            await fetchSellerData(sellerId);
        } catch (error) {
            console.error('Error updating seller stats:', error);
        } finally {
            setLoadingSellerData(false);
        }
    };

    const updateSellerData = async (userId, updateData) => {
        try {
            const sellerRef = doc(db, 'sellers', userId);
            await setDoc(sellerRef, updateData, { merge: true });
            console.log('[SUCCESS] Seller data updated successfully');
        } catch (error) {
            console.error('[ERROR] Failed to update seller data:', error);
            throw new Error('Gagal mengupdate data seller');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
        // Reset form to original data
        if (userData) {
            const formData = { ...userData };
            if (sellerData) {
                formData.sellerInfo = { ...sellerData };
            }
            setEditForm(formData);
        }
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSellerInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            sellerInfo: {
                ...prev.sellerInfo,
                [field]: value
            }
        }));
    };

    const handleArrayInputChange = (field, value) => {
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
        setEditForm(prev => ({
            ...prev,
            [field]: arrayValue
        }));
    };

    const handleSellerArrayInputChange = (field, value) => {
        const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
        setEditForm(prev => ({
            ...prev,
            sellerInfo: {
                ...prev.sellerInfo,
                [field]: arrayValue
            }
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    // Format date for input field
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = dateString.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString);
        return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    };

    // Loading state untuk seluruh halaman
    if (loadingSellerData && !sellerData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Memuat data seller...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                {(userData.profileImageUrl || sellerData?.profileImage) ? (
                                    <img
                                        src={userData.profileImageUrl || sellerData?.profileImage}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {userData.seller ? (sellerData?.namaToko || userData.name) : userData.name}
                                </h1>
                                <p className="text-gray-600">
                                    {userData.seller ? 'Seller' : 'User'} • Bergabung {formatDate(userData.createdAt)}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                                        }`}>
                                        ✓ Email Terverifikasi
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
                                        }`}>
                                        ✓ Telepon Terverifikasi
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Perbarui Profil</span>
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Batal</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Shield className="h-5 w-5 text-green-400 mr-2" />
                            <span className="text-sm text-green-800">{success}</span>
                        </div>
                    )}
                </div>

                {/* Seller Stats (only for sellers) */}
                {userData.seller && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {loadingSellerData ? (
                            <div className="md:col-span-4 text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">Memuat data seller...</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Star className="h-8 w-8 text-yellow-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-600">Rating</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {sellerData?.rating || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Package className="h-8 w-8 text-blue-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-600">Total Produk</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {totalProducts}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Shield className="h-8 w-8 text-green-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-600">Status</p>
                                            <p className={`text-lg font-semibold ${sellerData?.isVerified ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {sellerData?.isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <Clock className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-600">Bergabung Seller</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {sellerData?.joinedDate ? formatDate(sellerData.joinedDate) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Profile Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Profil</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <User className="h-5 w-5 mr-2" />
                                Informasi Pribadi
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.name || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.name || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        Email
                                    </label>
                                    <p className="mt-1 text-gray-900">{userData.email || '-'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        Nomor Telepon
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editForm.phoneNumber || ''}
                                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan nomor telepon"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.phoneNumber || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                    {isEditing ? (
                                        <select
                                            value={editForm.gender || ''}
                                            onChange={(e) => handleInputChange('gender', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Jenis Kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.gender || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Tanggal Lahir
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={formatDateForInput(editForm.dateOfBirth) || ''}
                                            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{formatDate(userData.dateOfBirth)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <MapPin className="h-5 w-5 mr-2" />
                                Alamat
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Home className="h-4 w-4 mr-1" />
                                        Alamat Lengkap
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan alamat lengkap"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.address || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kota</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.city || ''}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan kota"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.city || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.province || ''}
                                            onChange={(e) => handleInputChange('province', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan provinsi"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.province || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kode Pos</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.postalCode || ''}
                                            onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan kode pos"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.postalCode || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller-specific Information */}
                    {userData.seller && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Informasi Toko
                            </h3>

                            {loadingSellerData ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-gray-600">Memuat data toko...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.sellerInfo?.nameToko || ''}
                                                onChange={(e) => handleSellerInputChange('namaToko', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Masukkan nama toko"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{sellerData?.nameToko || '-'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Lokasi Toko</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.sellerInfo?.location || ''}
                                                onChange={(e) => handleSellerInputChange('location', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Masukkan lokasi toko"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{sellerData?.location || '-'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Kategori Toko</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.sellerInfo?.category || ''}
                                                onChange={(e) => handleSellerInputChange('category', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Masukkan kategori toko"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{sellerData?.category || '-'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tags Toko</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.sellerInfo?.tags ? editForm.sellerInfo.tags.join(', ') : ''}
                                                onChange={(e) => handleSellerArrayInputChange('tags', e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Pisahkan dengan koma (misal: makanan, minuman, halal)"
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {sellerData?.tags && sellerData.tags.length > 0 ? (
                                                    sellerData.tags.map((tag, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {tag}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">Belum ada tags</span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Deskripsi Toko</label>
                                        {isEditing ? (
                                            <textarea
                                                value={editForm.sellerInfo?.description || ''}
                                                onChange={(e) => handleSellerInputChange('description', e.target.value)}
                                                rows={4}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{sellerData?.description || '-'}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Favorite Categories (only for regular users) */}
                    {!userData.seller && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategori Favorit</h3>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.favoriteCategories ? editForm.favoriteCategories.join(', ') : ''}
                                    onChange={(e) => handleArrayInputChange('favoriteCategories', e.target.value)}
                                    placeholder="Pisahkan dengan koma (misal: Makanan Tradisional, Minuman, Cemilan)"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {userData.favoriteCategories && userData.favoriteCategories.length > 0 ? (
                                        userData.favoriteCategories.map((category, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {category}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500">Belum ada kategori favorit</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;