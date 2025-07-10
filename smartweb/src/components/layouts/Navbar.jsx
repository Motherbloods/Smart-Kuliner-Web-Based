import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Settings, LogOut, MessageCircle } from 'lucide-react';

export const Navbar = ({ activeMenu, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const notifications = [
        { id: 1, message: 'Pesanan baru dari pelanggan', time: '2 menit lalu', type: 'order', unread: true },
        { id: 2, message: 'Update sistem berhasil', time: '1 jam lalu', type: 'system', unread: true },
        { id: 3, message: 'Profil berhasil diperbarui', time: '3 jam lalu', type: 'profile', unread: false },
        { id: 4, message: 'Produk baru ditambahkan', time: '5 jam lalu', type: 'product', unread: false },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    const getPageTitle = (menu) => {
        switch (menu) {
            case 'products': return 'Produk Unggulan';
            case 'konten': return 'Konten Promosi';
            case 'informasi-pengguna': return 'Informasi Pengguna';
            default: return 'Dashboard';
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return '🛒';
            case 'system': return '⚙️';
            case 'profile': return '👤';
            case 'product': return '📦';
            default: return '📢';
        }
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

                    {/* Enhanced Notification Icon */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Enhanced Notification Dropdown */}
                        {isNotificationOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-xl backdrop-blur-lg z-50">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-800">Notifikasi</h3>
                                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                            {unreadCount} baru
                                        </span>
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200 ${notif.unread ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="text-lg">
                                                    {getNotificationIcon(notif.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm ${notif.unread ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                </div>
                                                {notif.unread && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 rounded-b-2xl">
                                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                                        Lihat semua notifikasi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Avatar Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                <User className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold text-gray-800">John Doe</div>
                                <div className="text-xs text-gray-500">Customer</div>
                            </div>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Enhanced User Dropdown */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl backdrop-blur-lg z-50">
                                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                            <User className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">John Doe</div>
                                            <div className="text-sm text-gray-500">john.doe@smartkuliner.com</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm">Profil Saya</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <Settings className="h-4 w-4" />
                                        <span className="text-sm">Pengaturan</span>
                                    </button>
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                                        <MessageCircle className="h-4 w-4" />
                                        <span className="text-sm">Bantuan</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-2"></div>
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-sm">Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};