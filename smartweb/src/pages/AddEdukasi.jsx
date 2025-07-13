import React, { useState, useRef } from 'react';
import {
    Upload, Video, Image, Save, X, AlertCircle,
    CheckCircle, Loader2, FileText, Clock, Tag,
    ArrowLeft, Play, Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MainKontenService } from '../services/Index.js';
import { categoryOptions } from '../utils/categories.js';

const AddEdukasi = ({ onBack, onSuccess }) => {
    const { userData } = useAuth();
    const videoRef = useRef(null);
    const imageRef = useRef(null);

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

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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
            setVideoPreview(URL.createObjectURL(file));
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
            setImagePreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi...
        if (!formData.title.trim()) {
            setError('Judul harus diisi.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const edukasiData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                readTime: parseInt(formData.readTime),
                tags: formData.tags && formData.tags.length > 0
                    ? formData.tags.split(',').map((tag) => tag.trim())
                    : [],
                status: "Published",
                sellerId: userData.uid,
                namaToko: userData.namaToko || 'Toko Saya',
            };

            const result = await MainKontenService.createEdukasi(
                edukasiData,
                videoFile,
                imageFile
            );

            if (result?.id) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            } else {
                setError('Gagal menambahkan konten edukasi.');
            }
        } catch (err) {
            console.error('Gagal membuat edukasi:', err);
            setError('Terjadi kesalahan saat menambahkan konten.');
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
            readTime: 1,
            tags: '',
            status: 'Published'
        });
        setVideoFile(null);
        setImageFile(null);
        setVideoPreview(null);
        setImagePreview(null);
        setError(null);
        setSuccess(false);
    };

    // Cleanup function for object URLs
    React.useEffect(() => {
        return () => {
            if (videoPreview) {
                URL.revokeObjectURL(videoPreview);
            }
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [videoPreview, imagePreview]);

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
                            Konten edukasi Anda telah berhasil ditambahkan dan akan segera tersedia.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={onSuccess}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
                    <h1 className="text-3xl font-bold text-gray-800">
                        Tambah Konten Edukasi
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Buat konten edukasi yang bermanfaat untuk komunitas kuliner
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
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Upload className="h-5 w-5 mr-2" />
                            Upload Media
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video Konten *
                                </label>
                                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                    {videoPreview ? (
                                        <div className="relative">
                                            <video
                                                ref={videoRef}
                                                src={videoPreview}
                                                className="w-full h-48 object-cover rounded-lg"
                                                controls
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setVideoFile(null);
                                                    setVideoPreview(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">
                                                Klik untuk upload video
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
                                    Thumbnail *
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
                                                onClick={() => {
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-gray-600 mb-2">
                                                Klik untuk upload gambar
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
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
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

export default AddEdukasi;