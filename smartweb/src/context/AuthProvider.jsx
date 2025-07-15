import React, { useReducer, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

import { authReducer, initialState } from './AuthReducer';
import authService from '../services/AuthServices';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    dispatch({ type: 'SET_USER', payload: user });
                    // Set loading true saat mulai fetch userData
                    dispatch({ type: 'SET_LOADING', payload: true });

                    try {
                        const userData = await authService.getUserData(user.uid);
                        dispatch({ type: 'SET_USER_DATA', payload: userData });
                        dispatch({ type: 'SET_LOADING', payload: false });
                    } catch (error) {
                        console.error('[ERROR] Gagal mengambil data user:', error);

                        // PERBAIKAN: Jika data user tidak ditemukan di Firestore
                        // tapi masih login di Firebase Auth, logout paksa user
                        if (error.message.includes('Data user tidak ditemukan')) {
                            console.log('[INFO] Data user tidak ditemukan, melakukan logout paksa...');
                            try {
                                await authService.logout();
                                dispatch({ type: 'CLEAR_AUTH' });
                            } catch (logoutError) {
                                console.error('[ERROR] Gagal logout paksa:', logoutError);
                                dispatch({ type: 'CLEAR_AUTH' });
                            }
                        } else {
                            // Untuk error lain, tetap set loading false dan tampilkan error
                            dispatch({ type: 'SET_LOADING', payload: false });
                            dispatch({ type: 'SET_ERROR', payload: error.message });
                        }
                    }
                } else {
                    dispatch({ type: 'CLEAR_AUTH' });
                }
            } catch (error) {
                console.error('[ERROR] Auth state changed error:', error);
                dispatch({ type: 'SET_ERROR', payload: error.message });
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (emailOrPhone, password) => {
        try {
            const { user, userData } = await authService.login(emailOrPhone, password);
            console.log('[DEBUG] userData after login:', userData);

            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_USER_DATA', payload: userData });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const register = async (email, password, userData) => {
        try {
            await authService.register(email, password, userData);

            await new Promise(resolve => setTimeout(resolve, 500));

            const { user: loggedInUser, userData: loggedInUserData } = await authService.login(email, password);

            dispatch({ type: 'SET_USER', payload: loggedInUser });
            dispatch({ type: 'SET_USER_DATA', payload: loggedInUserData });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const registerSeller = async (formData) => {
        try {
            const result = await authService.registerSeller(formData);
            console.log('[DEBUG] Seller registration result:', result);

            // Tunggu sebentar untuk memastikan data tersimpan
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Login setelah registrasi berhasil
            const { user, userData } = await authService.login(formData.email, formData.password);
            console.log('[DEBUG] Auto login after seller registration:', { user: user.uid, userData });

            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_USER_DATA', payload: userData });

            return result;
        } catch (error) {
            console.error('[ERROR] Register seller in provider:', error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            dispatch({ type: 'CLEAR_AUTH' });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    };

    const updateUserData = async (updateData) => {
        try {
            if (state.user) {
                await authService.updateUserData(state.user.uid, updateData);
                const userData = await authService.getUserData(state.user.uid);
                dispatch({ type: 'SET_USER_DATA', payload: userData });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, registerSeller, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};