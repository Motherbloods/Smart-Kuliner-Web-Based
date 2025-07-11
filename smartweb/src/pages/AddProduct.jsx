import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import productService from '../services/ProductServices';
import { imageUploadService } from '../services/CloudinaryService';

const AddProduct = ({ onBack, onSuccess }) => {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sellerData, setSellerData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrls: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [errors, setErrors] = useState({});

    const categories = [
        'Makanan Utama',
        'Cemilan',
        'Minuman',
        'Makanan Sehat',
        'Dessert',
        'Lainnya',
    ];

    useEffect(() => {
        const fetchSellerData = async () => {
            if (userData?.uid) {
                try {
                    const seller = await productService.getSellerData(userData.uid);
                    setSellerData(seller);
                } catch (error) {
                    console.error('Error fetching seller data:', error);
                }
            }
        };
        fetchSellerData();
    }, [userData]);

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
        if (files.length + imageFiles.length > 5) {
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

        setImageFiles(prev => [...prev, ...newFiles]);
        setErrors(prev => ({
            ...prev,
            images: ''
        }));
    };

    const removeImage = (id) => {
        setImageFiles(prev => {
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

        if (imageFiles.length === 0) {
            newErrors.images = 'Minimal 1 gambar produk harus diupload';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const uploadImages = async () => {
        try {
            // Ambil file dari objek imageFiles
            const files = imageFiles.map(fileObj => fileObj.file);

            // Upload ke Cloudinary menggunakan service yang sudah dibuat
            const uploadedImages = await imageUploadService.uploadMultipleImages(files, 'products');

            // Ambil hanya URL dari hasil upload
            const imageUrls = uploadedImages.map(img => img.url);

            return imageUrls;
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // Upload images first
            const uploadedImageUrls = await uploadImages();

            // Prepare product data
            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category: formData.category,
                imageUrls: uploadedImageUrls,
                sellerId: userData.uid,
                nameToko: sellerData?.nameToko || userData.displayName || 'Toko Saya'
            };

            // Create product
            const newProduct = await productService.createProduct(productData);

            // Clean up object URLs
            imageFiles.forEach(fileObj => {
                URL.revokeObjectURL(fileObj.preview);
            });

            if (onSuccess) {
                onSuccess(newProduct);
            }

        } catch (error) {
            console.error('Error creating product:', error);
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
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
                        <h1 className="text-2xl font-bold text-gray-800">Tambah Produk Baru</h1>
                        <p className="text-gray-600">Lengkapi informasi produk Anda</p>
                    </div>
                </div>
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
                            {categories.map(cat => (
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

                    {/* Upload Button */}
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
                            Pilih Gambar
                        </label>
                    </div>

                    {/* Image Preview */}
                    {imageFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {imageFiles.map(fileObj => (
                                <div key={fileObj.id} className="relative">
                                    <img
                                        src={fileObj.preview}
                                        alt="Preview"
                                        className="w-full h-32 object-cover rounded-xl border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(fileObj.id)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
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
                                Simpan Produk
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;