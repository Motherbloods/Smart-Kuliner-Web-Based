import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoute = ({ children }) => {
    const { user, loading, isInitialized } = useAuth();

    // Tampilkan loading spinner jika auth belum siap
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

    // Redirect jika user sudah login
    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};
