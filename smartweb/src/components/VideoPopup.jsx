import React from "react";
import { Heart, X, ChevronLeft, ChevronRight, User, Calendar, Eye, Clock } from "lucide-react";

const VideoPopup = React.memo(({
    showVideoPopup,
    filteredData,
    currentVideoIndex,
    likedItems,
    handleLike,
    setShowVideoPopup,
    handlePrevVideo,
    handleNextVideo,
    formatDate
}) => {
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

                {/* Media */}
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
                            <div className={`h-2 w-2 rounded-full ${currentVideo.status === 'Published' ? 'bg-green-500' : 'bg-yellow-500'}`} />
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

export default VideoPopup;
