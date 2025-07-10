import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit3,
    Save,
    X,
    Star,
    Package,
    Shield,
    Clock,
    Tag,
    Home,
    Building
} from 'lucide-react';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [userType, setUserType] = useState('user'); // 'user' atau 'seller'

    // Sample data untuk user biasa
    const [userData, setUserData] = useState({
        uid: "0ZXJrLVAJwffXlDV2qCZj9RfAhJ2",
        name: "John Doe",
        email: "john.doe@gmail.com",
        phoneNumber: "+6287723916400",
        seller: false,
        address: "Jl. Sudirman No. 123",
        city: "Jakarta",
        province: "DKI Jakarta",
        postalCode: "12345",
        gender: "Laki-laki",
        dateOfBirth: "1990-01-15",
        profileImageUrl: null,
        phoneVerified: true,
        emailVerified: true,
        createdAt: "2025-06-24T15:47:01.077406",
        lastLoginAt: "2025-06-24T15:47:01.077607",
        favoriteCategories: ["Makanan Tradisional", "Minuman", "Cemilan"]
    });

    // Sample data untuk seller
    const [sellerData, setSellerData] = useState({
        id: "0ZXJrLVAJwffXlDV2qCZj9RfAhJ2",
        nameToko: "Rujak Rasa",
        description: "Rujak serut buah segar dengan sambal kacang khas, pedas manis segar menyatu di mulut.",
        location: "Jl. Mayor Kusmanto No.1, Klaten Tengah, Klaten 57411",
        category: "Makanan Tradisional",
        rating: 4.5,
        totalProducts: 25,
        isVerified: true,
        joinedDate: 1750754821829,
        tags: ["Halal", "Vegetarian", "Spicy", "Sweet", "Traditional"],
        profileImage: ""
    });

    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        // Set form data berdasarkan user type
        if (userType === 'seller') {
            setEditForm({ ...userData, ...sellerData });
        } else {
            setEditForm({ ...userData });
        }
    }, [userType, userData, sellerData]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (userType === 'seller') {
            setUserData({ ...editForm });
            setSellerData({ ...editForm });
        } else {
            setUserData({ ...editForm });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (userType === 'seller') {
            setEditForm({ ...userData, ...sellerData });
        } else {
            setEditForm({ ...userData });
        }
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatJoinedDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {userType === 'seller' ? (editForm.nameToko || 'Nama Toko') : (editForm.name || 'Nama User')}
                                </h1>
                                <p className="text-gray-600">
                                    {userType === 'seller' ? 'Seller' : 'User'} • Bergabung {formatJoinedDate(editForm.joinedDate || Date.now())}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${editForm.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {editForm.emailVerified ? '✓ Email Terverifikasi' : '✗ Email Belum Terverifikasi'}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${editForm.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {editForm.phoneVerified ? '✓ Telepon Terverifikasi' : '✗ Telepon Belum Terverifikasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setUserType(userType === 'user' ? 'seller' : 'user')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Switch to {userType === 'user' ? 'Seller' : 'User'}
                            </button>

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
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Simpan</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>Batal</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Seller Stats (hanya untuk seller) */}
                {userType === 'seller' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Star className="h-8 w-8 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Rating</p>
                                    <p className="text-lg font-semibold text-gray-900">{editForm.rating || 0}</p>
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
                                    <p className="text-lg font-semibold text-gray-900">{editForm.totalProducts || 0}</p>
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
                                    <p className={`text-lg font-semibold ${editForm.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                        {editForm.isVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Building className="h-8 w-8 text-purple-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Kategori</p>
                                    <p className="text-lg font-semibold text-gray-900">{editForm.category || '-'}</p>
                                </div>
                            </div>
                        </div>
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
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editForm.email || ''}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.email || '-'}</p>
                                    )}
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
                                            value={editForm.dateOfBirth || ''}
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
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{userData.postalCode || '-'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller-specific Information */}
                    {userType === 'seller' && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Informasi Toko
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.nameToko || ''}
                                            onChange={(e) => handleInputChange('nameToko', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{sellerData.nameToko || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kategori Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.category || ''}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{sellerData.category || '-'}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Deskripsi Toko</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editForm.description || ''}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            rows={4}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{sellerData.description || '-'}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Lokasi Toko</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.location || ''}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="mt-1 text-gray-900">{sellerData.location || '-'}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                                        <Tag className="h-4 w-4 mr-1" />
                                        Tags
                                    </label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {sellerData.tags && sellerData.tags.map((tag, index) => (
                                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Favorite Categories (hanya untuk user biasa) */}
                    {userType === 'user' && userData.favoriteCategories && userData.favoriteCategories.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Kategori Favorit</h3>
                            <div className="flex flex-wrap gap-2">
                                {userData.favoriteCategories.map((category, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {category}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;