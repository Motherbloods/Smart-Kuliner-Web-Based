import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Star,
    MapPin,
    Clock,
    Phone,
    MessageCircle,
    Shield,
    Award,
    Package,
    Heart,
    Share2,
    Filter,
    Grid3X3,
    List,
    Search,
    ChevronDown,
    Verified,
    Calendar,
    Users,
    TrendingUp
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import productService from '../services/ProductServices';

const StoreDetail = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    // Mock categories - replace with actual data from your API
    // const categories = ['all', 'Makanan Utama', 'Minuman', 'Snack', 'Dessert'];

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const storeData = await productService.getSellerData(storeId);
                setStore(storeData);
            } catch (error) {
                console.error('Gagal memuat data toko:', error.message);
                alert('Toko tidak ditemukan atau terjadi kesalahan.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreData();
    }, [storeId, navigate]);

    useEffect(() => {
        const fetchStoreProducts = async () => {
            try {
                setProductsLoading(true);
                // Replace with actual API call to get products by seller ID
                const storeProducts = await productService.getProductsBySeller(storeId);
                setProducts(storeProducts || []);
            } catch (error) {
                console.error('Gagal memuat produk toko:', error.message);
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        };

        if (store) {
            fetchStoreProducts();
        }
    }, [storeId, store]);

    const formatJoinedDate = (timestamp) => {
        if (!timestamp) return 'Tidak diketahui';
        const date = new Date(timestamp);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long'
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
        }

        return stars;
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'sold':
                return (b.sold || 0) - (a.sold || 0);
            case 'newest':
            default:
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat detail toko...</p>
                </div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">Toko tidak ditemukan</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900 truncate">
                                {store.nameToko}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Store Info Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    {/* Store Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    {store.profileImage ? (
                                        <img
                                            src={store.profileImage}
                                            alt={store.nameToko}
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-blue-600">
                                            {store.nameToko.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-white">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h1 className="text-2xl font-bold">{store.nameToko}</h1>
                                        {store.isVerified && (
                                            <Verified className="h-6 w-6 text-blue-200" />
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-blue-100 mb-3">
                                        <div className="flex items-center space-x-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{store.rating || 0}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Package className="h-4 w-4" />
                                            <span>{store.totalProducts || 0} Produk</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Bergabung {formatJoinedDate(store.joinedDate)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 text-blue-100">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{store.location || 'Lokasi tidak tersedia'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Store Description & Tags */}
                    <div className="px-6 py-6">
                        {store.description && (
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-900 mb-2">Deskripsi Toko</h3>
                                <p className="text-gray-700 leading-relaxed">{store.description}</p>
                            </div>
                        )}

                        {store.tags && store.tags.length > 0 && (
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Spesialisasi</h3>
                                <div className="flex flex-wrap gap-2">
                                    {store.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Products Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                Produk ({sortedProducts.length})
                            </h2>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg ${viewMode === 'grid'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <Grid3X3 className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg ${viewMode === 'list'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        {/* <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div> */}

                        {/* <div className="flex items-center space-x-4 overflow-x-auto pb-2"> */}
                        {/* Category Filter */}
                        {/* <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.slice(1).map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select> */}

                        {/* Sort Filter */}
                        {/* <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="newest">Terbaru</option>
                                    <option value="price-low">Harga Terendah</option>
                                    <option value="price-high">Harga Tertinggi</option>
                                    <option value="rating">Rating Tertinggi</option>
                                    <option value="sold">Terlaris</option>
                                </select>
                            </div> */}
                        {/* </div> */}
                    </div>

                    {/* Products Grid/List */}
                    <div className="p-6">
                        {productsLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat produk...</p>
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg mb-2">
                                    {searchTerm || selectedCategory !== 'all'
                                        ? 'Tidak ada produk yang sesuai dengan pencarian'
                                        : 'Belum ada produk di toko ini'
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'space-y-4'
                            }>
                                {sortedProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className={`bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer ${viewMode === 'list' ? 'flex' : ''
                                            }`}
                                    >
                                        <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}>
                                            <img
                                                src={product.imageUrls?.[0] || '/placeholder-food.jpg'}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-food.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="flex items-center space-x-1">
                                                    {renderStars(product.rating || 0)}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    ({product.sold || 0} terjual)
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold text-green-600">
                                                    {formatPrice(product.price)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Stok: {product.stock || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreDetail;