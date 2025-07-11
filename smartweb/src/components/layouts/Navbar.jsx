import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Settings, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = ({ activeMenu, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const { userData, loading } = useAuth();

    const getPageTitle = (menu) => {
        switch (menu) {
            case 'products': return 'Produk Unggulan';
            case 'konten': return 'Konten Promosi';
            case 'informasi-pengguna': return 'Informasi Pengguna';
            default: return 'Dashboard';
        }
    };

    const getDisplayName = () => {
        if (loading) {
            return 'Memuat...';
        }

        if (!userData) {
            return 'Memuat...'; // Ubah dari 'Pengguna' ke 'Memuat...'
        }

        // Prioritas: name > namaToko > email
        if (userData.name) {
            return capitalize(userData.name);
        }

        if (userData.namaToko) {
            return capitalize(userData.namaToko);
        }

        if (userData.email) {
            return userData.email.split('@')[0];
        }

        return 'Memuat...'; // Ubah dari 'Pengguna' ke 'Memuat...'
    };

    // Function to handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to product search page with query parameter
            navigate(`/product-search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Function to handle search icon click
    const handleSearchIconClick = () => {
        if (searchQuery.trim()) {
            navigate(`/product-search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className={`fixed top-0 ${isSidebarOpen ? 'left-60' : 'left-16'} right-0 bg-white/80 backdrop-blur-md shadow-lg z-20 h-16 border-b border-gray-200/50 transition-all duration-300`}>
            <div className="flex items-center justify-between h-full px-6">
                {/* Page Title with Enhanced Styling */}
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {getPageTitle(activeMenu)}
                    </h2>
                    <div className="h-6 w-px bg-gray-300"></div>
                    <span className="text-sm text-gray-500 font-medium">
                        SmartKuliner
                    </span>
                </div>

                {/* Enhanced Search Bar & Icons */}
                <div className="flex items-center space-x-4">
                    {/* Enhanced Search Bar */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-105' : ''}`}>
                            <button
                                type="button"
                                onClick={handleSearchIconClick}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                            <input
                                type="text"
                                placeholder="Cari produk, pesanan, atau konten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(e);
                                    }
                                }}
                                className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                            />
                        </div>
                    </form>

                    {/* Enhanced Avatar Dropdown */}
                    <div className="relative">
                        <button
                            className="flex items-center space-x-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">
                                    {getDisplayName()}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {loading ? 'Memuat...' : (userData?.seller ? "Seller" : "Pembeli")}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};