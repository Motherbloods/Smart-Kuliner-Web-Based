import { useState, useEffect } from 'react';
import {
    FileText,
    ChevronLeft,
    ChevronRight,
    MonitorPlay,
    UtensilsCrossed,
    User,
    LogOut,
    Home,
    LogIn,
    ListOrdered,
    ArrowLeft,
    UserPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Sidebar = ({ activeMenu, setActiveMenu, onToggle, isMobileMenuOpen, onMobileMenuToggle }) => {
    const [isOpen, setIsOpen] = useState(true);
    const { userRole, user } = useAuth();
    const navigate = useNavigate();

    // Check if user is guest (not logged in)
    const isGuest = !user;

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onToggle?.(newState);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-button')) {
                onMobileMenuToggle();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen, onMobileMenuToggle]);

    // Menu for guest users (not logged in)
    const guestMenuItems = [
        { id: 'products', label: 'Produk Kuliner', icon: UtensilsCrossed },
        { id: 'konten', label: 'Konten', icon: MonitorPlay },
        { id: 'resep', label: 'Resep', icon: FileText },
        { id: 'login', label: 'Login', icon: LogIn },
        { id: 'register', label: 'Daftar', icon: UserPlus },
    ];

    // Menu for regular users (buyers)
    const userMenuItems = [
        { id: 'products', label: 'Produk Kuliner', icon: UtensilsCrossed },
        { id: 'konten', label: 'Konten', icon: MonitorPlay },
        { id: 'resep', label: 'Resep', icon: FileText },
        { id: 'profile', label: 'Informasi Pengguna', icon: User },
        { id: 'logout', label: 'Logout', icon: LogOut },
    ];

    // Menu for sellers
    const sellerMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'order', label: 'Order List', icon: ListOrdered },
        { id: 'products', label: 'Produk Saya', icon: UtensilsCrossed },
        { id: 'konten', label: 'Konten', icon: MonitorPlay },
        { id: 'resep', label: 'Resep', icon: FileText },
        { id: 'profile', label: 'Informasi Pengguna', icon: User },
        { id: 'logout', label: 'Logout', icon: LogOut },
    ];

    // Determine which menu to use
    const getMenuItems = () => {
        console.log(isGuest, userRole)
        if (isGuest) {
            return guestMenuItems;
        }
        return userRole === 'seller' ? sellerMenuItems : userMenuItems;
    };

    const menuItems = getMenuItems();

    const handleMenuClick = (itemId) => {
        // Handle special menu items for guests
        if (isGuest) {
            if (itemId === 'login') {
                navigate('/login');
                return;
            }
            if (itemId === 'register') {
                navigate('/register');
                return;
            }
        }

        setActiveMenu(itemId);

        // Close mobile menu after selection
        if (isMobileMenuOpen) {
            onMobileMenuToggle();
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`h-screen fixed top-0 left-0 z-20 transition-all duration-300 hidden lg:flex ${isOpen ? 'w-60' : 'w-16'
                    } bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl flex-col justify-between`}
            >
                {/* Header */}
                <div
                    className={`flex items-center px-4 py-4 border-b border-gray-700/50 ${isOpen ? 'justify-between' : 'justify-center'
                        }`}
                >
                    {isOpen && (
                        <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                            SmartKuliner
                        </h1>
                    )}
                    <button
                        onClick={handleToggle}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 px-3 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)}
                                className={`w-full flex items-center relative group ${isOpen ? 'px-3 justify-start' : 'justify-center px-0'
                                    } py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                                        }`}
                                />
                                {isOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}

                                {/* Tooltip (collapsed state) */}
                                {!isOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Status Info */}
                {isOpen && (
                    <div className="px-4 py-3 border-t border-gray-700/50">
                        <div className="text-center text-xs text-gray-500 mb-1">
                            {isGuest ? 'Mode Tamu' : 'Logged In'}
                        </div>
                        <div className="text-center text-xs text-gray-600">© 2024 SmartKuliner</div>
                    </div>
                )}
            </div>

            {/* Mobile Sidebar */}
            <div
                className={`mobile-sidebar fixed top-0 left-0 w-64 h-full text-white z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    } overflow-y-auto flex flex-col`}
                style={{
                    background: 'linear-gradient(180deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
                    boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
                }}
            >
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-6 border-b border-gray-700/50">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                        SmartKuliner
                    </h1>
                    <button
                        onClick={onMobileMenuToggle}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleMenuClick(item.id)}
                                className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                    }`}
                            >
                                <Icon
                                    className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'
                                        }`}
                                />
                                <span className="ml-3 text-sm font-medium">{item.label}</span>

                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Mobile Status Info */}
                <div className="px-4 py-3 border-t border-gray-700/50 mt-auto">
                    <div className="text-center text-xs text-gray-500 mb-1">
                        {isGuest ? 'Mode Tamu' : 'Logged In'}
                    </div>
                    <div className="text-center text-xs text-gray-600">© 2024 SmartKuliner</div>
                </div>
            </div>
        </>
    );
};