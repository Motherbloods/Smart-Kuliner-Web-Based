import React, { useState, useEffect } from 'react';
import { Play, Eye, Heart, Clock, User, Calendar, Tag, X, ChevronUp, ChevronDown } from 'lucide-react';

const KontenPage = () => {
    const [activeTab, setActiveTab] = useState('edukasi');
    const [edukasiData, setEdukasiData] = useState([]);
    const [promosiData, setPromosiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVideoPopup, setShowVideoPopup] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    // Mock data berdasarkan struktur yang diberikan
    const mockEdukasiData = [
        {
            id: "QVZNqagpyrclkI3mORGR",
            title: "Tes Konten Edukasi",
            description: "Tes Konten Edukasi Tes Konten Edukasi",
            category: "Makanan Utama",
            videoUrl: "https://res.cloudinary.com/de2bfha4g/video/upload/v1749726796/edukasi/videos/qLMxw971HOS5V1qdJUsmLSdQUf72/s8rrav2qyc5r5r25prsw.mp4",
            imageUrl: "https://res.cloudinary.com/de2bfha4g/image/upload/v1749726798/edukasi/thumbnails/qLMxw971HOS5V1qdJUsmLSdQUf72/dyshnbfpvii1cjrj7ekm.jpg",
            namaToko: "Rizal Toko",
            sellerId: "qLMxw971HOS5V1qdJUsmLSdQUf72",
            createdAt: "2025-06-12T18:13:18.823783",
            readTime: 1,
            likes: 2,
            views: 37,
            status: "Published"
        },
        {
            id: "uCASCsMrtI3doKfugqVD",
            title: "Tes Konten Edukasi Toko Habib",
            description: "Tes Konten Edukasi Toko Habib Risky",
            category: "Makanan Utama",
            videoUrl: "https://res.cloudinary.com/de2bfha4g/video/upload/v1750170104/edukasi/videos/SrsoUropn8hQH7ynRzpPJGOUVFz2/lc4r10rjzsg1ayouausv.mp4",
            imageUrl: "https://res.cloudinary.com/de2bfha4g/image/upload/v1750170106/edukasi/thumbnails/SrsoUropn8hQH7ynRzpPJGOUVFz2/xps9fobktykotqiqjltk.jpg",
            namaToko: "Habib Toko Rental",
            sellerId: "SrsoUropn8hQH7ynRzpPJGOUVFz2",
            createdAt: "2025-06-17T21:21:46.402880",
            readTime: 1,
            likes: 1,
            views: 14,
            status: "Published"
        }
    ];

    const mockPromosiData = [
        {
            id: "y9GabqTHu5y6HwBaakAZ",
            title: "Tes Konten Promosi Habib",
            description: "Tes Konten Promosi Habib Tko update",
            category: "Makanan Utama",
            imageUrl: "https://res.cloudinary.com/de2bfha4g/image/upload/v1750175281/konten/images/SrsoUropn8hQH7ynRzpPJGOUVFz2/sfrhdedsd2dxsqjgrmtw.jpg",
            namaToko: "Habib Toko Rental",
            sellerId: "SrsoUropn8hQH7ynRzpPJGOUVFz2",
            sellerAvatar: "",
            likes: 3,
            views: 22,
            status: "Published"
        }
    ];

    useEffect(() => {
        // Simulasi loading data
        setTimeout(() => {
            setEdukasiData(mockEdukasiData);
            setPromosiData(mockPromosiData);
            setLoading(false);
        }, 1000);
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCurrentData = () => {
        return activeTab === 'edukasi' ? edukasiData : promosiData;
    };

    const handleVideoClick = (index) => {
        setCurrentVideoIndex(index);
        setShowVideoPopup(true);
    };

    const handlePrevVideo = () => {
        const currentData = getCurrentData();
        setCurrentVideoIndex(prev =>
            prev === 0 ? currentData.length - 1 : prev - 1
        );
    };

    const handleNextVideo = () => {
        const currentData = getCurrentData();
        setCurrentVideoIndex(prev =>
            prev === currentData.length - 1 ? 0 : prev + 1
        );
    };

    const VideoPopup = () => {
        if (!showVideoPopup) return null;

        const currentData = getCurrentData();
        const currentVideo = currentData[currentVideoIndex];

        if (!currentVideo) return null;

        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-2">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                {currentVideo.category}
                            </span>
                            <span className="text-gray-600 text-sm">
                                {currentVideoIndex + 1} / {currentData.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setShowVideoPopup(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-600" />
                        </button>
                    </div>

                    {/* Video Container */}
                    <div className="relative">
                        {currentVideo.videoUrl ? (
                            <video
                                src={currentVideo.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-auto max-h-[50vh] object-contain bg-black"
                            />
                        ) : (
                            <img
                                src={currentVideo.imageUrl}
                                alt={currentVideo.title}
                                className="w-full h-auto max-h-[50vh] object-contain"
                            />
                        )}

                        {/* Navigation Arrows */}
                        {currentData.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevVideo}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                                >
                                    <ChevronUp className="h-6 w-6 text-gray-800" />
                                </button>
                                <button
                                    onClick={handleNextVideo}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg transition-all"
                                >
                                    <ChevronDown className="h-6 w-6 text-gray-800" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">
                            {currentVideo.title}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {currentVideo.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 font-medium">
                                    {currentVideo.namaToko}
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

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    <Heart className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-gray-600">{currentVideo.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Eye className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">{currentVideo.views}</span>
                                </div>
                                {currentVideo.readTime && (
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{currentVideo.readTime} min</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className={`h-2 w-2 rounded-full ${currentVideo.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                <span className="text-xs text-gray-500">{currentVideo.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const VideoCard = ({ item, isPromosi = false, index }) => (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
            onClick={() => handleVideoClick(index)}
        >
            <div className="relative">
                <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-12 w-12 text-white" />
                </div>
                <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {item.category}
                    </span>
                </div>
                {!isPromosi && item.readTime && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {item.readTime} min
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium">{item.namaToko}</span>
                    </div>
                    {item.createdAt && (
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{formatDate(item.createdAt)}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-gray-600">{item.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{item.views}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${item.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <span className="text-xs text-gray-500">{item.status}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const LoadingCard = () => (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-300"></div>
            <div className="p-6">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded mb-4 w-1/2"></div>
                <div className="flex justify-between">
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
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
                            onClick={() => setActiveTab('edukasi')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'edukasi'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            📚 Edukasi
                        </button>
                        <button
                            onClick={() => setActiveTab('promosi')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'promosi'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            🎯 Promosi
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="transition-all duration-500">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <LoadingCard key={item} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'edukasi' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Konten Edukasi
                                        </h2>
                                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                            {edukasiData.length} Video
                                        </div>
                                    </div>

                                    {edukasiData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                                <Play className="h-12 w-12 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                Belum Ada Konten Edukasi
                                            </h3>
                                            <p className="text-gray-600">
                                                Konten edukasi akan segera hadir untuk membantu Anda belajar lebih banyak tentang kuliner
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
                            )}

                            {activeTab === 'promosi' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Konten Promosi
                                        </h2>
                                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                            {promosiData.length} Promosi
                                        </div>
                                    </div>

                                    {promosiData.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                                <Tag className="h-12 w-12 text-green-600" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                Belum Ada Konten Promosi
                                            </h3>
                                            <p className="text-gray-600">
                                                Konten promosi akan segera hadir untuk menampilkan penawaran menarik dari berbagai toko
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
                        </>
                    )}
                </div>
            </div>

            {/* Video Popup */}
            <VideoPopup />
        </div>
    );
};

export default KontenPage;