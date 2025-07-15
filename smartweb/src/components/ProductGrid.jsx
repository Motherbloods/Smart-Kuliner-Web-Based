import React from 'react';
import { ShoppingCart, Star, Edit, Trash2, Eye, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProductGrid = ({
    products,
    onProductClick,
    onEditClick,
    onDeleteClick,
    gridResponsive,
    showBuyButton = true,
    isSeller = false,
    userId
}) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isGuest = !user;

    const handleBuyClick = (productId) => {
        if (isGuest) {
            // Show login prompt for guest users
            const shouldLogin = window.confirm(
                'Anda perlu login untuk membeli produk ini. Apakah Anda ingin login sekarang?'
            );
            if (shouldLogin) {
                navigate('/login');
            }
        } else {
            const quantity = 1;

            const deepLinkUrl = `smartapp://checkout?productId=${productId}&qty=${quantity}&userId=${userId}`;

            try {
                window.location.href = deepLinkUrl;
                console.log('Opening deep link:', deepLinkUrl);
                console.log('ADB equivalent command:', `adb shell am start -a android.intent.action.VIEW -d "${deepLinkUrl}" com.example.smart`);
            } catch (error) {
                console.error('Error opening deep link:', error);
                alert("Tidak dapat membuka aplikasi. Pastikan SmartKuliner sudah terinstal di perangkat Anda.");
            }

            setTimeout(() => {
                if (document.hasFocus()) {
                    console.log('Deep link mungkin tidak berhasil membuka aplikasi');

                    const wantsDownload = window.confirm("Aplikasi SmartKuliner tidak terdeteksi. Apakah Anda ingin mengunduhnya?");
                    if (wantsDownload) {
                        window.open('https://drive.google.com/uc?export=download&id=1zcUnpuuBIbGiMmNMHySRq5Ay7p01o8PL', '_blank');
                    }
                }
            }, 1000);

        }
    };

    const handleFavoriteClick = (productId) => {
        if (isGuest) {
            const shouldLogin = window.confirm(
                'Anda perlu login untuk menambahkan ke favorit. Apakah Anda ingin login sekarang?'
            );
            if (shouldLogin) {
                navigate('/login');
            }
        } else {
            // Handle favorite for logged-in users
            console.log(`Adding to favorites: ${productId}`);
            // Add your favorite logic here
        }
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

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-2">
                    {isGuest ? 'Belum ada produk yang tersedia' : 'Belum ada produk'}
                </div>
                <div className="text-gray-400 text-sm">
                    {isGuest ? 'Silakan coba lagi nanti' : 'Tambahkan produk pertama Anda'}
                </div>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${gridResponsive}`}>
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
                >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                        <img
                            src={product.image || product.imageUrls[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Overlay Actions - Only for non-guests */}
                        {!isGuest && (
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={() => handleFavoriteClick(product.id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                    >
                                        <Heart className="h-4 w-4 text-red-500" />
                                    </button>
                                    <button
                                        onClick={() => onProductClick(product.id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
                                    >
                                        <Eye className="h-4 w-4 text-blue-500" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Guest View Badge */}
                        {isGuest && (
                            <div className="absolute top-3 left-3">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    Mode Tamu
                                </span>
                            </div>
                        )}

                        {/* Seller Actions */}
                        {isSeller && (
                            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEditClick(product.id)}
                                        className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteClick(product.id)}
                                        className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-200"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {product.name}
                            </h3>
                            {product.rating && (
                                <div className="flex items-center space-x-1 ml-2">
                                    <div className="flex">
                                        {renderStars(product.rating)}
                                    </div>
                                    <span className="text-sm text-gray-600">
                                        ({product.rating})
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                            <div className="text-2xl font-bold text-green-600">
                                {formatPrice(product.price)}
                            </div>
                            {product.stock && (
                                <div className="text-sm text-gray-500">
                                    Stok: {product.stock}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                            {showBuyButton && !isSeller && (
                                <button
                                    onClick={() => handleBuyClick(product.id)}
                                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${isGuest
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span>{isGuest ? 'Login untuk Beli' : 'Beli Sekarang'}</span>
                                </button>
                            )}
                        </div>

                        {/* Guest Notice */}
                        {isGuest && (
                            <div className="mt-3 text-center">
                                <p className="text-xs text-gray-500">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Login
                                    </button>
                                    {' '}untuk fitur lengkap
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;