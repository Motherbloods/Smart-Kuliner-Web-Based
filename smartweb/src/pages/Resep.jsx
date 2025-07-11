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
    Loader2
} from 'lucide-react';

// Mock Firebase services untuk demonstrasi
const mockFirebaseServices = {
    getAllRecipes: async () => {
        // Simulasi delay loading
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            data: [
                {
                    id: '1',
                    title: 'Nasi Goreng Spesial',
                    description: 'Nasi goreng dengan bumbu rahasia dan topping lengkap yang menggugah selera',
                    category: 'Makanan Utama',
                    difficulty: 'Sedang',
                    duration: 30,
                    servings: 4,
                    rating: 4.5,
                    viewCount: 1250,
                    favoriteCount: 89,
                    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                    createdAt: '2024-01-15T10:30:00Z',
                    isActive: true,
                    ingredients: [
                        '3 piring nasi putih',
                        '2 butir telur',
                        '100g ayam fillet, potong dadu',
                        '3 siung bawang putih, cincang',
                        '2 siung bawang merah, iris tipis',
                        '2 sdm kecap manis',
                        '1 sdm kecap asin',
                        '1 sdt garam',
                        '1/2 sdt merica bubuk',
                        '2 sdm minyak goreng'
                    ],
                    steps: [
                        {
                            stepNumber: 1,
                            instruction: 'Panaskan minyak dalam wajan dengan api sedang. Tumis bawang putih dan bawang merah hingga harum dan kecokelatan.'
                        },
                        {
                            stepNumber: 2,
                            instruction: 'Masukkan ayam fillet yang sudah dipotong dadu. Masak hingga ayam berubah warna dan matang sempurna.'
                        },
                        {
                            stepNumber: 3,
                            instruction: 'Kocok telur dalam mangkuk terpisah. Buat scrambled egg di sisi wajan, lalu campur dengan tumisan ayam.'
                        },
                        {
                            stepNumber: 4,
                            instruction: 'Masukkan nasi putih yang sudah dingin. Aduk rata dengan spatula hingga tercampur sempurna dengan bumbu.'
                        },
                        {
                            stepNumber: 5,
                            instruction: 'Tambahkan kecap manis, kecap asin, garam, dan merica. Aduk rata dan masak selama 3-5 menit.'
                        },
                        {
                            stepNumber: 6,
                            instruction: 'Koreksi rasa sesuai selera. Angkat dan sajikan selagi hangat dengan pelengkap seperti kerupuk dan acar.'
                        }
                    ]
                },
                {
                    id: '2',
                    title: 'Es Teh Manis Segar',
                    description: 'Minuman segar yang sempurna untuk cuaca panas, dengan rasa teh yang pas dan manis yang tepat',
                    category: 'Minuman',
                    difficulty: 'Mudah',
                    duration: 10,
                    servings: 2,
                    rating: 4.2,
                    viewCount: 856,
                    favoriteCount: 45,
                    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                    createdAt: '2024-01-10T14:20:00Z',
                    isActive: true,
                    ingredients: [
                        '2 kantong teh celup',
                        '400ml air panas',
                        '3 sdm gula pasir',
                        'Es batu secukupnya',
                        'Daun mint untuk garnish (opsional)'
                    ],
                    steps: [
                        {
                            stepNumber: 1,
                            instruction: 'Seduh teh celup dengan air panas selama 3-5 menit hingga warna teh keluar sempurna.'
                        },
                        {
                            stepNumber: 2,
                            instruction: 'Tambahkan gula pasir ke dalam teh panas, aduk hingga gula larut sempurna.'
                        },
                        {
                            stepNumber: 3,
                            instruction: 'Biarkan teh dingin hingga mencapai suhu ruangan, atau masukkan ke kulkas sebentar.'
                        },
                        {
                            stepNumber: 4,
                            instruction: 'Siapkan gelas saji, masukkan es batu secukupnya ke dalam gelas.'
                        },
                        {
                            stepNumber: 5,
                            instruction: 'Tuang teh manis ke dalam gelas berisi es batu. Tambahkan daun mint sebagai garnish jika diinginkan.'
                        }
                    ]
                },
                {
                    id: '3',
                    title: 'Kue Brownies Coklat',
                    description: 'Brownies coklat yang lembut dan legit dengan tekstur yang sempurna untuk dessert',
                    category: 'Cemilan',
                    difficulty: 'Sulit',
                    duration: 60,
                    servings: 8,
                    rating: 4.8,
                    viewCount: 2150,
                    favoriteCount: 156,
                    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                    createdAt: '2024-01-05T09:15:00Z',
                    isActive: true,
                    ingredients: [
                        '200g dark chocolate, cincang',
                        '100g butter',
                        '150g gula pasir',
                        '3 butir telur',
                        '100g tepung terigu',
                        '30g coklat bubuk',
                        '1/2 sdt vanilla extract',
                        '1/4 sdt garam',
                        '100g kacang walnut, cincang (opsional)'
                    ],
                    steps: [
                        {
                            stepNumber: 1,
                            instruction: 'Panaskan oven hingga 180°C. Olesi loyang 20x20 cm dengan butter dan taburi tepung.'
                        },
                        {
                            stepNumber: 2,
                            instruction: 'Lelehkan dark chocolate dan butter dengan double boiler hingga meleleh sempurna, aduk rata.'
                        },
                        {
                            stepNumber: 3,
                            instruction: 'Dalam mangkuk terpisah, kocok telur dan gula hingga mengembang dan berwarna pucat.'
                        },
                        {
                            stepNumber: 4,
                            instruction: 'Masukkan campuran coklat leleh ke dalam kocokan telur, aduk rata dengan spatula.'
                        },
                        {
                            stepNumber: 5,
                            instruction: 'Ayak tepung terigu dan coklat bubuk, masukkan ke dalam adonan bersama garam dan vanilla extract.'
                        },
                        {
                            stepNumber: 6,
                            instruction: 'Aduk adonan hingga rata, jangan overmix. Tambahkan kacang walnut jika digunakan.'
                        },
                        {
                            stepNumber: 7,
                            instruction: 'Tuang adonan ke loyang, ratakan permukaan. Panggang selama 25-30 menit hingga permukaan set.'
                        },
                        {
                            stepNumber: 8,
                            instruction: 'Dinginkan brownies sepenuhnya sebelum dipotong. Potong sesuai selera dan sajikan.'
                        }
                    ]
                }
            ]
        };
    },

    toggleFavoriteRecipe: async (recipeId, isAddingFavorite) => {
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            success: true,
            data: { recipeId, isAddingFavorite }
        };
    },

    incrementViewCount: async (recipeId) => {
        // Simulasi API call
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            success: true,
            data: { recipeId }
        };
    }
};

const RecipePage = () => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [favorites, setFavorites] = useState(new Set());
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categories = ['Semua', 'Cemilan', 'Makanan Utama', 'Minuman'];

    // Load recipes from Firebase
    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await mockFirebaseServices.getAllRecipes();

            if (result.success) {
                setRecipes(result.data);
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
        const isCurrentlyFavorite = favorites.has(recipeId);
        const isAddingFavorite = !isCurrentlyFavorite;

        try {
            // Update local state optimistically
            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (isCurrentlyFavorite) {
                    newFavorites.delete(recipeId);
                } else {
                    newFavorites.add(recipeId);
                }
                return newFavorites;
            });

            // Update favorite count in Firebase
            const result = await mockFirebaseServices.toggleFavoriteRecipe(recipeId, isAddingFavorite);

            if (result.success) {
                // Update local recipe data
                setRecipes(prev => prev.map(recipe =>
                    recipe.id === recipeId
                        ? { ...recipe, favoriteCount: recipe.favoriteCount + (isAddingFavorite ? 1 : -1) }
                        : recipe
                ));

                // Update selected recipe if it's currently viewed
                if (selectedRecipe && selectedRecipe.id === recipeId) {
                    setSelectedRecipe(prev => ({
                        ...prev,
                        favoriteCount: prev.favoriteCount + (isAddingFavorite ? 1 : -1)
                    }));
                }
            } else {
                // Revert local state if Firebase update failed
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    if (isAddingFavorite) {
                        newFavorites.delete(recipeId);
                    } else {
                        newFavorites.add(recipeId);
                    }
                    return newFavorites;
                });
                setError(result.error || 'Gagal memperbarui favorit');
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            setError('Terjadi kesalahan saat memperbarui favorit');

            // Revert local state
            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (isAddingFavorite) {
                    newFavorites.delete(recipeId);
                } else {
                    newFavorites.add(recipeId);
                }
                return newFavorites;
            });
        }
    };

    const handleRecipeClick = async (recipe) => {
        setSelectedRecipe(recipe);

        // Increment view count
        try {
            const result = await mockFirebaseServices.incrementViewCount(recipe.id);
            if (result.success) {
                // Update local recipe data
                setRecipes(prev => prev.map(r =>
                    r.id === recipe.id
                        ? { ...r, viewCount: r.viewCount + 1 }
                        : r
                ));
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
                        onClick={loadRecipes}
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
                                <button
                                    onClick={() => toggleFavorite(selectedRecipe.id)}
                                    className={`p-2 rounded-full transition-colors ${favorites.has(selectedRecipe.id)
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Heart className={`h-5 w-5 ${favorites.has(selectedRecipe.id) ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Bookmark className="h-5 w-5" />
                                </button>
                                <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                    <Share2 className="h-5 w-5" />
                                </button>
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
                                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600">{selectedRecipe.rating}</span>
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
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(recipe.id);
                                                }}
                                                className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${favorites.has(recipe.id)
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-white/80 text-gray-600 hover:bg-white'
                                                    }`}
                                            >
                                                <Heart className={`h-4 w-4 ${favorites.has(recipe.id) ? 'fill-current' : ''}`} />
                                            </button>
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
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span>{recipe.rating}</span>
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
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span>{recipe.rating}</span>
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
                                                    className={`p-1 rounded-full transition-colors ${favorites.has(recipe.id)
                                                        ? 'text-red-600'
                                                        : 'text-gray-400 hover:text-red-600'
                                                        }`}
                                                >
                                                    <Heart className={`h-4 w-4 ${favorites.has(recipe.id) ? 'fill-current' : ''}`} />
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