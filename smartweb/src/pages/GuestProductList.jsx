import React, { useState, useMemo, useEffect } from "react";
import { ArrowUp, Eye, ShoppingCart, MessageCircle, Heart, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import productService from "../services/ProductServices";
import ProductGrid from "../components/ProductGrid";

function GuestProductList({ isSidebarOpen }) {
    const [products, setProducts] = useState([]);
    const [loadMoreClicks, setLoadMoreClicks] = useState(0);
    const [sortBy, setSortBy] = useState("rating");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Hitung items per row dan initial visible count
    const itemsPerRow = isSidebarOpen ? 3 : 4;
    const initialVisibleCount = itemsPerRow * 2; // 2 baris pertama
    const visibleCount = initialVisibleCount + (loadMoreClicks * itemsPerRow);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const fetched = await productService.getAllProducts();
                setProducts(fetched);
            } catch (error) {
                console.error("Error fetching products:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Reset loadMoreClicks ketika sidebar berubah
    useEffect(() => {
        setLoadMoreClicks(0);
    }, [isSidebarOpen]);

    const sortedProducts = useMemo(() => {
        const sorted = [...products];

        if (sortBy === "rating") {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "newest") {
            sorted.sort((a, b) => {
                const dateA = new Date((a.createdAt || "").split(".")[0]);
                const dateB = new Date((b.createdAt || "").split(".")[0]);
                return dateB - dateA;
            });
        }

        return sorted;
    }, [products, sortBy]);

    const handleLoadMore = () => {
        setLoadMoreClicks(prev => prev + 1);
    };

    const handleProductClick = (productId) => {
        // Guest bisa melihat detail produk tapi dengan fitur terbatas
        console.log(`Guest viewing product: ${productId}`);
        // Untuk saat ini hanya log, bisa dikembangkan modal preview atau halaman detail terbatas
        alert("Silakan login untuk melihat detail lengkap produk");
    };

    const visibleProducts = sortedProducts.slice(0, visibleCount);
    console.log(visibleProducts)
    // Tentukan grid responsive berdasarkan sidebar
    const gridResponsive = isSidebarOpen
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat produk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-2 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header dengan informasi guest */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                            🍽️ Produk Kuliner Terbaik
                        </h1>
                        <p className="text-gray-600 mb-2">
                            Jelajahi berbagai produk kuliner lezat dari para seller terpercaya
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                            <span className="bg-blue-100 px-2 py-1 rounded-full">Mode Tamu</span>
                            <span>•</span>
                            <button
                                onClick={() => navigate('/login')}
                                className="hover:underline font-medium"
                            >
                                Login untuk fitur lengkap
                            </button>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Login</span>
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <span>Daftar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter dan Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
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
            </div>

            {/* Product Grid */}
            <ProductGrid
                products={visibleProducts}
                onProductClick={handleProductClick}
                onEditClick={null}
                onDeleteClick={null}
                gridResponsive={gridResponsive}
                showBuyButton={true}
                isSeller={false}
                userId={null}
            />

            {/* Load More Button */}
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

            {/* Call to Action untuk Guest */}
            {products.length > 0 && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Tertarik untuk berbelanja?</h3>
                    <p className="text-blue-100 mb-4">
                        Daftar sekarang dan nikmati pengalaman berbelanja kuliner yang tak terlupakan!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Daftar Sekarang
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
                        >
                            Sudah Punya Akun? Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GuestProductList;