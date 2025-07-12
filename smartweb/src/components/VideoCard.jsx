import React from "react";
import { Play, Clock, User, Calendar, Heart, Eye } from "lucide-react";
import { formatDate } from "../utils/formatHelpers";

const VideoCard = React.memo(
    ({
        item,
        isPromosi = false,
        index,
        handleVideoClick = () => { },
        handleLike = () => { },
        likedItems = new Set(),
    }) => {
        return (
            <div
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col h-full"
                onClick={() => handleVideoClick(index)}
            >
                {/* Gambar */}
                <div className="relative">
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = "/api/placeholder/400/300";
                        }}
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {item.category || "Umum"}
                        </span>
                    </div>
                    {!isPromosi && item.readTime && (
                        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {item.readTime} min
                        </div>
                    )}
                </div>

                {/* Konten */}
                <div className="flex flex-col flex-grow p-5">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                    </p>

                    {/* Info toko dan tanggal */}
                    <div className="mt-auto mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700 font-medium truncate">
                                    {item.namaToko || "Toko Tidak Diketahui"}
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
                    </div>

                    {/* Bawah */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(item.id, e);
                                }}
                                className={`flex items-center space-x-1 transition-colors ${likedItems.has(item.id)
                                        ? "text-red-600"
                                        : "text-gray-500 hover:text-red-600"
                                    }`}
                            >
                                <Heart
                                    className={`h-4 w-4 ${likedItems.has(item.id) ? "fill-current" : ""
                                        }`}
                                />
                                <span className="text-sm font-medium">
                                    {item.likes || 0}
                                </span>
                            </button>
                            <div className="flex items-center space-x-1 text-gray-500">
                                <Eye className="h-4 w-4" />
                                <span className="text-sm">{item.views || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div
                                className={`h-2 w-2 rounded-full ${item.status === "Published"
                                        ? "bg-green-500"
                                        : "bg-yellow-500"
                                    }`}
                            ></div>
                            <span className="text-xs text-gray-500">
                                {item.status || "Draft"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

export default VideoCard;
