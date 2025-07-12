import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';

const ProductGrid = ({
    products,
    onProductClick,
    onEditClick,
    onDeleteClick,
    gridResponsive = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3',
    showBuyButton = true,
    isSeller,
    className = ''
}) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleProductClick = (product) => {
        if (onProductClick) {
            onProductClick(product.id || product._id);
        }
    };

    const handleEditClick = (e, productId) => {
        e.stopPropagation();
        if (onEditClick) {
            onEditClick(productId);
        }
    };

    const handleDeleteClick = (e, productId) => {
        e.stopPropagation();
        if (onDeleteClick) {
            onDeleteClick(productId);
        }
    };

    return (
        <div className={`grid ${gridResponsive} gap-6 ${className}`}>
            {products.map((product) => (
                <div
                    key={product.id || product._id}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer"
                    onClick={() => handleProductClick(product)}
                >
                    {/* Product Image */}
                    <div className="relative overflow-hidden">
                        <img
                            src={product.imageUrls?.[0] || product.image || '/api/placeholder/280/192'}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                                e.target.src = '/api/placeholder/280/192';
                            }}
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
                                {product.rating}
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                                ({product.reviews || 0} ulasan)
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
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isSeller ? (
                            <div className="flex justify-between gap-2">
                                <button
                                    onClick={(e) => handleEditClick(e, product.id || product._id)}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-xl font-semibold shadow-md transition-all duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, product.id || product._id)}
                                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 rounded-xl shadow-md transition-all duration-200"
                                >
                                    🗑
                                </button>
                            </div>
                        ) : showBuyButton && (
                            <button
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle buy button click
                                }}
                            >
                                <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                <span>Beli Sekarang</span>
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductGrid;
