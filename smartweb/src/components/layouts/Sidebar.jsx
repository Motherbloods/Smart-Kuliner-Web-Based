import { useState } from 'react';
import {
    FileText,
    ChevronLeft,
    ChevronRight,
    MonitorPlay,
    UtensilsCrossed,
    User,
    LogOut,
} from 'lucide-react';

export const Sidebar = ({ activeMenu, setActiveMenu, onToggle }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onToggle?.(newState);
    };
    const menuItems = [
        // { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
        { id: 'products', label: 'Produk', icon: UtensilsCrossed },
        { id: 'konten', label: 'Konten', icon: MonitorPlay },
        { id: 'resep', label: 'Resep', icon: FileText },
        { id: 'profile', label: 'Informasi Pengguna', icon: User },
        { id: 'logout', label: 'Logout', icon: LogOut },
        // { id: 'informasi-pengguna', label: 'Pengguna', icon: UserCircle, badge: null },
        // { id: 'analytics', label: 'Analitik', icon: BarChart3, badge: '5' },
    ];

    // const bottomMenuItems = [
    //     { id: 'settings', label: 'Pengaturan', icon: Settings },
    //     { id: 'help', label: 'Bantuan', icon: HelpCircle },
    // ];

    return (
        <div
            className={`h-screen fixed top-0 left-0 z-20 transition-all duration-300 ${isOpen ? 'w-60' : 'w-16'}
    bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl flex flex-col justify-between`}
        >

            {/* Header */}
            <div className={`flex items-center px-4 py-4 border-b border-gray-700/50 ${isOpen ? 'justify-between' : 'justify-center'
                }`}>
                {isOpen && (
                    <div className="flex items-center space-x-2">

                        <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                            SmartKuliner
                        </h1>
                    </div>
                )}

                <button
                    onClick={handleToggle}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* User Profile Section */}
            {/* {isOpen && (
                <div className="px-4 py-4 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <UserCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-white">John Doe</div>
                            <div className="text-xs text-gray-400">Administrator</div>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Main Menu Items */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center relative group ${isOpen ? 'px-3 justify-start' : 'justify-center px-0'
                                } py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />

                            {isOpen && (
                                <>
                                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${item.badge === 'hot'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-blue-500 text-white'
                                            }`}>
                                            {item.badge === 'hot' ? '🔥' : item.badge}
                                        </span>
                                    )}
                                </>
                            )}

                            {/* Tooltip for collapsed state */}
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

            {/* Bottom Menu Items */}
            {/* <div className="px-3 py-4 border-t border-gray-700/50 space-y-2">
                {bottomMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeMenu === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`w-full flex items-center group ${isOpen ? 'px-3 justify-start' : 'justify-center px-0'
                                } py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                        > */}
            {/* <Icon className="h-5 w-5" />

                            {isOpen && (
                                <span className="ml-3 text-sm font-medium">{item.label}</span>
                            )} */}

            {/* Tooltip for collapsed state */}
            {/* {!isOpen && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div> */}

            {/* Version Info */}
            {isOpen && (
                <div className="px-4 py-3 border-t border-gray-700/50">
                    <div className="text-center">

                        <div className="text-xs text-gray-600 mt-1">© 2024 SmartKuliner</div>
                    </div>
                </div>
            )}
        </div>

    );
};