import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Filter, Star, ShoppingCart, ArrowLeft, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import productService from '../services/ProductServices';

const ProductSearchPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    // Initialize search query from URL parameter
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [sortBy, setSortBy] = useState('rating');
    const [showFilters, setShowFilters] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        location: true,
        price: true,
        rating: true
    });
    useEffect(() => {
        productService.getAllProducts().then(setProducts).catch(console.error);
    }, []);

    // Update search query when URL parameter changes
    useEffect(() => {
        const queryFromUrl = searchParams.get('q') || '';
        setSearchInput(queryFromUrl);
        setSearchQuery(queryFromUrl);
    }, [searchParams]);

    // Update URL when search query changes
    useEffect(() => {
        if (searchQuery) {
            setSearchParams({ q: searchQuery });
        } else {
            setSearchParams({});
        }
    }, [searchQuery, setSearchParams]);

    // Get unique categories and locations
    const categories = [...new Set(products.map(p => p.category))];

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.tags?.some(tag =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            const matchesRating = selectedRating === 0 || product.rating >= selectedRating;

            return matchesSearch && matchesCategory && matchesPrice && matchesRating;
        });

        // Sort products
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price_low':
                    return a.price - b.price;
                case 'price_high':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'reviews':
                    return b.reviews - a.reviews;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [searchQuery, selectedCategory, priceRange, selectedRating, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = searchInput.trim();
        setSearchQuery(trimmed);
        if (trimmed) {
            setSearchParams({ q: trimmed });
        } else {
            setSearchParams({});
        }
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setSearchParams({});
    };


    const clearAllFilters = () => {
        setSelectedCategory('');
        setPriceRange([0, 100000]);
        setSelectedRating(0);
        setSortBy('rating');
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleProductClick = (productId) => {
        // Navigate to product detail page
        console.log(`Navigate to product detail: ${productId}`);
        alert(`Navigating to product detail page for product ID: ${productId}`);
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header with Search */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBackClick}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800">Cari Produk</h1>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(e);
                                            }
                                        }}
                                        placeholder="Cari makanan, restoran, atau lokasi..."
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-4 w-4 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    {showFilters && (
                        <div className="w-80 flex-shrink-0 sticky top-24 self-start h-fit">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-800">Filter Produk</h3>
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {/* Category Filter */}
                                    <div className="p-6">
                                        <button
                                            onClick={() => toggleSection('category')}
                                            className="flex items-center justify-between w-full text-left"
                                        >
                                            <h4 className="font-medium text-gray-800">Kategori</h4>
                                            {expandedSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        {expandedSections.category && (
                                            <div className="mt-4 space-y-3">
                                                {categories.map(category => (
                                                    <label key={category} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            value={category}
                                                            checked={selectedCategory === category}
                                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-3 text-sm text-gray-700">{category}</span>
                                                    </label>
                                                ))}
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        value=""
                                                        checked={selectedCategory === ''}
                                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700">Semua Kategori</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price Range Filter */}
                                    <div className="p-6">
                                        <button
                                            onClick={() => toggleSection('price')}
                                            className="flex items-center justify-between w-full text-left"
                                        >
                                            <h4 className="font-medium text-gray-800">Rentang Harga</h4>
                                            {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        {expandedSections.price && (
                                            <div className="mt-4 space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={priceRange[0]}
                                                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Min"
                                                    />
                                                    <span className="text-gray-500">-</span>
                                                    <input
                                                        type="number"
                                                        value={priceRange[1]}
                                                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        placeholder="Max"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rating Filter */}
                                    <div className="p-6">
                                        <button
                                            onClick={() => toggleSection('rating')}
                                            className="flex items-center justify-between w-full text-left"
                                        >
                                            <h4 className="font-medium text-gray-800">Rating Minimum</h4>
                                            {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                        {expandedSections.rating && (
                                            <div className="mt-4 space-y-3">
                                                {[4.5, 4.0, 3.5, 3.0, 0].map(rating => (
                                                    <label key={rating} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="rating"
                                                            value={rating}
                                                            checked={selectedRating === rating}
                                                            onChange={(e) => setSelectedRating(parseFloat(e.target.value))}
                                                            className="text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="ml-3 flex items-center text-sm text-gray-700">
                                                            {rating === 0 ? 'Semua Rating' : (
                                                                <>
                                                                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                                                                    {rating}+ ke atas
                                                                </>
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Sort and Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-gray-600">
                                {filteredProducts.length} produk ditemukan
                                {searchQuery && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        untuk "{searchQuery}"
                                    </span>
                                )}
                            </div>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="rating">Rating Tertinggi</option>
                                <option value="price_low">Harga Terendah</option>
                                <option value="price_high">Harga Tertinggi</option>
                                <option value="reviews">Ulasan Terbanyak</option>
                            </select>
                        </div>

                        {/* Product Grid */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${showFilters ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
                                >
                                    {/* Product Image */}
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={product.imageUrls?.[0]}
                                            alt={product.name}
                                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-lg">
                                                {product.category}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center mb-2">
                                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                            <span className="ml-1 text-sm font-medium text-gray-700">
                                                {product.rating || '4.5'}
                                            </span>
                                            <span className="text-gray-400 text-sm ml-2">
                                                (125 ulasan)
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
                                            {product.name}
                                        </h3>

                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {product.description}
                                        </p>

                                        <div className="flex items-center justify-between mb-4 mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-bold text-gray-800">
                                                    Rp {product.price.toLocaleString("id-ID")}
                                                </span>
                                                <span className="text-sm text-gray-500 line-through">
                                                    Rp {(product.price * 1.2).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        </div>

                                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group">
                                            <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            <span>Beli Sekarang</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Search className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    Tidak ada produk ditemukan
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Coba ubah kata kunci pencarian atau filter yang dipilih
                                </p>
                                <button
                                    onClick={() => {
                                        clearSearch();
                                        clearAllFilters();
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Reset Semua Filter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductSearchPage;