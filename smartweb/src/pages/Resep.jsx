import { useState, useEffect } from 'react';
import {
    Clock,
    Users,
    Star,
    Heart,
    Eye,
    MessageCircle,
    ChefHat,
    ArrowLeft,
    Bookmark,
    Share2,
    Filter,
    Search,
    Grid,
    List,
    Loader2,
    Plus,
    Pencil
} from 'lucide-react';
import {
    getAllRecipesWithLikeStatus,
    incrementViewCount,
    toggleFavoriteRecipe,
    getUserLikedRecipes,
    getAllRecipes,
    getRecipesBySeller
} from '../services/RecipeServices';

const RecipePage = ({ onAddRecipe, onEditRecipe, currentUserId, isSeller }) => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [recipes, setRecipes] = useState([]);
    const [likedRecipes, setLikedRecipes] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = ['Semua', 'Makanan Utama', 'Cemilan', 'Minuman', 'Makanan Sehat', 'Dessert', 'Lainnya'];

    // Load recipes from Firebase with like status
    useEffect(() => {
        console.log('ini cure', currentUserId)
        if (currentUserId) {
            loadRecipesWithLikeStatus();
        } else {
            loadRecipes();
        }
    }, [currentUserId]);

    const loadRecipesWithLikeStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getAllRecipesWithLikeStatus(currentUserId, isSeller);
            if (result.success) {
                setRecipes(result.data);
                // Update liked recipes set - pastikan sinkronisasi
                const liked = new Set(
                    result.data.filter(recipe => recipe.isLiked).map(recipe => recipe.id)
                );
                setLikedRecipes(liked);
            } else {
                setError(result.error || 'Gagal memuat resep');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat memuat resep');
            console.error('Error loading recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRecipes = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log(isSeller)
            // Tentukan fungsi yang dipanggil berdasarkan peran pengguna
            const result = isSeller
                ? await getRecipesBySeller(currentUserId)
                : await getAllRecipes();

            if (result.success) {
                const recipesWithLikeStatus = result.data.map(recipe => ({
                    ...recipe,
                    isLiked: false
                }));

                setRecipes(recipesWithLikeStatus);
                setLikedRecipes(new Set()); // Kosongkan liked recipes
            } else {
                setError(result.error || 'Gagal memuat resep');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat memuat resep');
            console.error('Error loading recipes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter recipes based on search and category
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory && recipe.isActive;
    });

    const toggleFavorite = async (recipeId) => {
        if (!currentUserId) {
            setError('Silakan login untuk menambahkan ke favorit');
            return;
        }

        const isCurrentlyLiked = likedRecipes.has(recipeId);
        try {
            // Update local state optimistically
            setLikedRecipes(prev => {
                const newLikedRecipes = new Set(prev);
                if (isCurrentlyLiked) {
                    newLikedRecipes.delete(recipeId);
                } else {
                    newLikedRecipes.add(recipeId);
                }
                return newLikedRecipes;
            });

            // Update recipes state optimistically
            setRecipes(prev => prev.map(recipe =>
                recipe.id === recipeId
                    ? {
                        ...recipe,
                        isLiked: !isCurrentlyLiked,
                        favoriteCount: isCurrentlyLiked
                            ? Math.max(0, recipe.favoriteCount - 1)
                            : recipe.favoriteCount + 1
                    }
                    : recipe
            ));

            // Update selected recipe if it's currently viewed
            if (selectedRecipe && selectedRecipe.id === recipeId) {
                setSelectedRecipe(prev => ({
                    ...prev,
                    isLiked: !isCurrentlyLiked,
                    favoriteCount: isCurrentlyLiked
                        ? Math.max(0, prev.favoriteCount - 1)
                        : prev.favoriteCount + 1
                }));
            }

            // Update Firebase
            const result = await toggleFavoriteRecipe(recipeId, currentUserId);

            if (result.success) {
                setError(null);
            } else {
                // Revert optimistic updates jika gagal
                setLikedRecipes(prev => {
                    const newLikedRecipes = new Set(prev);
                    if (isCurrentlyLiked) {
                        newLikedRecipes.add(recipeId);
                    } else {
                        newLikedRecipes.delete(recipeId);
                    }
                    return newLikedRecipes;
                });

                setRecipes(prev => prev.map(recipe =>
                    recipe.id === recipeId
                        ? {
                            ...recipe,
                            isLiked: isCurrentlyLiked,
                            favoriteCount: isCurrentlyLiked
                                ? recipe.favoriteCount + 1
                                : Math.max(0, recipe.favoriteCount - 1)
                        }
                        : recipe
                ));

                if (selectedRecipe && selectedRecipe.id === recipeId) {
                    setSelectedRecipe(prev => ({
                        ...prev,
                        isLiked: isCurrentlyLiked,
                        favoriteCount: isCurrentlyLiked
                            ? prev.favoriteCount + 1
                            : Math.max(0, prev.favoriteCount - 1)
                    }));
                }

                setError(result.error || 'Gagal memperbarui favorit');
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            setError('Terjadi kesalahan saat memperbarui favorit');

            // Revert optimistic updates
            setLikedRecipes(prev => {
                const newLikedRecipes = new Set(prev);
                if (isCurrentlyLiked) {
                    newLikedRecipes.add(recipeId);
                } else {
                    newLikedRecipes.delete(recipeId);
                }
                return newLikedRecipes;
            });

            setRecipes(prev => prev.map(recipe =>
                recipe.id === recipeId
                    ? {
                        ...recipe,
                        isLiked: isCurrentlyLiked,
                        favoriteCount: isCurrentlyLiked
                            ? recipe.favoriteCount + 1
                            : Math.max(0, recipe.favoriteCount - 1)
                    }
                    : recipe
            ));

            if (selectedRecipe && selectedRecipe.id === recipeId) {
                setSelectedRecipe(prev => ({
                    ...prev,
                    isLiked: isCurrentlyLiked,
                    favoriteCount: isCurrentlyLiked
                        ? prev.favoriteCount + 1
                        : Math.max(0, prev.favoriteCount - 1)
                }));
            }
        }
    };

    const handleRecipeClick = async (recipe) => {
        setSelectedRecipe(recipe);
        if (isSeller) return;
        // Increment view count
        try {
            const result = await incrementViewCount(recipe.id);
            if (result.success) {
                // Update local recipe data
                setRecipes(prev => prev.map(r =>
                    r.id === recipe.id
                        ? { ...r, viewCount: r.viewCount + 1 }
                        : r
                ));
                // Update selected recipe view count
                setSelectedRecipe(prev => ({
                    ...prev,
                    viewCount: prev.viewCount + 1
                }));
            }
        } catch (err) {
            console.error('Error incrementing view count:', err);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Mudah': return 'bg-green-100 text-green-800';
            case 'Sedang': return 'bg-yellow-100 text-yellow-800';
            case 'Sulit': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Helper function untuk mengecek apakah recipe sudah di-like
    const isRecipeLiked = (recipeId) => {
        return likedRecipes.has(recipeId);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat resep...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <button
                        onClick={currentUserId ? loadRecipesWithLikeStatus : loadRecipes}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (selectedRecipe) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSelectedRecipe(null)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                    <span>Kembali</span>
                                </button>
                                <div className="h-6 w-px bg-gray-300" />
                                <h1 className="text-xl font-semibold text-gray-900">Detail Resep</h1>
                            </div>
                            <div className="flex items-center space-x-3">
                                {!isSeller &&
                                    <button
                                        onClick={() => toggleFavorite(selectedRecipe.id)}
                                        className={`p-2 rounded-full transition-colors ${isRecipeLiked(selectedRecipe.id)
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        disabled={!currentUserId}
                                        title={!currentUserId ? 'Login untuk menambahkan ke favorit' : ''}
                                    >
                                        <Heart className={`h-5 w-5 ${isRecipeLiked(selectedRecipe.id) ? 'fill-current' : ''}`} />
                                    </button>}
                                {currentUserId && (
                                    <button
                                        onClick={() => onEditRecipe(selectedRecipe)}
                                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                        <Pencil className="h-5 w-5" />
                                    </button>
                                )}
                                {!isSeller && <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Bookmark className="h-5 w-5" />
                                </button>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recipe Detail Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Image and Basic Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                                <div className="aspect-square relative">
                                    <img
                                        src={selectedRecipe.imageUrl}
                                        alt={selectedRecipe.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                                            {selectedRecipe.difficulty}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedRecipe.title}</h1>
                                    <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">{selectedRecipe.duration} menit</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">{selectedRecipe.servings} porsi</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Eye className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">{selectedRecipe.viewCount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Dibuat: {formatDate(selectedRecipe.createdAt)}</span>
                                        <span className="flex items-center space-x-1">
                                            <Heart className="h-4 w-4" />
                                            <span>{selectedRecipe.favoriteCount}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Ingredients and Steps */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Ingredients */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <ChefHat className="h-5 w-5 mr-2 text-blue-600" />
                                    Bahan-bahan
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedRecipe.ingredients.map((ingredient, index) => (
                                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                                            <span className="text-gray-700">{ingredient}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Langkah-langkah</h2>
                                <div className="space-y-4">
                                    {selectedRecipe.steps.map((step, index) => (
                                        <div key={index} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                                    {step.stepNumber}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 leading-relaxed">{step.instruction}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm rounded-t-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">Resep</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onAddRecipe}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Tambah Resep</span>
                            </button>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-b-lg shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari resep..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipe Grid/List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {filteredRecipes.length === 0 ? (
                    <div className="text-center py-12">
                        <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada resep ditemukan</h3>
                        <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {filteredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex space-x-4 p-4' : 'overflow-hidden'
                                    }`}
                                onClick={() => handleRecipeClick(recipe)}
                            >
                                {viewMode === 'grid' ? (
                                    <>
                                        <div className="aspect-video relative">
                                            <img
                                                src={recipe.imageUrl}
                                                alt={recipe.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                                                    {recipe.difficulty}
                                                </span>
                                            </div>
                                            {!isSeller && <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(recipe.id);
                                                }}
                                                className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${isRecipeLiked(recipe.id)
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-white/80 text-gray-600 hover:bg-white'
                                                    }`}
                                                disabled={!currentUserId}
                                            >
                                                <Heart className={`h-4 w-4 ${isRecipeLiked(recipe.id) ? 'fill-current' : ''}`} />
                                            </button>}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.title}</h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{recipe.duration}m</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="h-4 w-4" />
                                                        <span>{recipe.servings}</span>
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">{recipe.category}</span>
                                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="h-3 w-3" />
                                                        <span>{recipe.viewCount}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Heart className="h-3 w-3" />
                                                        <span>{recipe.favoriteCount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-shrink-0">
                                            <img
                                                src={recipe.imageUrl}
                                                alt={recipe.title}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 mb-1">{recipe.title}</h3>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{recipe.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{recipe.duration}m</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4" />
                                                    <span>{recipe.servings}</span>
                                                </div>

                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                                                    {recipe.difficulty}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(recipe.id);
                                                    }}
                                                    className={`p-1 rounded-full transition-colors ${likedRecipes.has(recipe.id)
                                                        ? 'text-red-600'
                                                        : 'text-gray-400 hover:text-red-600'
                                                        }`}
                                                >
                                                    <Heart className={`h-4 w-4 ${likedRecipes.has(recipe.id) ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipePage;