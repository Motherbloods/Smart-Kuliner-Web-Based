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
                    <div className="p-4 lg:p-6">
                        <div className="mb-6 lg:mb-8">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                            <p className="text-sm lg:text-base text-gray-600">Selamat datang di SmartKuliner!</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div
            className={`mt-16 p-4 lg:p-6 bg-gray-50 min-h-screen transition-all duration-300 ${isSidebarOpen ? "lg:ml-60" : "lg:ml-16"
                }`}
        >
            {renderContent()}
        </div>
    );
};