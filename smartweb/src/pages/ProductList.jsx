import React, { useState, useMemo, useEffect } from "react";
import { Star, Heart, ShoppingCart, ArrowUp } from "lucide-react";
import productsData from "../data/products.json";

function ProductsList({ isSidebarOpen }) {
    const allProducts = Object.entries(productsData.products || {}).map(
        ([id, item]) => ({
            id,
            ...item,
        })
    );

    const [visibleCount, setVisibleCount] = useState(
        isSidebarOpen ? 4 : 6
    );
    const [sortBy, setSortBy] = useState("rating");
    // Gunakan useMemo agar hanya dihitung ulang saat sort berubah
    const sortedProducts = useMemo(() => {
        const sorted = [...allProducts];
        if (sortBy === "rating") {
            sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === "newest") {
            sorted.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
        }
        return sorted;
    }, [allProducts, sortBy]);

    // Hitung berapa item per klik berdasarkan kondisi sidebar saat ini
    const perClickIncrement = isSidebarOpen ? 4 : 6;

    // Effect untuk menyesuaikan visibleCount saat sidebar berubah
    useEffect(() => {
        const currentRows = Math.ceil(visibleCount / (isSidebarOpen ? 8 : 6));
        const newVisibleCount = currentRows * perClickIncrement;

        if (newVisibleCount >= visibleCount) {
            setVisibleCount(newVisibleCount);
        } else {
            const minRows = Math.ceil(visibleCount / perClickIncrement);
            setVisibleCount(minRows * perClickIncrement);
        }
    }, [isSidebarOpen, perClickIncrement]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + perClickIncrement);
    };

    const visibleProducts = sortedProducts.slice(0, visibleCount);

    return (
        <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Produk Terlaris
                    </h1>
                    <p className="text-gray-600">
                        Temukan produk kuliner terbaik pilihan kami
                    </p>
                </div>

                {/* Enhanced Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 px-4 py-3 pr-8 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <option value="rating">⭐ Rating Tertinggi</option>
                        <option value="newest">🆕 Terbaru</option>
                    </select>
                    <ArrowUp className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-180 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Enhanced Grid Produk */}
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-6">
                {visibleProducts.map((product) => (
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

            {/* Enhanced Load More Button */}
            {visibleCount < sortedProducts.length && (
                <div className="flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
                    >
                        <span>Lihat Lebih Banyak</span>
                        <ArrowUp className="h-4 w-4 rotate-180" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProductsList;