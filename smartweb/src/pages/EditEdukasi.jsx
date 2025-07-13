import React, { useState, useRef, useEffect } from 'react';
import {
    Upload, Video, Image, Save, X, AlertCircle,
    CheckCircle, Loader2, FileText, Clock, Tag,
    ArrowLeft, Play, Eye, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MainKontenService } from '../services/Index.js';
import { categoryOptions } from '../utils/categories.js';

const EditEdukasi = ({ edukasiId, onBack, onSuccess, onDelete }) => {
    const { userData } = useAuth();
    const videoRef = useRef(null);
    const imageRef = useRef(null);

    // Data state
    const [edukasiData, setEdukasiData] = useState(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        readTime: 1,
        tags: '',
        status: 'Published'
    });

    // File state
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Track if files are changed
    const [videoChanged, setVideoChanged] = useState(false);
    const [imageChanged, setImageChanged] = useState(false);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    // Fetch edukasi data
    useEffect(() => {
        const fetchEdukasiData = async () => {
            try {

                setInitialLoading(true);
                const data = await MainKontenService.getEdukasiById(edukasiId);
                console.log(data)
                if (data) {
                    setEdukasiData(data);
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        category: data.category || '',
                        readTime: data.readTime || 1,
                        tags: data.tags ? data.tags.join(', ') : '',
                        status: data.status || 'Published'
                    });
                    setVideoPreview(data.videoUrl || null);
                    setImagePreview(data.imageUrl || null);
                } else {
                    setError('Data edukasi tidak ditemukan.');
                }
            } catch (err) {
                console.error('Error fetching edukasi data:', err);
                setError('Gagal memuat data edukasi.');
            } finally {
                setInitialLoading(false);
            }
        };

        if (edukasiId) {
            fetchEdukasiData();
        }
    }, [edukasiId]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle video file selection
    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setError('Video terlalu besar. Maksimal 50MB.');
                return;
            }

            // Check file type
            if (!file.type.startsWith('video/')) {
                setError('File harus berupa video.');
                return;
            }

            setVideoFile(file);
            if (videoPreview && videoChanged) {
                URL.revokeObjectURL(videoPreview);
            }
            setVideoPreview(URL.createObjectURL(file));
            setVideoChanged(true);
            setError(null);
        }
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
            if (imagePreview && imageChanged) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(URL.createObjectURL(file));
            setImageChanged(true);
            setError(null);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            setError('Judul harus diisi.');
            return;
        }

        if (!formData.description.trim()) {
            setError('Deskripsi harus diisi.');
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
                category: formData.category,
                readTime: parseInt(formData.readTime),
                tags: formData.tags && formData.tags.length > 0
                    ? formData.tags.split(',').map((tag) => tag.trim())
                    : [],
                status: formData.status,
                sellerId: userData.uid,
                namaToko: userData.namaToko || 'Toko Saya',
                updatedAt: new Date().toISOString()
            };

            const result = await MainKontenService.updateEdukasi(
                edukasiId,
                updateData,
                videoChanged ? videoFile : null,
                imageChanged ? imageFile : null
            );

            if (result?.success !== false) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                setError('Gagal memperbarui konten edukasi.');
            }
        } catch (err) {
            console.error('Gagal memperbarui edukasi:', err);
            setError('Terjadi kesalahan saat memperbarui konten.');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            setDeleteLoading(true);
            const result = await MainKontenService.deleteEdukasi(edukasiId);

            if (result?.success !== false) {
                setShowDeleteConfirm(false);
                onDelete();
            } else {
                setError('Gagal menghapus konten edukasi.');
            }
        } catch (err) {
            console.error('Error deleting edukasi:', err);
            setError('Terjadi kesalahan saat menghapus konten.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // Remove video
    const removeVideo = () => {
        if (videoPreview && videoChanged) {
            URL.revokeObjectURL(videoPreview);
        }
        setVideoFile(null);
        setVideoPreview(null);
        setVideoChanged(true);
        if (videoRef.current) {
            videoRef.current.value = '';
        }
    };

    // Remove image
    const removeImage = () => {
        if (imagePreview && imageChanged) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
        setImageChanged(true);
        if (imageRef.current) {
            imageRef.current.value = '';
        }
    };

    // Cleanup function for object URLs
    useEffect(() => {
        return () => {
            if (videoPreview && videoChanged) {
                URL.revokeObjectURL(videoPreview);
            }
            if (imagePreview && imageChanged) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [videoPreview, imagePreview, videoChanged, imageChanged]);

    // Loading state
    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Memuat Data...
                        </h2>
                        <p className="text-gray-600">
                            Sedang mengambil data konten edukasi
                        </p>
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
                            Konten edukasi Anda telah berhasil diperbarui dan perubahan telah disimpan.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onSuccess}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Lihat Konten
                            </button>
                            <button
                                onClick={onBack}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state (if failed to load data)
    if (error && !edukasiData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Gagal Memuat Data
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {error}
                        </p>
                        <button
                            onClick={onBack}
                            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Konten
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                                <Edit3 className="h-8 w-8 mr-3" />
                                Edit Konten Edukasi
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Perbarui konten edukasi Anda untuk komunitas kuliner
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

                {/* Info Alert */}
                {edukasiData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <Eye className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-blue-800">
                                Anda sedang mengedit konten: <strong>{edukasiData.title}</strong>
                            </span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <FileText className="h-5 w-5 mr-2" />
                            Informasi Dasar
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Konten *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan judul konten edukasi"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <Clock className="h-4 w-4 inline mr-1" />
                                    Waktu Baca (menit)
                                </label>
                                <input
                                    type="number"
                                    name="readTime"
                                    value={formData.readTime}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="60"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan tags, pisahkan dengan koma"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Contoh: resep, tips, masakan indonesia
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Jelaskan konten edukasi Anda"
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Upload className="h-5 w-5 mr-2" />
                            Update Media
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Konten
                                    {videoChanged && <span className="text-orange-500 text-xs ml-1">(Akan diperbarui)</span>}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    {videoPreview ? (
                                        <div className="relative">
                                            <video
                                                src={videoPreview}
                                                className="w-full h-48 object-cover rounded-lg"
                                                controls
                                            />
                                            <button
                                                type="button"
                                                onClick={removeVideo}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">
                                                Klik untuk upload video baru
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                MP4, MOV, AVI (Max 50MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={videoRef}
                                        onChange={handleVideoChange}
                                        accept="video/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thumbnail
                                    {imageChanged && <span className="text-orange-500 text-xs ml-1">(Akan diperbarui)</span>}
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">
                                                Klik untuk upload gambar baru
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                JPG, PNG, GIF (Max 5MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={imageRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Memperbarui...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Perbarui Konten
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                            <div className="text-center">
                                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Konfirmasi Hapus
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Apakah Anda yakin ingin menghapus konten edukasi ini?
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        disabled={deleteLoading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleteLoading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {deleteLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
        </div>
    );
};

export default EditEdukasi;