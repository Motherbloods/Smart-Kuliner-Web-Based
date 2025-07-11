import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Play, Eye, Heart, Clock, User, Calendar, Tag, X,
    ChevronLeft, ChevronRight, RefreshCw, Search, Filter,
    AlertCircle, Loader2
} from 'lucide-react';
import KontenService from '../services/KontenService';
import { useAuth } from '../hooks/useAuth';

const KontenPage = () => {
    // State Management
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

    // Available categories and sort options
    const categories = [
        { value: '', label: 'Semua Kategori' },
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'resep', label: 'Resep' },
        { value: 'tips', label: 'Tips & Trik' },
        { value: 'review', label: 'Review' },
        { value: 'promo', label: 'Promosi' }
    ];

    const sortOptions = [
        { value: 'latest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'most_liked', label: 'Paling Disukai' },
        { value: 'most_viewed', label: 'Paling Dilihat' }
    ];
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Load content data
                const [edukasiResult, promosiResult] = await Promise.all([
                    KontenService.getAllEdukasi(),
                    KontenService.getAllKonten()
                ]);

                setEdukasiData(edukasiResult);
                setPromosiData(promosiResult);

                // Load user likes jika user sudah login
                if (userData.uid) {
                    const userLikes = await KontenService.getUserLikedContent(userData.uid);
                    const allLikedIds = new Set([
                        ...userLikes.edukasi,
                        ...userLikes.konten
                    ]);
                    setLikedItems(allLikedIds);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userData?.uid]);


    // Load data when component mounts or filters change
    useEffect(() => {
        loadData();
    }, [filters]);

    // Load data from service
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { edukasi, konten } = await KontenService.getAllContent({
                ...filters,
                limit: 50 // Limit untuk performa
            });

            setEdukasiData(edukasi || []);
            setPromosiData(konten || []);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Gagal memuat data konten. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Retry loading data
    const retryLoad = useCallback(() => {
        loadData();
    }, [loadData]);

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
            console.log(error);
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
            data = data.filter(item =>
                item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.namaToko?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply sorting
        data.sort((a, b) => {
            switch (filters.sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'most_liked':
                    return (b.likes || 0) - (a.likes || 0);
                case 'most_viewed':
                    return (b.views || 0) - (a.views || 0);
                case 'latest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return data;
    }, [getCurrentData, searchQuery, filters.sortBy]);

    // Handle video click
    const handleVideoClick = useCallback(async (index) => {
        const currentData = filteredData;
        const item = currentData[index];

        if (!item) return;

        try {
            // Add view count
            const type = activeTab === 'edukasi' ? 'edukasi' : 'konten';
            await KontenService.addView(item.id, type);

            // Update view count in state
            const updateFunction = activeTab === 'edukasi' ? setEdukasiData : setPromosiData;
            updateFunction(prev => prev.map(prevItem =>
                prevItem.id === item.id
                    ? { ...prevItem, views: (prevItem.views || 0) + 1 }
                    : prevItem
            ));

            setCurrentVideoIndex(index);
            setShowVideoPopup(true);
        } catch (error) {
            console.error('Error adding view:', error);
        }
    }, [filteredData, activeTab]);

    // Handle like toggle
    const handleLike = useCallback(async (id, event) => {
        event.stopPropagation();

        // Cek apakah user sudah login
        if (!userData.uid) {
            alert('Silakan login terlebih dahulu untuk memberikan like');
            return;
        }

        try {
            const type = activeTab === 'edukasi' ? 'edukasi' : 'konten';
            const result = await KontenService.toggleLike(id, type, userData.uid);

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
    }, [userData.uid, activeTab]);

    const refreshUserLikes = useCallback(async () => {
        if (userData.uid) {
            try {
                const userLikes = await KontenService.getUserLikedContent(userData.uid);
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
    }, [userData.uid]);

    useEffect(() => {
        refreshUserLikes();
    }, [refreshUserLikes]);

    // const isItemLiked = useCallback((id) => {
    //     return likedItems.has(id);
    // }, [likedItems]);

    // const loadUserLikedContent = useCallback(async () => {
    //     if (!userData.uid) return { edukasi: [], konten: [] };

    //     try {
    //         const userLikes = await KontenService.getUserLikedContent(userData.uid);

    //         // Ambil detail konten yang di-like
    //         const likedEdukasiPromises = userLikes.edukasi.map(id =>
    //             KontenService.getEdukasiById(id).catch(() => null)
    //         );
    //         const likedKontenPromises = userLikes.konten.map(id =>
    //             KontenService.getKontenById(id).catch(() => null)
    //         );

    //         const [likedEdukasiDetails, likedKontenDetails] = await Promise.all([
    //             Promise.all(likedEdukasiPromises),
    //             Promise.all(likedKontenPromises)
    //         ]);

    //         return {
    //             edukasi: likedEdukasiDetails.filter(Boolean),
    //             konten: likedKontenDetails.filter(Boolean)
    //         };
    //     } catch (error) {
    //         console.error('Error loading user liked content:', error);
    //         return { edukasi: [], konten: [] };
    //     }
    // }, [userData.uid]);


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
    }, []);

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

    // Video Popup Component
    const VideoPopup = React.memo(() => {
        if (!showVideoPopup) return null;

        const currentVideo = filteredData[currentVideoIndex];
        if (!currentVideo) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-2xl">
                        <div className="flex items-center space-x-3">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {currentVideo.category || 'Umum'}
                            </span>
                            <span className="text-gray-600 text-sm">
                                {currentVideoIndex + 1} / {filteredData.length}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleLike(currentVideo.id, { stopPropagation: () => { } })}
                                className={`p-2 rounded-full transition-colors ${likedItems.has(currentVideo.id)
                                    ? 'bg-red-100 text-red-600'
                                    : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${likedItems.has(currentVideo.id) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => setShowVideoPopup(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Media Container */}
                    <div className="relative bg-black">
                        {currentVideo.videoUrl ? (
                            <video
                                src={currentVideo.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-auto max-h-[50vh] object-contain"
                                onError={(e) => console.error('Video error:', e)}
                            />
                        ) : (
                            <img
                                src={currentVideo.imageUrl}
                                alt={currentVideo.title}
                                className="w-full h-auto max-h-[50vh] object-contain"
                                onError={(e) => {
                                    e.target.src = '/api/placeholder/800/450';
                                }}
                            />
                        )}

                        {/* Navigation Arrows */}
                        {filteredData.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevVideo}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all"
                                >
                                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                                </button>
                                <button
                                    onClick={handleNextVideo}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all"
                                >
                                    <ChevronRight className="h-6 w-6 text-gray-800" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            {currentVideo.title}
                        </h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            {currentVideo.description}
                        </p>

                        {/* Metadata */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 font-medium">
                                    {currentVideo.namaToko || 'Toko Tidak Diketahui'}
                                </span>
                            </div>
                            {currentVideo.createdAt && (
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                        {formatDate(currentVideo.createdAt)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <span className="text-sm text-gray-600 font-medium">
                                        {currentVideo.likes || 0}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm text-gray-600 font-medium">
                                        {currentVideo.views || 0}
                                    </span>
                                </div>
                                {currentVideo.readTime && (
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm text-gray-600 font-medium">
                                            {currentVideo.readTime} min
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${currentVideo.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-xs text-gray-500 font-medium">
                                    {currentVideo.status || 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    });

    // Video Card Component
    const VideoCard = React.memo(({ item, isPromosi = false, index }) => (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
            onClick={() => handleVideoClick(index)}
        >
            <div className="relative">
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                    }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                        <Play className="h-8 w-8 text-white" />
                    </div>
                </div>
                <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {item.category || 'Umum'}
                    </span>
                </div>
                {!isPromosi && item.readTime && (
                    <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {item.readTime} min
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium truncate">
                            {item.namaToko || 'Toko Tidak Diketahui'}
                        </span>
                    </div>
                    {item.createdAt && (
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={(e) => handleLike(item.id, e)}
                            className={`flex items-center space-x-1 transition-colors ${likedItems.has(item.id) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                }`}
                        >
                            <Heart className={`h-4 w-4 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
                            <span className="text-sm font-medium">{item.likes || 0}</span>
                        </button>
                        <div className="flex items-center space-x-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{item.views || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${item.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                        <span className="text-xs text-gray-500">
                            {item.status || 'Draft'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    ));

    // Loading Card Component
    const LoadingCard = React.memo(() => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-5">
                <div className="h-5 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4 w-1/2"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    ));

    // Error Display Component
    const ErrorDisplay = React.memo(() => (
        <div className="text-center py-12">
            <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
                onClick={retryLoad}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
                <RefreshCw className="h-5 w-5" />
                <span>Coba Lagi</span>
            </button>
        </div>
    ));

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
                {searchQuery ? 'Tidak Ada Hasil' : `Belum Ada Konten ${type === 'edukasi' ? 'Edukasi' : 'Promosi'}`}
            </h3>
            <p className="text-gray-600">
                {searchQuery
                    ? `Tidak ditemukan konten yang sesuai dengan pencarian "${searchQuery}"`
                    : `Konten ${type === 'edukasi' ? 'edukasi' : 'promosi'} akan segera hadir`
                }
            </p>
        </div>
    ));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Konten <span className="text-blue-600">SmartKuliner</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Jelajahi konten edukasi dan promosi dari berbagai toko kuliner
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-xl p-2 shadow-lg">
                        <button
                            onClick={() => handleTabChange('edukasi')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'edukasi'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            📚 Edukasi
                        </button>
                        <button
                            onClick={() => handleTabChange('promosi')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'promosi'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            🎯 Promosi
                        </button>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari konten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                            <span>Filter</span>
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Urutkan
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        onClick={() => {
                                            setFilters({ category: '', status: 'Published', sortBy: 'latest' });
                                            setSearchQuery('');
                                        }}
                                        className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
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
                        <ErrorDisplay />
                    ) : loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <LoadingCard key={index} />
                            ))}
                        </div>
                    ) : activeTab === 'edukasi' ? (
                        <div>
                            {/* Content Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Konten Edukasi</h2>
                                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                    {edukasiData.length} Video
                                </div>
                            </div>

                            {/* Content Grid */}
                            {edukasiData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                        <Play className="h-12 w-12 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Belum Ada Konten Edukasi
                                    </h3>
                                    <p className="text-gray-600">
                                        Konten edukasi akan segera hadir untuk membantu Anda belajar lebih banyak tentang kuliner.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {edukasiData.map((item, index) => (
                                        <VideoCard key={item.id} item={item} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* Content Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Konten Promosi</h2>
                                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                    {promosiData.length} Promosi
                                </div>
                            </div>

                            {/* Content Grid */}
                            {promosiData.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                        <Tag className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        Belum Ada Konten Promosi
                                    </h3>
                                    <p className="text-gray-600">
                                        Konten promosi akan segera hadir untuk menampilkan penawaran menarik dari berbagai toko.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {promosiData.map((item, index) => (
                                        <VideoCard key={item.id} item={item} isPromosi={true} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <VideoPopup />
        </div >
    );
};

export default KontenPage;