import React, { useState, useEffect, useRef } from 'react';
import {
    Upload, Image, Save, X, AlertCircle,
    CheckCircle, Loader2, FileText, Tag,
    ArrowLeft, Megaphone, Star, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainKontenService from '../services/MainKontenService';
import { capitalizeWord } from '../utils/formatHelpers';
import { categoryOptions } from '../utils/categories';

const EditKonten = ({ kontenId, onBack, onSuccess, onDelete }) => {
    const navigate = useNavigate();
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
    const [currentImageUrl, setCurrentImageUrl] = useState(null);

    // UI state
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load existing konten data
    useEffect(() => {
        const loadKontenData = async () => {
            try {
                setLoadingData(true);
                const kontenData = await MainKontenService.getKontenById(kontenId);

                if (kontenData) {
                    setFormData({
                        title: kontenData.title || '',
                        description: kontenData.description || '',
                        category: kontenData.category?.toLowerCase() || '',
                        status: kontenData.status || 'Published'
                    });
                    setCurrentImageUrl(kontenData.imageUrl || null);
                } else {
                    setError('Konten promosi tidak ditemukan');
                }
            } catch (error) {
                console.error('Error loading konten:', error);
                setError('Gagal memuat data konten promosi');
            } finally {
                setLoadingData(false);
            }
        };

        if (kontenId) {
            loadKontenData();
        }
    }, [kontenId]);

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

        setLoading(true);
        setError(null);

        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                category: capitalizeWord(formData.category),
                status: formData.status
            };

            await MainKontenService.updateKonten(kontenId, updateData, imageFile);

            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/konten');
                }
            }, 2000);

        } catch (error) {
            console.error('Error updating konten:', error);
            setError('Gagal memperbarui konten promosi. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setDeleting(true);
        setError(null);

        try {
            await MainKontenService.deleteKonten(kontenId);

            setTimeout(() => {
                if (onDelete) {
                    onDelete();
                } else {
                    navigate('/konten');
                }
            }, 1000);

        } catch (error) {
            console.error('Error deleting konten:', error);
            setError('Gagal menghapus konten promosi. Silakan coba lagi.');
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // Handle success screen actions
    const handleViewContent = () => {
        if (onSuccess) {
            onSuccess();
        } else {
            navigate('/konten');
        }
    };

    // Remove image selection
    const removeImageSelection = () => {
        setImageFile(null);
        setImagePreview(null);
        if (imageRef.current) {
            imageRef.current.value = '';
        }
    };

    // Loading state
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
                        <p className="text-gray-600">Memuat data konten...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Berhasil Diperbarui!
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Konten promosi Anda telah berhasil diperbarui.
                        </p>
                        <button
                            onClick={handleViewContent}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Kembali ke Konten
                        </button>
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <Megaphone className="h-8 w-8 mr-3 text-green-600" />
                                Edit Konten Promosi
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Perbarui konten promosi untuk meningkatkan penjualan Anda
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                        </button>
                    </div>
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
                                    {categoryOptions.map(cat => (
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

                        {/* Current Image */}
                        {currentImageUrl && !imagePreview && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Gambar saat ini:</p>
                                <img
                                    src={currentImageUrl}
                                    alt="Current content"
                                    className="rounded-lg shadow-md w-full max-w-xs"
                                />
                            </div>
                        )}

                        {/* New Image Preview */}
                        {imagePreview ? (
                            <div className="relative w-full max-w-xs mb-4">
                                <p className="text-sm text-gray-600 mb-2">Gambar baru:</p>
                                <img
                                    src={imagePreview}
                                    alt="New preview"
                                    className="rounded-lg shadow-md w-full"
                                />
                                <button
                                    type="button"
                                    onClick={removeImageSelection}
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
                                    {currentImageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                                </button>
                                <p className="text-sm text-gray-500 mt-2">
                                    Format gambar .jpg, .jpeg, .png. Maksimal 5MB.
                                    {currentImageUrl && ' Biarkan kosong jika tidak ingin mengganti gambar.'}
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
                                    Memperbarui...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Perbarui Konten
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Hapus Konten Promosi?
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Apakah Anda yakin ingin menghapus konten promosi ini? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    disabled={deleting}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                                            Menghapus...
                                        </>
                                    ) : (
                                        'Hapus'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditKonten;