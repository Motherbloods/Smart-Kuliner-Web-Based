import React, { useState } from 'react';
import ProductsList from './ProductList';
import AddProduct from './AddProduct';
import EditProduct from './EditProduct';

const ProductManagement = ({ isSidebarOpen }) => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddProduct = () => {
        setCurrentView('add');
    };

    const handleEditProduct = (productId) => {
        setSelectedProductId(productId);
        setCurrentView('edit');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedProductId(null);
    };

    const handleProductSuccess = () => {
        setCurrentView('list');
        setSelectedProductId(null);
        // Refresh the products list
        setRefreshKey(prev => prev + 1);
    };

    const handleProductDelete = () => {
        setCurrentView('list');
        setSelectedProductId(null);
        // Refresh the products list
        setRefreshKey(prev => prev + 1);
    };

    // Render berdasarkan view yang aktif
    if (currentView === 'add') {
        return (
            <AddProduct
                onBack={handleBackToList}
                onSuccess={handleProductSuccess}
            />
        );
    }

    if (currentView === 'edit' && selectedProductId) {
        return (
            <EditProduct
                productId={selectedProductId}
                onBack={handleBackToList}
                onSuccess={handleProductSuccess}
                onDelete={handleProductDelete}
            />
        );
    }

    // Default view adalah list
    return (
        <ProductsList
            key={refreshKey}
            isSidebarOpen={isSidebarOpen}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
        />
    );
};

export default ProductManagement;