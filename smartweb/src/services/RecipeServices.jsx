// recipeServices.js
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // Pastikan path sesuai dengan konfigurasi Firebase Anda

const COLLECTION_NAME = 'recipes';

// Create - Membuat resep baru
export const createRecipe = async (recipeData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...recipeData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true,
            rating: 0,
            reviewCount: 0,
            favoriteCount: 0,
            viewCount: 0
        });

        return {
            success: true,
            id: docRef.id,
            message: 'Resep berhasil dibuat'
        };
    } catch (error) {
        console.error('Error creating recipe:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Read - Mendapatkan semua resep
export const getAllRecipes = async () => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const recipes = [];

        querySnapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
            });
        });

        return {
            success: true,
            data: recipes
        };
    } catch (error) {
        console.error('Error getting recipes:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Read - Mendapatkan resep berdasarkan user ID
export const getRecipesByUser = async (userId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const recipes = [];

        querySnapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
            });
        });

        return {
            success: true,
            data: recipes
        };
    } catch (error) {
        console.error('Error getting user recipes:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Read - Mendapatkan resep berdasarkan ID
export const getRecipeById = async (recipeId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, recipeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                success: true,
                data: {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                }
            };
        } else {
            return {
                success: false,
                error: 'Resep tidak ditemukan'
            };
        }
    } catch (error) {
        console.error('Error getting recipe:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Update - Memperbarui resep
export const updateRecipe = async (recipeId, updateData) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, recipeId);
        await updateDoc(docRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: 'Resep berhasil diperbarui'
        };
    } catch (error) {
        console.error('Error updating recipe:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Delete - Menghapus resep (soft delete)
export const deleteRecipe = async (recipeId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, recipeId);
        await updateDoc(docRef, {
            isActive: false,
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: 'Resep berhasil dihapus'
        };
    } catch (error) {
        console.error('Error deleting recipe:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Update - Menambah favorite count
export const toggleFavoriteRecipe = async (recipeId, isAddingFavorite) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, recipeId);
        await updateDoc(docRef, {
            favoriteCount: increment(isAddingFavorite ? 1 : -1),
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            message: isAddingFavorite ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit'
        };
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Update - Menambah view count
export const incrementViewCount = async (recipeId) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, recipeId);
        await updateDoc(docRef, {
            viewCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return {
            success: true
        };
    } catch (error) {
        console.error('Error incrementing view count:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Read - Mendapatkan resep berdasarkan kategori
export const getRecipesByCategory = async (category) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('category', '==', category),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const recipes = [];

        querySnapshot.forEach((doc) => {
            recipes.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
            });
        });

        return {
            success: true,
            data: recipes
        };
    } catch (error) {
        console.error('Error getting recipes by category:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Read - Search resep
export const searchRecipes = async (searchTerm) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('isActive', '==', true),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const recipes = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const title = data.title?.toLowerCase() || '';
            const description = data.description?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();

            if (title.includes(search) || description.includes(search)) {
                recipes.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            }
        });

        return {
            success: true,
            data: recipes
        };
    } catch (error) {
        console.error('Error searching recipes:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Utility function untuk validasi data resep
export const validateRecipeData = (recipeData) => {
    const required = ['title', 'description', 'category', 'difficulty', 'duration', 'servings', 'ingredients', 'steps', 'userId'];
    const missing = required.filter(field => !recipeData[field]);

    if (missing.length > 0) {
        return {
            isValid: false,
            error: `Field yang diperlukan: ${missing.join(', ')}`
        };
    }

    if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
        return {
            isValid: false,
            error: 'Ingredients harus berupa array dan tidak boleh kosong'
        };
    }

    if (!Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
        return {
            isValid: false,
            error: 'Steps harus berupa array dan tidak boleh kosong'
        };
    }

    return {
        isValid: true
    };
};