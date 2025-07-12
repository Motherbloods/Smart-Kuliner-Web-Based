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
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase'; // Pastikan path sesuai dengan konfigurasi Firebase Anda

const COLLECTION_NAME = 'recipes';
const USER_LIKE_RECIPE_COLLECTION = 'user_like_recipe';

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

export const getRecipesBySeller = async (sellerId) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', sellerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const recipes = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            recipes.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
            });
        });

        return {
            success: true,
            data: recipes
        };
    } catch (error) {
        console.error('Error getting recipes by seller:', error);
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
        console.log(recipeId)
        if (!recipeId || typeof recipeId !== 'string') {
            return { success: false, error: 'ID resep tidak valid' };
        }
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

// NEW: Toggle favorite recipe dengan user_like_recipe table
export const toggleFavoriteRecipe = async (recipeId, userId) => {
    try {
        console.log(recipeId, userId)
        return await runTransaction(db, async (transaction) => {
            // Check if user already liked this recipe
            const likeQuery = query(
                collection(db, USER_LIKE_RECIPE_COLLECTION),
                where('userId', '==', userId),
                where('recipeId', '==', recipeId)
            );

            const likeSnapshot = await getDocs(likeQuery);
            const isCurrentlyLiked = !likeSnapshot.empty;

            // Get recipe document
            const recipeRef = doc(db, COLLECTION_NAME, recipeId);
            const recipeDoc = await transaction.get(recipeRef);

            if (!recipeDoc.exists()) {
                throw new Error('Resep tidak ditemukan');
            }

            const currentFavoriteCount = recipeDoc.data().favoriteCount || 0;

            if (isCurrentlyLiked) {
                // Unlike: Remove from user_like_recipe and decrement count
                const likeDoc = likeSnapshot.docs[0];
                transaction.delete(doc(db, USER_LIKE_RECIPE_COLLECTION, likeDoc.id));
                transaction.update(recipeRef, {
                    favoriteCount: Math.max(0, currentFavoriteCount - 1),
                    updatedAt: serverTimestamp()
                });

                return {
                    success: true,
                    isLiked: false,
                    message: 'Dihapus dari favorit',
                    favoriteCount: Math.max(0, currentFavoriteCount - 1)
                };
            } else {
                // Like: Add to user_like_recipe and increment count
                const likeRef = doc(collection(db, USER_LIKE_RECIPE_COLLECTION));
                transaction.set(likeRef, {
                    userId: userId,
                    recipeId: recipeId,
                    createdAt: serverTimestamp()
                });

                transaction.update(recipeRef, {
                    favoriteCount: currentFavoriteCount + 1,
                    updatedAt: serverTimestamp()
                });

                return {
                    success: true,
                    isLiked: true,
                    message: 'Ditambahkan ke favorit',
                    favoriteCount: currentFavoriteCount + 1
                };
            }
        });
    } catch (error) {
        console.error('Error toggling favorite:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// NEW: Get user's liked recipes
export const getUserLikedRecipes = async (userId) => {
    try {
        const likeQuery = query(
            collection(db, USER_LIKE_RECIPE_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const likeSnapshot = await getDocs(likeQuery);
        const likedRecipeIds = [];

        likeSnapshot.forEach((doc) => {
            likedRecipeIds.push(doc.data().recipeId);
        });

        return {
            success: true,
            data: likedRecipeIds
        };
    } catch (error) {
        console.error('Error getting user liked recipes:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// NEW: Check if user liked a specific recipe
export const isRecipeLikedByUser = async (recipeId, userId) => {
    try {
        const likeQuery = query(
            collection(db, USER_LIKE_RECIPE_COLLECTION),
            where('userId', '==', userId),
            where('recipeId', '==', recipeId)
        );

        const likeSnapshot = await getDocs(likeQuery);

        return {
            success: true,
            isLiked: !likeSnapshot.empty
        };
    } catch (error) {
        console.error('Error checking if recipe is liked:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// NEW: Get all recipes with user's like status
export const getAllRecipesWithLikeStatus = async (userId, isSeller) => {
    try {
        // Get all recipes
        const recipesResult = isSeller ? await getRecipesBySeller(userId) : await getAllRecipes();
        if (!recipesResult.success) {
            return recipesResult;
        }

        // Get user's liked recipes
        const likedRecipesResult = await getUserLikedRecipes(userId);
        if (!likedRecipesResult.success) {
            return likedRecipesResult;
        }

        const likedRecipeIds = new Set(likedRecipesResult.data);

        // Add isLiked property to each recipe
        const recipesWithLikeStatus = recipesResult.data.map(recipe => ({
            ...recipe,
            isLiked: likedRecipeIds.has(recipe.id)
        }));

        return {
            success: true,
            data: recipesWithLikeStatus
        };
    } catch (error) {
        console.error('Error getting recipes with like status:', error);
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