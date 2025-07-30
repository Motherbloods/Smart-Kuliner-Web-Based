import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Star,
    Minus,
    Plus,
    MessageCircle,
    MapPin,
    Clock,
    Shield,
    Truck
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import productService from '../services/ProductServices';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user, userData } = useAuth();
    const isGuest = !user;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const fetchedProduct = await productService.getProductById(productId);

                // Check if sellerId exists
                if (!fetchedProduct.sellerId) {
                    throw new Error('Produk tidak memiliki sellerId');
                }

                const sellerData = await productService.getSellerData(fetchedProduct.sellerId);
                const reviews = await productService.getProductReviews(productId);
                // Combine seller data into product
                const fullProduct = {
                    ...fetchedProduct,
                    seller: sellerData,
                    reviewCount: Array.isArray(reviews) ? reviews.length : 0

                };

                setProduct(fullProduct);
                setReviews(reviews)
            } catch (error) {
                console.error('Gagal memuat detail produk:', error.message);
                alert('Produk tidak ditemukan atau terjadi kesalahan.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

    const handleBuyClick = () => {
        if (isGuest) {
            const shouldLogin = window.confirm(
                'Anda perlu login untuk membeli produk ini. Apakah Anda ingin login sekarang?'
            );
            if (shouldLogin) {
                navigate('/login');
            }
        } else {
            const deepLinkUrl = `smartapp://checkout?productId=${productId}&qty=${quantity}&userId=${userData?.uid}`;

            try {
                window.location.href = deepLinkUrl;
                console.log('Opening deep link:', deepLinkUrl);
            } catch (error) {
                console.error('Error opening deep link:', error);
                alert("Tidak dapat membuka aplikasi. Pastikan SmartKuliner sudah terinstal di perangkat Anda.");
            }

            setTimeout(() => {
                if (document.hasFocus()) {
                    const wantsDownload = window.confirm("Aplikasi SmartKuliner tidak terdeteksi. Apakah Anda ingin mengunduhnya?");
                    if (wantsDownload) {
                        window.open('https://drive.google.com/uc?export=download&id=1zcUnpuuBIbGiMmNMHySRq5Ay7p01o8PL', '_blank');
                    }
                }
            }, 1000);
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat detail produk...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg mb-2">Produk tidak ditemukan</div>
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

    // Ensure imageUrls is an array and has at least one item
    const images = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
        ? product.imageUrls
        : ['/placeholder-food.jpg']; // fallback image

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
                                Detail Produk
                            </h1>
                        </div>

                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
                            <img
                                src={images[selectedImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = '/placeholder-food.jpg';
                                }}
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto pb-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                                            ? 'border-blue-500'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-food.jpg';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center space-x-1">
                                    <div className="flex">
                                        {renderStars(product.rating || 0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {product.rating || 0}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({product.reviewCount || 0} ulasan)
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Stok: {product.stock || 0}
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl font-bold text-green-600">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Seller Info */}
                        {product.seller && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-semibold">
                                                {product.seller.nameToko ? product.seller.nameToko.charAt(0) : 'T'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 mb-1">
                                                {product.seller.nameToko || 'Nama Toko'}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span>{product.seller.rating || 0}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate max-w-32">
                                                        {product.seller.location || 'Lokasi tidak tersedia'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/store/${product.seller.id || product.sellerId}`)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Lihat Toko
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900">Jumlah</h3>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 border-x border-gray-300 font-semibold min-w-[50px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= (product.stock || 0)}
                                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total: <span className="font-semibold text-green-600">
                                        {formatPrice((product.price || 0) * quantity)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleBuyClick}
                                disabled={(product.stock || 0) === 0}
                                className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${(product.stock || 0) === 0
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : isGuest
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                <span>
                                    {(product.stock || 0) === 0
                                        ? 'Stok Habis'
                                        : isGuest
                                            ? 'Login untuk Beli'
                                            : 'Beli Sekarang'
                                    }
                                </span>
                            </button>

                            {isGuest && (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">
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

                        {/* Delivery Info */}
                        <div className="bg-blue-50 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                                <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="font-medium text-blue-900">Informasi Pengiriman</h4>
                                    <p className="text-sm text-blue-700">
                                        Estimasi pengiriman 30-60 menit untuk area Yogyakarta
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        Gratis ongkir untuk pembelian minimal Rp 50.000
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-12">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`py-4 border-b-2 font-medium ${activeTab === 'description'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Deskripsi
                                </button>
                                <button
                                    onClick={() => setActiveTab('specifications')}
                                    className={`py-4 border-b-2 font-medium ${activeTab === 'specifications'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Spesifikasi
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`py-4 border-b-2 font-medium ${activeTab === 'reviews'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Ulasan ({product.reviewCount || 0})
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 space-y-6">
                            {activeTab === 'description' && (
                                <>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Deskripsi Produk</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {product.description || 'Deskripsi produk tidak tersedia.'}
                                        </p>
                                    </div>

                                    {product.ingredients && product.ingredients.length > 0 && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Bahan-bahan</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {product.ingredients.map((ingredient, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                    >
                                                        {ingredient}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </>
                            )}

                            {activeTab === 'specifications' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Spesifikasi Produk</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Kategori</span>
                                            <span className="font-medium text-gray-900">{product.category || 'Tidak tersedia'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Stok</span>
                                            <span className="font-medium text-gray-900">{product.stock || 0} unit</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Status</span>
                                            <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-600">Terjual</span>
                                            <span className="font-medium text-gray-900">{product.sold || 0} unit</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Ulasan Produk</h3>
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-8">
                                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Belum ada ulasan untuk produk ini</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div
                                                    key={review.createdAt}
                                                    className="bg-gray-100 rounded-lg p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <img
                                                            src={review.userAvatar || 'https://tse4.mm.bing.net/th/id/OIP.dDKYQqVBsG1tIt2uJzEJHwHaHa?pid=Api&P=0&h=180'}
                                                            alt="Avatar"
                                                            className="w-8 h-8 rounded-full mr-3"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-semibold">{review.userName}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-yellow-500 mb-2">
                                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                    </div>
                                                    <p className="text-gray-800">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;