import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Play, Eye, Heart, Clock, User, Calendar, Tag, X,
    ChevronLeft, ChevronRight, RefreshCw, Search, Filter,
    AlertCircle, Loader2, Plus, Edit3, Trash2,
    LogIn,
    Sparkles,
    TrendingUp,
    Star,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { MainKontenService } from "../services/Index.js"
import VideoPopup from '../components/VideoPopup.jsx';
import VideoCard from '../components/VideoCard.jsx';
import LoadingCard from '../components/shared/LoadingCard.jsx';
import ErrorDisplay from '../components/shared/ErrorDisplay.jsx';
import { categoryFilterOptions } from '../utils/categories.js';
import { useNavigate } from 'react-router-dom';

const Konten = ({ onAddEdukasi, onAddKonten, onEditKonten, onEditEdukasi, isSeller }) => {
    // State Management
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('edukasi');
    const { userData } = useAuth();
    const [edukasiData, setEdukasiData] = useState([]);
    const [promosiData, setPromosiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showVideoPopup, setShowVideoPopup] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [likedItems, setLikedItems] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: '',
        status: 'Published',
        sortBy: 'latest'
    });

    const sortOptions = [
        { value: 'latest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'most_liked', label: 'Paling Disukai' },
        { value: 'most_viewed', label: 'Paling Dilihat' }
    ];

    // Initial data loading
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load content data
                const [edukasiResult, promosiResult] = await Promise.all([
                    isSeller
                        ? MainKontenService.getEdukasiBySellerId(userData.uid)
                        : MainKontenService.getAllEdukasi(),
                    isSeller
                        ? MainKontenService.getKontenBySellerId(userData.uid)
                        : MainKontenService.getAllKonten()
                ]);

                setEdukasiData(edukasiResult || []);
                setPromosiData(promosiResult || []);

                // Load user likes jika user sudah login
                if (userData?.uid) {
                    const userLikes = await MainKontenService.getUserLikedContent(userData.uid);
                    const allLikedIds = new Set([
                        ...userLikes.edukasi,
                        ...userLikes.konten
                    ]);
                    setLikedItems(allLikedIds);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Gagal memuat data konten. Silakan coba lagi.');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [userData?.uid]);

    // Retry loading data
    const retryLoad = useCallback(() => {
        window.location.reload(); // Simple retry by reloading
    }, []);

    // Format date utility
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    }, []);

    // Get current data based on active tab
    const getCurrentData = useCallback(() => {
        return activeTab === 'edukasi' ? edukasiData : promosiData;
    }, [activeTab, edukasiData, promosiData]);

    // Filter and search data
    const filteredData = useMemo(() => {
        let data = getCurrentData();

        // Apply search filter
        if (searchQuery.trim()) {
            data = data.filter(item => {
                const searchLower = searchQuery.toLowerCase();
                return (
                    item.title?.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower) ||
                    item.namaToko?.toLowerCase().includes(searchLower) ||
                    item.category?.toLowerCase().includes(searchLower)
                );
            });
        }

        // Apply category filter
        if (filters.category) {
            data = data.filter(item => {
                const itemCategory = item.category?.toLowerCase() || '';
                const filterCategory = filters.category.toLowerCase();
                return itemCategory === filterCategory;
            });
        }

        // Apply sorting
        data = [...data].sort((a, b) => {
            switch (filters.sortBy) {
                case 'oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'most_liked':
                    return (b.likes || 0) - (a.likes || 0);
                case 'most_viewed':
                    return (b.views || 0) - (a.views || 0);
                case 'latest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            }
        });

        return data;
    }, [getCurrentData, searchQuery, filters]);

    // Handle video click
    const handleVideoClick = useCallback(async (index) => {
        const currentData = filteredData;
        const item = currentData[index];

        if (!item) return;

        try {
            const type = activeTab === 'edukasi' ? 'edukasi' : 'konten';

            // Hanya tambahkan view jika bukan seller
            if (!isSeller && userData?.uid) {
                await MainKontenService.addView(item.id, type);

                // Update view count in state
                const updateFunction = activeTab === 'edukasi' ? setEdukasiData : setPromosiData;
                updateFunction(prev => prev.map(prevItem =>
                    prevItem.id === item.id
                        ? { ...prevItem, views: (prevItem.views || 0) + 1 }
                        : prevItem
                ));
            }

            setCurrentVideoIndex(index);
            setShowVideoPopup(true);
        } catch (error) {
            console.error('Error adding view:', error);
            // Still show popup even if view count fails
            setCurrentVideoIndex(index);
            setShowVideoPopup(true);
        }

    }, [filteredData, activeTab]);

    // Handle like toggle
    const handleLike = useCallback(async (id, event) => {
        event.stopPropagation();

        // Cek apakah user sudah login
        if (!userData?.uid) {
            alert('Silakan login terlebih dahulu untuk memberikan like');
            return;
        }
        if (isSeller) return;

        try {
            const type = activeTab === 'edukasi' ? 'edukasi' : 'konten';
            const result = await MainKontenService.toggleLike(id, type, userData.uid);

            if (result.success) {
                // Update like count di state
                const updateFunction = activeTab === 'edukasi' ? setEdukasiData : setPromosiData;
                updateFunction(prev => prev.map(item =>
                    item.id === id
                        ? {
                            ...item,
                            likes: (item.likes || 0) + (result.action === 'added' ? 1 : -1)
                        }
                        : item
                ));

                // Update liked items set
                setLikedItems(prev => {
                    const newSet = new Set(prev);
                    if (result.action === 'added') {
                        newSet.add(id);
                    } else {
                        newSet.delete(id);
                    }
                    return newSet;
                });

                console.log(`Like ${result.action} successfully`);
            } else {
                console.error('Error toggling like:', result.error);
                alert('Terjadi kesalahan saat memberikan like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            alert('Terjadi kesalahan saat memberikan like');
        }
    }, [userData?.uid, activeTab]);

    // Refresh user likes
    const refreshUserLikes = useCallback(async () => {
        if (userData?.uid) {
            try {
                const userLikes = await MainKontenService.getUserLikedContent(userData.uid);
                const allLikedIds = new Set([
                    ...userLikes.edukasi,
                    ...userLikes.konten
                ]);
                setLikedItems(allLikedIds);
            } catch (error) {
                console.error('Error refreshing user likes:', error);
            }
        } else {
            setLikedItems(new Set());
        }
    }, [userData?.uid]);

    useEffect(() => {
        refreshUserLikes();
    }, [refreshUserLikes]);

    // Navigation handlers for video popup
    const handlePrevVideo = useCallback(() => {
        setCurrentVideoIndex(prev =>
            prev === 0 ? filteredData.length - 1 : prev - 1
        );
    }, [filteredData.length]);

    const handleNextVideo = useCallback(() => {
        setCurrentVideoIndex(prev =>
            prev === filteredData.length - 1 ? 0 : prev + 1
        );
    }, [filteredData.length]);

    // Filter change handler
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Handle tab change
    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        setCurrentVideoIndex(0);
        // Reset filters when changing tabs
        setFilters({
            category: '',
            status: 'Published',
            sortBy: 'latest'
        });
    }, []);

    // Reset all filters and search
    const resetFilters = useCallback(() => {
        setFilters({
            category: '',
            status: 'Published',
            sortBy: 'latest'
        });
        setSearchQuery('');
    }, []);

    // Handle edit content
    const handleEditContent = useCallback((item) => {
        console.log(activeTab)
        if (activeTab === 'edukasi') {
            // Call onAddEdukasi with item data for editing
            onEditEdukasi?.(item.id, 'edukasi');
        } else {
            // Call onAddKonten with item data for editing
            onEditKonten?.(item.id, 'konten');
        }
    }, [activeTab, onEditEdukasi, onEditKonten]);

    // Handle add new content
    const handleAddNewContent = useCallback(() => {
        if (activeTab === 'edukasi') {
            onAddEdukasi?.();
        } else {
            onAddKonten?.();
        }
    }, [activeTab, onAddEdukasi, onAddKonten]);

    // Keyboard event handler for popup
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!showVideoPopup) return;

            switch (event.key) {
                case 'Escape':
                    setShowVideoPopup(false);
                    break;
                case 'ArrowLeft':
                    handlePrevVideo();
                    break;
                case 'ArrowRight':
                    handleNextVideo();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showVideoPopup, handlePrevVideo, handleNextVideo]);

    // Empty State Component
    const EmptyState = React.memo(({ type }) => (
        <div className="text-center py-12">
            <div className={`${type === 'edukasi' ? 'bg-blue-100' : 'bg-green-100'} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4`}>
                {type === 'edukasi' ? (
                    <Play className={`h-12 w-12 ${type === 'edukasi' ? 'text-blue-600' : 'text-green-600'}`} />
                ) : (
                    <Tag className={`h-12 w-12 ${type === 'edukasi' ? 'text-blue-600' : 'text-green-600'}`} />
                )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery || filters.category ? 'Tidak Ada Hasil' : `Belum Ada Konten ${type === 'edukasi' ? 'Edukasi' : 'Promosi'}`}
            </h3>
            <p className="text-gray-600">
                {searchQuery || filters.category
                    ? `Tidak ditemukan konten yang sesuai dengan kriteria pencarian`
                    : `Konten ${type === 'edukasi' ? 'edukasi' : 'promosi'} akan segera hadir`
                }
            </p>
            {(searchQuery || filters.category) && (
                <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Reset Pencarian
                </button>
            )}
        </div>
    ));

    // Guest Welcome Banner Component
    // Guest Welcome Banner Component
    const GuestWelcomeBanner = () => (
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 rounded-2xl shadow-2xl p-8 text-center text-white mb-10 relative overflow-hidden">
            {/* Decorative glowing orb */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl animate-pulse pointer-events-none" />

            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 mb-4 text-sm font-medium tracking-wide">
                <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
                Platform Kuliner Premium
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
                Selamat Datang di{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400">
                    SmartKuliner
                </span>
            </h1>

            {/* Subtext */}
            <p className="text-blue-100 text-base md:text-lg max-w-xl mx-auto mb-6">
                Eksplorasi konten edukasi dan penawaran menarik tanpa perlu login.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-blue-800 px-6 py-2.5 rounded-xl font-semibold shadow hover:bg-blue-50 transition"
                >
                    <LogIn className="inline w-4 h-4 mr-2" />
                    Masuk
                </button>
                <button
                    onClick={() => navigate('/register')}
                    className="border border-white/40 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition"
                >
                    <UserPlus className="inline w-4 h-4 mr-2" />
                    Daftar
                </button>
            </div>

            {/* Guest mode badge */}
            <div className="mt-5 text-xs text-blue-200">
                <div className="inline-flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping mr-2"></div>
                    Mode Tamu Aktif – Akses terbatas
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Regular Header for logged in users */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        {userData?.uid ? (
                            <>
                                Konten <span className="text-blue-600">SmartKuliner</span>
                            </>
                        ) : (
                            <>
                                Selamat Datang di <span className="text-blue-600">SmartKuliner</span>
                            </>
                        )}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {userData?.uid
                            ? 'Jelajahi konten edukasi dan promosi dari berbagai toko kuliner'
                            : 'Nikmati berbagai informasi kuliner menarik tanpa perlu login'}
                    </p>
                </div>


                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full shadow-xl border border-white/30 overflow-hidden">
                        <button
                            onClick={() => handleTabChange('edukasi')}
                            className={`px-6 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'edukasi'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-blue-50'
                                }`}
                        >
                            <Play className="h-4 w-4" />
                            <span>Edukasi</span>
                        </button>
                        <button
                            onClick={() => handleTabChange('promosi')}
                            className={`px-6 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeTab === 'promosi'
                                ? 'bg-green-600 text-white'
                                : 'text-gray-700 hover:bg-green-50'
                                }`}
                        >
                            <Tag className="h-4 w-4" />
                            <span>Promosi</span>
                        </button>
                    </div>
                </div>

                {/* Add Content Button - Using props */}
                {userData?.seller && (
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={handleAddNewContent}
                            className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg transform hover:scale-105 ${activeTab === 'edukasi'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                                }`}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tambah {activeTab === 'edukasi' ? 'Edukasi' : 'Promosi'}
                        </button>
                    </div>
                )}

                {/* Search and Filter Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari konten kuliner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 text-gray-800 placeholder-gray-500"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-6 py-4 rounded-xl transition-all duration-300 font-medium ${showFilters
                                ? 'bg-blue-100 text-blue-700 shadow-lg'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            <Filter className="h-5 w-5" />
                            <span>Filter</span>
                        </button>

                        {/* Active filters indicator */}
                        {(searchQuery || filters.category) && (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border border-blue-200">
                                <span>Filter aktif</span>
                                <button
                                    onClick={resetFilters}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                                    >
                                        {categoryFilterOptions.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Urutkan
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={resetFilters}
                                        className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-300 font-medium shadow-lg transform hover:scale-105"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="transition-all duration-500">
                    {error ? (
                        <ErrorDisplay error={error} retryLoad={retryLoad} />
                    ) : loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <LoadingCard key={index} />
                            ))}
                        </div>
                    ) : (
                        <div>
                            {/* Content Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {activeTab === 'edukasi' ? 'Konten Edukasi' : 'Konten Promosi'}
                                </h2>
                                <div className={`${activeTab === 'edukasi' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} px-4 py-2 rounded-full text-sm font-semibold`}>
                                    {filteredData.length} {activeTab === 'edukasi' ? 'Video' : 'Promosi'}
                                </div>
                            </div>

                            {/* Content Grid */}
                            {filteredData.length === 0 ? (
                                <EmptyState type={activeTab} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                    {filteredData.map((item, index) => (
                                        <div key={item.id} className="relative group h-full">
                                            <VideoCard
                                                item={item}
                                                index={index}
                                                isPromosi={activeTab === 'promosi'}
                                                handleVideoClick={handleVideoClick}
                                                handleLike={handleLike}
                                                likedItems={likedItems}
                                            />

                                            {/* Edit Button - Only show for user's own content */}
                                            {userData?.seller && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditContent(item)}
                                                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                                                        title="Edit konten"
                                                    >
                                                        <Edit3 className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Popup */}
            {showVideoPopup && (
                <VideoPopup
                    showVideoPopup={showVideoPopup}
                    filteredData={filteredData}
                    currentVideoIndex={currentVideoIndex}
                    likedItems={likedItems}
                    handleLike={handleLike}
                    setShowVideoPopup={setShowVideoPopup}
                    handlePrevVideo={handlePrevVideo}
                    handleNextVideo={handleNextVideo}
                    formatDate={formatDate}
                />
            )}
        </div>
    );
};

export default Konten;