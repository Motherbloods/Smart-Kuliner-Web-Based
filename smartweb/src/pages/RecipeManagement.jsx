import React, { useState } from 'react';
import RecipePage from './Resep';       // Ganti dengan path yang sesuai
import AddRecipe from './AddRecipe';
import EditRecipe from './EditRecipe';
import { useAuth } from '../hooks/useAuth';

const RecipeManagement = ({ isSidebarOpen }) => {
    const [currentView, setCurrentView] = useState('list'); // 'list', 'add', 'edit'
    const { userData } = useAuth();
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddRecipe = () => {
        setCurrentView('add');
    };

    const handleEditRecipe = (recipeId) => {
        setSelectedRecipeId(recipeId);
        setCurrentView('edit');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedRecipeId(null);
    };

    const handleRecipeSuccess = () => {
        setCurrentView('list');
        setSelectedRecipeId(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleRecipeDelete = () => {
        setCurrentView('list');
        setSelectedRecipeId(null);
        setRefreshKey(prev => prev + 1);
    };

    if (currentView === 'add') {
        return (
            <AddRecipe
                onBack={handleBackToList}
                onSuccess={handleRecipeSuccess}
            />
        );
    }

    if (currentView === 'edit' && selectedRecipeId) {
        return (
            <EditRecipe
                recipeId={selectedRecipeId}
                onBack={handleBackToList}
                onSuccess={handleRecipeSuccess}
                onDelete={handleRecipeDelete}
            />
        );
    }

    return (
        <RecipePage
            key={refreshKey}
            isSidebarOpen={isSidebarOpen}
            onAddRecipe={handleAddRecipe}
            onEditRecipe={handleEditRecipe}
            currentUserId={userData.uid}
            isSeller={userData?.seller}
        />
    );
};

export default RecipeManagement;
