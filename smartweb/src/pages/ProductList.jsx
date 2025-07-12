import React, { useState, useMemo, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import productService from "../services/ProductServices";
import ProductGrid from "../components/ProductGrid";
import { useAuth } from "../hooks/useAuth";

function ProductsList({ isSidebarOpen, onAddProduct, onEditProduct }) {
    const [products, setProducts] = useState([]);
    const [loadMoreClicks, setLoadMoreClicks] = useState(0); // Track berapa kali load more diklik
    const { userData } = useAuth();
    const [sortBy, setSortBy] = useState("rating");

    // Hitung items per row dan initial visible count
    const itemsPerRow = isSidebarOpen ? 3 : 4;
    const initialVisibleCount = itemsPerRow * 2; // 2 baris pertama
    const visibleCount = initialVisibleCount + (loadMoreClicks * itemsPerRow);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetched = await productService.getAllProducts();
                const filtered = userData?.seller
                    ? fetched.filter((p) => p.sellerId === userData.uid)
                    : fetched;
                setProducts(filtered);
            } catch (error) {
                console.error(error.message);
            }
        };
        if (userData) {
            fetchProducts();
        }
    }, [userData]);

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
        console.log(`Navigate to product detail: ${productId}`);
    };

    const handleEditClick = (productId) => {
        if (onEditProduct) {
            onEditProduct(productId);
        }
    };

    const handleDeleteClick = async (productId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            try {
                await productService.deleteProduct(productId);
                setProducts(prev => prev.filter(p => p.id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Gagal menghapus produk');
            }
        }
    };

    const visibleProducts = sortedProducts.slice(0, visibleCount);

    // Tentukan grid responsive berdasarkan sidebar
    const gridResponsive = isSidebarOpen
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4";

    return (
        <div className="space-y-8 p-2 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {userData?.seller ? 'Produk Anda' : 'Produk Terlaris'}
                    </h1>
                    <p className="text-gray-600">
                        {userData?.seller
                            ? 'Kelola dan pantau performa produk tokomu'
                            : 'Temukan produk kuliner terbaik pilihan kami'}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap justify-end">
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

                    {userData?.seller && (
                        <button
                            onClick={onAddProduct}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            + Tambah Produk
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <ProductGrid
                products={visibleProducts}
                onProductClick={handleProductClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                gridResponsive={gridResponsive}
                showBuyButton={true}
                isSeller={userData?.seller}
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
        </div>
    );
}

export default ProductsList;