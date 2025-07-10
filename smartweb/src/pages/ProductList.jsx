import React, { useState, useMemo, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import productService from "../services/ProductServices";
import ProductGrid from "../components/ProductGrid";

function ProductsList({ isSidebarOpen }) {
    const [products, setProducts] = useState([]);
    const [visibleCount, setVisibleCount] = useState(
        isSidebarOpen ? 4 : 6
    );
    const [sortBy, setSortBy] = useState("rating");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const fetched = await productService.getAllProducts();
                setProducts(fetched);
            } catch (error) {
                console.error(error.message);
            }
        };
        fetchProducts();
    }, []);

    const sortedProducts = useMemo(() => {
        const sorted = [...products];

        if (sortBy === "rating") {
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "newest") {
            sorted.sort((a, b) => {
                const dateA = new Date((a.createdAt || "").split(".")[0]);
                const dateB = new Date((b.createdAt || "").split(".")[0]);
                console.log(dateA)
                return dateB - dateA;
            });
        }

        return sorted;
    }, [products, sortBy]);


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

    const handleProductClick = (productId) => {
        // Navigate to product detail page
        console.log(`Navigate to product detail: ${productId}`);
        // You can add navigation logic here
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

            {/* Product Grid */}
            <ProductGrid
                products={visibleProducts}
                onProductClick={handleProductClick}
                gridResponsive="grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))]"
                showBuyButton={true}
            />

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