import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Save, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import productService from '../services/ProductServices';
import { categoryList } from '../utils/categories';

const EditProduct = ({ productId, onBack, onSuccess, onDelete }) => {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sellerData, setSellerData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrls: []
    });
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingProduct(true);

                // Fetch product data
                const product = await productService.getProductById(productId);
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    stock: product.stock?.toString() || '',
                    category: product.category || '',
                    imageUrls: product.imageUrls || []
                });

                // Fetch seller data
                if (userData?.uid) {
                    const seller = await productService.getSellerData(userData.uid);
                    setSellerData(seller);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrors({ load: 'Gagal memuat data produk' });
            } finally {
                setLoadingProduct(false);
            }
        };

        if (productId && userData?.uid) {
            fetchData();
        }
    }, [productId, userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = formData.imageUrls.length + newImageFiles.length + files.length;

        if (totalImages > 5) {
            setErrors(prev => ({
                ...prev,
                images: 'Maksimal 5 gambar yang diizinkan'
            }));
            return;
        }

        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        }));

        setNewImageFiles(prev => [...prev, ...newFiles]);
        setErrors(prev => ({
            ...prev,
            images: ''
        }));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index)
        }));
    };

    const removeNewImage = (id) => {
        setNewImageFiles(prev => {
            const updated = prev.filter(item => item.id !== id);
            // Clean up object URLs
            const itemToRemove = prev.find(item => item.id === id);
            if (itemToRemove) {
                URL.revokeObjectURL(itemToRemove.preview);
            }
            return updated;
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama produk harus diisi';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Deskripsi produk harus diisi';
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Harga harus diisi dan lebih dari 0';
        }

        if (!formData.stock || parseInt(formData.stock) <= 0) {
            newErrors.stock = 'Stok harus diisi dan lebih dari 0';
        }

        if (!formData.category) {
            newErrors.category = 'Kategori harus dipilih';
        }

        if (formData.imageUrls.length === 0 && newImageFiles.length === 0) {
            newErrors.images = 'Minimal 1 gambar produk harus ada';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const uploadNewImages = async () => {
        if (newImageFiles.length === 0) return [];

        // Simulasi upload gambar ke Cloudinary atau storage lainnya
        const uploadPromises = newImageFiles.map(async (fileObj) => {
            // Simulasi upload - ganti dengan implementasi nyata
            await new Promise(resolve => setTimeout(resolve, 1000));
            return `https://example.com/uploads/${fileObj.file.name}`;
        });

        return Promise.all(uploadPromises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Upload new images
            const uploadedImageUrls = await uploadNewImages();

            // Combine existing and new image URLs
            const allImageUrls = [...formData.imageUrls, ...uploadedImageUrls];

            // Prepare product data
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                imageUrls: allImageUrls,
                nameToko: sellerData?.nameToko || userData.displayName || 'Toko Saya'
            };

            // Update product
            const updatedProduct = await productService.updateProduct(productId, productData);

            // Clean up object URLs
            newImageFiles.forEach(fileObj => {
                URL.revokeObjectURL(fileObj.preview);
            });

            if (onSuccess) {
                onSuccess(updatedProduct);
            }

        } catch (error) {
            console.error('Error updating product:', error);
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await productService.deleteProduct(productId);
            if (onDelete) {
                onDelete(productId);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setErrors({ delete: error.message });
        } finally {
            setLoading(false);
            setShowDeleteModal(false);
        }
    };

    if (loadingProduct) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Memuat data produk...</span>
                </div>
            </div>
        );
    }

    if (errors.load) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{errors.load}</p>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
                            <p className="text-gray-600">Perbarui informasi produk Anda</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus Produk
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Produk *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Masukkan nama produk"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategori *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-200'
                                    }`}
                            >
                                <option value="">Pilih kategori</option>
                                {categoryList.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Harga (Rp) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="0"
                                min="0"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stok *
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="0"
                                min="0"
                            />
                            {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deskripsi Produk *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="Deskripsikan produk Anda dengan menarik"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gambar Produk * (Maksimal 5 gambar)
                        </label>

                        {/* Existing Images */}
                        {formData.imageUrls.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Gambar yang sudah ada:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.imageUrls.map((url, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={url}
                                                alt={`Existing ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload New Images */}
                        <div className="mb-4">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="inline-flex items-center px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                                <Upload className="h-5 w-5 mr-2" />
                                Tambah Gambar Baru
                            </label>
                        </div>

                        {/* New Images Preview */}
                        {newImageFiles.length > 0 && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Gambar baru:</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {newImageFiles.map(fileObj => (
                                        <div key={fileObj.id} className="relative">
                                            <img
                                                src={fileObj.preview}
                                                alt="New Preview"
                                                className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(fileObj.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                    </div>

                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700">{errors.submit}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Hapus Produk
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus produk "{formData.name}"?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>

                            {errors.delete && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-red-700 text-sm">{errors.delete}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    disabled={loading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
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
        </>
    );
};

export default EditProduct;