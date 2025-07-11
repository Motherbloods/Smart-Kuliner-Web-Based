import { useNavigate } from "react-router-dom";
import KontenPage from "./Konten";
import ProductsList from "./ProductList";
import Profile from "./Profile";
import RecipePage from "./Resep";
import { useEffect } from "react";
import authService from "../services/AuthServices";
import Dashboard from "./Dashboard";

export const PageContent = ({ activeMenu, isSidebarOpen }) => {
    const navigate = useNavigate();

    useEffect(() => {
        if (activeMenu === "logout") {
            const confirmLogout = window.confirm("Apakah kamu yakin ingin logout?");
            if (confirmLogout) {
                authService.logout().then(() => {
                    navigate("/login");
                });
            } else {
                // Jika batal logout, arahkan kembali ke halaman dashboard atau yang lain
                navigate("/");
            }
        }
    }, [activeMenu, navigate]);
    const renderContent = () => {
        switch (activeMenu) {
            case 'products':
                return (
                    <ProductsList isSidebarOpen={isSidebarOpen} />
                );
            case 'konten':
                return (<KontenPage />)
            case 'resep':
                return (
                    <RecipePage />
                )
            case 'profile':
                return (<Profile />)
            case 'dashboard':
                return (<Dashboard />)
            default:
                return (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600">Selamat datang di SmartKuliner!</p>
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