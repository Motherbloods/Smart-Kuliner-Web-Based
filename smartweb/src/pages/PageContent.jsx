import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KontenPage from "./Konten";
import ProductManagement from "./ProductManagement";
import Profile from "./Profile";
import RecipePage from "./Resep";
import authService from "../services/AuthServices";
import Dashboard from "./Dashboard";
import RecipeManagement from "./RecipeManagement";
import KontenManagement from "./KontenManagement";
import OrderList from "./OrderList";
import { useAuth } from "../hooks/useAuth";

export const PageContent = ({ activeMenu, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    const { userData } = useAuth();
    useEffect(() => {
        // Get current user data
        setCurrentUser(userData);

        if (activeMenu === "logout") {
            const confirmLogout = window.confirm("Apakah kamu yakin ingin logout?");
            if (confirmLogout) {
                authService.logout().then(() => {
                    navigate("/login");
                });
            } else {
                navigate("/"); // Kembali ke home atau dashboard jika dibatalkan
            }
        }
    }, [activeMenu, navigate, userData]);

    // Handler untuk update status order
    const handleUpdateOrderStatus = (orderId, newStatus) => {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        // Bisa tambahkan logic tambahan di sini seperti notification
        // atau sync dengan state management lainnya
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'products':
                return <ProductManagement isSidebarOpen={isSidebarOpen} />;
            case 'konten':
                return <KontenManagement isSidebarOpen={isSidebarOpen} />;
            case 'resep':
                return <RecipeManagement isSidebarOpen={isSidebarOpen} />;
            case 'order':
                return (
                    <OrderList
                        sellerId={currentUser?.uid}
                        onUpdateStatus={handleUpdateOrderStatus}
                    />
                );
            case 'profile':
                return <Profile />;
            case 'dashboard':
                return <Dashboard />;
            default:
                return (
                    <div className="p-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                            <p className="text-gray-600">Selamat datang di SmartKuliner!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Welcome Card */}
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white col-span-full md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">
                                            Selamat datang, {currentUser?.displayName || currentUser?.name || 'User'}!
                                        </h2>
                                        <p className="text-blue-100">
                                            Kelola bisnis kuliner Anda dengan mudah dan efisien
                                        </p>
                                    </div>
                                    <div className="hidden md:block">
                                        <svg className="w-20 h-20 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Produk</p>
                                        <p className="text-2xl font-bold text-gray-900">24</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex items-center text-sm text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                        +12% dari bulan lalu
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                        <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Tambah Produk</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                        <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Lihat Pesanan</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                        <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Kelola Resep</span>
                                    </button>
                                    <button className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                        <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 2h10l-1 12H8L7 6z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Kelola Konten</span>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Pesanan baru dari John Doe</p>
                                            <p className="text-xs text-gray-500">2 jam yang lalu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Produk "Nasi Gudeg" telah disetujui</p>
                                            <p className="text-xs text-gray-500">1 hari yang lalu</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Resep baru "Soto Ayam" ditambahkan</p>
                                            <p className="text-xs text-gray-500">2 hari yang lalu</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className={`mt-16 p-6 bg-gray-50 min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-16"
                }`}
        >
            {renderContent()}
        </div>
    );
};