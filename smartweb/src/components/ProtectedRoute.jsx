import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { userData, loading, isInitialized } = useAuth();

    // Tampilkan loading jika auth belum diinisialisasi
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

    // Redirect ke login jika tidak ada userData
    if (!userData) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles?.length) {
        const isSeller = userData?.seller;
        const userRole = isSeller ? 'seller' : 'buyer';
        console.log(isSeller, userRole)
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};