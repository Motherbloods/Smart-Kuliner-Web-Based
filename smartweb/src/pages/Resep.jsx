import { useState } from 'react';
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
    List
} from 'lucide-react';

// Sample data berdasarkan struktur JSON yang diberikan
const sampleRecipes = {
    "UhHjJ0VOrrmCVFeksJ5R": {
        "rating": 5,
        "description": "Resep cemilan lezat yang mudah dibuat dengan bahan-bahan sederhana. Cocok untuk dinikmati bersama keluarga di waktu santai.",
        "title": "Cemilan Spesial Rumah",
        "isActive": true,
        "steps": [
            {
                "instruction": "Siapkan semua bahan yang diperlukan dan cuci bersih",
                "stepNumber": 1
            },
            {
                "instruction": "Campurkan bahan kering dalam mangkuk besar",
                "stepNumber": 2
            },
            {
                "instruction": "Tambahkan bahan basah sedikit demi sedikit sambil diaduk",
                "stepNumber": 3
            },
            {
                "instruction": "Bentuk adonan sesuai selera dan panggang hingga matang",
                "stepNumber": 4
            }
        ],
        "userId": "SrsoUropn8hQH7ynRzpPJGOUVFz2",
        "difficulty": "Sedang",
        "duration": 45,
        "createdAt": "2025-06-19T12:09:18.751967",
        "servings": 4,
        "reviewCount": 12,
        "imageUrl": "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
        "ingredients": [
            "2 cup tepung terigu",
            "1 cup gula pasir",
            "3 butir telur",
            "1/2 cup mentega",
            "1 tsp baking powder",
            "1/2 tsp garam",
            "1 cup susu cair"
        ],
        "viewCount": 1250,
        "category": "Cemilan",
        "updatedAt": "2025-06-19T12:09:18.752059",
        "favoriteCount": 89
    },
    "ABC123XYZ": {
        "rating": 4.5,
        "description": "Hidangan utama yang kaya rasa dan bergizi tinggi, sempurna untuk makan siang bersama keluarga.",
        "title": "Nasi Goreng Spesial",
        "isActive": true,
        "steps": [
            {
                "instruction": "Panaskan minyak dalam wajan besar",
                "stepNumber": 1
            },
            {
                "instruction": "Tumis bawang putih dan bawang merah hingga harum",
                "stepNumber": 2
            },
            {
                "instruction": "Masukkan nasi dan bumbu, aduk rata",
                "stepNumber": 3
            },
            {
                "instruction": "Tambahkan telur dan sayuran, masak hingga matang",
                "stepNumber": 4
            }
        ],
        "userId": "ABC123",
        "difficulty": "Mudah",
        "duration": 30,
        "createdAt": "2025-06-18T10:30:00.000000",
        "servings": 2,
        "reviewCount": 25,
        "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
        "ingredients": [
            "2 porsi nasi putih",
            "2 butir telur",
            "3 siung bawang putih",
            "2 butir bawang merah",
            "2 sdm kecap manis",
            "1 sdm minyak goreng",
            "Garam secukupnya",
            "Merica secukupnya"
        ],
        "viewCount": 890,
        "category": "Makanan Utama",
        "updatedAt": "2025-06-18T10:30:00.000000",
        "favoriteCount": 67
    },
    "DEF456GHI": {
        "rating": 4.8,
        "description": "Minuman segar yang menyegarkan di cuaca panas, dibuat dengan buah-buahan segar pilihan.",
        "title": "Es Buah Segar",
        "isActive": true,
        "steps": [
            {
                "instruction": "Potong semua buah menjadi potongan kecil",
                "stepNumber": 1
            },
            {
                "instruction": "Siapkan sirup dan air es dalam gelas saji",
                "stepNumber": 2
            },
            {
                "instruction": "Masukkan potongan buah ke dalam gelas",
                "stepNumber": 3
            },
            {
                "instruction": "Tambahkan es batu dan hiasan sesuai selera",
                "stepNumber": 4
            }
        ],
        "userId": "DEF456",
        "difficulty": "Mudah",
        "duration": 15,
        "createdAt": "2025-06-17T08:15:00.000000",
        "servings": 1,
        "reviewCount": 8,
        "imageUrl": "https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop",
        "ingredients": [
            "1 buah apel",
            "1 buah jeruk",
            "1/2 cup anggur",
            "2 sdm sirup",
            "Es batu secukupnya",
            "Air mineral 200ml"
        ],
        "viewCount": 445,
        "category": "Minuman",
        "updatedAt": "2025-06-17T08:15:00.000000",
        "favoriteCount": 23
    }
};

const RecipePage = () => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [favorites, setFavorites] = useState(new Set());

    const recipes = Object.entries(sampleRecipes).map(([id, recipe]) => ({
        id,
        ...recipe
    }));

    const categories = ['Semua', 'Cemilan', 'Makanan Utama', 'Minuman'];

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory && recipe.isActive;
    });

    const toggleFavorite = (recipeId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(recipeId)) {
                newFavorites.delete(recipeId);
            } else {
                newFavorites.add(recipeId);
            }
            return newFavorites;
        });
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

                            {/* Reviews Section */}
                            {/* <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                                    Ulasan ({selectedRecipe.reviewCount})
                                </h2>
                                <div className="text-center py-8 text-gray-500">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>Belum ada ulasan untuk resep ini</p>
                                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Tulis Ulasan Pertama
                                    </button>
                                </div>
                            </div> */}
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
                                onClick={() => setSelectedRecipe(recipe)}
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