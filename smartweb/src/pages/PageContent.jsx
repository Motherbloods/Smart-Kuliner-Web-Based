import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KontenPage from "./Konten";
import ProductManagement from "./ProductManagement";
import Profile from "./Profile";
import RecipePage from "./Resep";
import Dashboard from "./Dashboard";
import RecipeManagement from "./RecipeManagement";
import KontenManagement from "./KontenManagement";
import OrderList from "./OrderList";
import { useAuth } from "../hooks/useAuth";
import GuestProductList from "./GuestProductList"; // Component baru untuk guest

export const PageContent = ({ activeMenu, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    const { userData, user, logout, error } = useAuth();
    const isGuest = !user;

    const [hasLoggedOut, setHasLoggedOut] = useState(false);

    useEffect(() => {
        if (activeMenu === "logout" && !hasLoggedOut) {
            setHasLoggedOut(true); // mencegah efek dipanggil ulang
            const confirmLogout = window.confirm("Apakah kamu yakin ingin logout?");
            if (confirmLogout) {
                logout().then(() => {
                    navigate("/");
                });
            } else {
                navigate("/");
            }
        }
    }, [activeMenu, hasLoggedOut, navigate, logout]);

    useEffect(() => {
        setCurrentUser(userData);

        if (isGuest) {
            if (activeMenu === "login") {
                navigate("/login");
            } else if (activeMenu === "register") {
                navigate("/register");
            }
        }
    }, [activeMenu, navigate, userData, user, isGuest]);


    // Handler untuk update status order
    const handleUpdateOrderStatus = (orderId, newStatus) => {
        console.log(`Order ${orderId} status updated to ${newStatus}`);
        // Bisa tambahkan logic tambahan di sini seperti notification
        // atau sync dengan state management lainnya
    };

    const renderContent = () => {
        // Guest content rendering
        if (isGuest) {
            switch (activeMenu) {
                case 'products':
                    return <GuestProductList isSidebarOpen={isSidebarOpen} />;
                case 'konten':
                    return <KontenPage isSidebarOpen={isSidebarOpen} />;
                case 'resep':
                    return <RecipePage isSidebarOpen={isSidebarOpen} />;
                default:
                    // Default untuk guest adalah products
                    return <GuestProductList isSidebarOpen={isSidebarOpen} />;
            }
        }

        if (!userData) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data pengguna...</p>
                    </div>
                </div>
            );
        }

        // Logged-in user content rendering
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
                    <div className="p-4 lg:p-6">
                        <div className="mb-6 lg:mb-8">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                            <p className="text-sm lg:text-base text-gray-600">Selamat datang di SmartKuliner!</p>
                        </div>
                    </div>
                );
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Muat Ulang
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div
            className={`mt-16 p-4 lg:p-6 bg-gray-50 min-h-screen transition-all duration-300 ${isSidebarOpen ? "lg:ml-60" : "lg:ml-16"
                }`}
        >
            {renderContent()}
        </div>
    );
};