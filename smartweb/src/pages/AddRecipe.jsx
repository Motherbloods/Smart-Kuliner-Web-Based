import React, { useState } from 'react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Camera,
    AlertCircle,
    Check,
    X
} from 'lucide-react';
import { createRecipe } from '../services/RecipeServices';
import { useAuth } from '../hooks/useAuth';
import { imageUploadService } from '../services/CloudinaryService';
import { categoryList } from '../utils/categories';
const AddRecipe = ({ onBack, onSuccess }) => {
    const { userData } = useAuth();

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState([]);
    const [imagePreview, setImagePreview] = useState('');


    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Makanan Utama',
        difficulty: 'Mudah',
        duration: '',
        servings: '',
        ingredients: [''],
        steps: [{ stepNumber: 1, instruction: '' }],
    });

    const difficulties = ['Mudah', 'Sedang', 'Sulit'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError(null);
    };

    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview('');
    };


    const addIngredient = () => {
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
    };

    const removeIngredient = (index) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    };

    const updateIngredient = (index, value) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.map((item, i) => i === index ? value : item)
        }));
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [...prev.steps, { stepNumber: prev.steps.length + 1, instruction: '' }]
        }));
    };

    const removeStep = (index) => {
        const updatedSteps = formData.steps.filter((_, i) => i !== index)
            .map((step, i) => ({ ...step, stepNumber: i + 1 }));

        setFormData(prev => ({ ...prev, steps: updatedSteps }));
    };

    const updateStep = (index, instruction) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.map((step, i) => i === index ? { ...step, instruction } : step)
        }));
    };

    const validateForm = () => {
        if (!formData.title.trim()) return 'Judul harus diisi';
        if (!formData.description.trim()) return 'Deskripsi harus diisi';
        if (!formData.duration || formData.duration <= 0) return 'Durasi harus lebih dari 0';
        if (!formData.servings || formData.servings <= 0) return 'Porsi harus lebih dari 0';
        if (formData.ingredients.some(ing => !ing.trim())) return 'Semua bahan harus diisi';
        if (formData.steps.some(step => !step.instruction.trim())) return 'Semua langkah harus diisi';
        if (!imageFile) return 'Gambar harus diunggah';

        return null;
    };

    const uploadImage = async () => {
        const uploaded = await imageUploadService.uploadSingleImage(imageFile, 'recipes');
        return uploaded.url;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const imageUrl = await uploadImage();

            const cleanedData = {
                ...formData,
                userId: userData.uid,
                imageUrl,
                ingredients: formData.ingredients.filter(ing => ing.trim()),
                steps: formData.steps.filter(step => step.instruction.trim())
            };

            const result = await createRecipe(cleanedData);

            if (imagePreview) URL.revokeObjectURL(imagePreview);

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    onSuccess && onSuccess();
                }, 1500);
            } else {
                setError(result.error || 'Gagal menyimpan resep');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Terjadi kesalahan saat menyimpan resep');
        } finally {
            setSaving(false);
        }
    };


    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Resep berhasil ditambahkan!
                    </h3>
                    <p className="text-gray-600">Anda akan diarahkan kembali...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Kembali</span>
                            </button>
                            <div className="h-6 w-px bg-gray-300" />
                            <h1 className="text-xl font-semibold text-gray-900">
                                Tambah Resep
                            </h1>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    <span>Simpan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <span className="text-red-700">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judul Resep *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Masukkan judul resep..."
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deskripsi *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Deskripsikan resep Anda..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categoryList.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tingkat Kesulitan *
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {difficulties.map(difficulty => (
                                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Durasi (menit) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porsi *
                                </label>
                                <input
                                    type="number"
                                    value={formData.servings}
                                    onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 0)}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto Resep</h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                                title="Hapus gambar"
                                            >
                                                &times;
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Camera className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>


                    {/* Ingredients */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Bahan-bahan</h2>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Bahan</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={ingredient}
                                            onChange={(e) => updateIngredient(index, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Bahan ${index + 1}...`}
                                        />
                                    </div>
                                    {formData.ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Langkah-langkah</h2>
                            <button
                                type="button"
                                onClick={addStep}
                                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Langkah</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.steps.map((step, index) => (
                                <div key={index} className="flex space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                            {step.stepNumber}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={step.instruction}
                                            onChange={(e) => updateStep(index, e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Langkah ${index + 1}...`}
                                        />
                                    </div>
                                    {formData.steps.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeStep(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? 'Menyimpan...' : 'Tambah Resep'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecipe;