import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles, requireAuth = false }) => {
    const { userData, loading, isInitialized, user } = useAuth();

    if (!isInitialized || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="text-gray-600 text-lg">Memuat...</div>
                </div>
            </div>
        );
    }

    const isSeller = userData?.seller;
    const userRole = user ? (isSeller ? 'seller' : 'buyer') : 'guest';

    // Jika requireAuth dan belum login, redirect ke login
    if (requireAuth && !user) {
        return <Navigate to="/login" replace />;
    }

    // Jika ada pembatasan role, dan role user saat ini tidak termasuk, redirect
    if (allowedRoles?.length && !allowedRoles.includes(userRole)) {
        // Guest tidak diizinkan
        if (!user && !allowedRoles.includes('guest')) {
            return <Navigate to="/login" replace />;
        }

        // Sudah login tapi role tidak sesuai
        return <Navigate to="/" replace />;
    }

    return children;
};
