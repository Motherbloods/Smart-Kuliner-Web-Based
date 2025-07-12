import React, { useState, useRef } from 'react';
import {
    Upload, Image, Save, X, AlertCircle,
    CheckCircle, Loader2, FileText, Tag,
    ArrowLeft, Megaphone, Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import MainKontenService from '../services/MainKontenService';
import { capitalizeWord } from '../utils/formatHelpers';

const AddKonten = ({ onBack, onSuccess }) => {
    const navigate = useNavigate();
    const { userData } = useAuth();
    const imageRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        status: 'Published'
    });

    // File state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Category options
    const categories = [
        { value: 'makanan utama', label: 'Makanan Utama' },
        { value: 'cemilan', label: 'Cemilan' },
        { value: 'makanan sehat', label: 'Makanan Sehat' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'minuman', label: 'Minuman' },
        { value: 'promo special', label: 'Promo Special' },
        { value: 'lainnya', label: 'Lainnya' }
    ];

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Gambar terlalu besar. Maksimal 5MB.');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                setError('File harus berupa gambar.');
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    // Handle back navigation
    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate('/konten');
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setError('Judul konten harus diisi.');
            return;
        }
        if (!formData.description.trim()) {
            setError('Deskripsi konten harus diisi.');
            return;
        }
        if (!formData.category) {
            setError('Kategori harus dipilih.');
            return;
        }
        if (!imageFile) {
            setError('Gambar konten harus diupload.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const kontenData = {
                title: formData.title,
                description: formData.description,
                category: capitalizeWord(formData.category),
                status: formData.status,
                sellerId: userData.uid,
                namaToko: userData.namaToko || 'Toko Saya',
                sellerAvatar: userData.photoURL || ''
            };

            await MainKontenService.createKonten(kontenData, imageFile);

            await new Promise(resolve => setTimeout(resolve, 2000));

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/konten');
                }
            }, 2000);

        } catch (error) {
            console.error('Error creating konten:', error);
            setError('Gagal menambahkan konten promosi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: '',
            status: 'Published'
        });
        setImageFile(null);
        setImagePreview(null);
        setError(null);
        setSuccess(false);
    };

    // Handle success screen actions
    const handleViewContent = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            navigate('/konten');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Berhasil Ditambahkan!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Konten promosi Anda telah berhasil ditambahkan dan akan segera tersedia.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleViewContent}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Lihat Konten
                            </button>
                            <button
                                onClick={resetForm}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Tambah Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-green-600 hover:text-green-700 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Konten
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <Megaphone className="h-8 w-8 mr-3 text-green-600" />
                        Tambah Konten Promosi
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Buat konten promosi yang menarik untuk meningkatkan penjualan Anda
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Informasi Konten
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Konten Promosi *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Diskon 50% Semua Menu Makanan!"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Buatlah judul yang menarik dan eye-catching untuk menarik perhatian pelanggan
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi Konten Promosi *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Tuliskan deskripsi detail mengenai promosi Anda"
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Jelaskan promosi secara detail untuk menarik perhatian pelanggan
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori Promosi *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status Publikasi
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Upload Image */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Image className="h-5 w-5 mr-2" />
                            Gambar Konten
                        </h2>

                        {imagePreview ? (
                            <div className="relative w-full max-w-xs">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="rounded-lg shadow-md w-full"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                                >
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={imageRef}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => imageRef.current?.click()}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload Gambar
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Format gambar .jpg, .jpeg, .png. Maksimal 5MB.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Simpan Konten
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddKonten;