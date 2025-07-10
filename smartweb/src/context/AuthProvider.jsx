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
                    const userData = await authService.getUserData(user.uid);
                    dispatch({ type: 'SET_USER_DATA', payload: userData });
                } else {
                    dispatch({ type: 'CLEAR_AUTH' });
                }
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error.message });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (emailOrPhone, password) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await authService.login(emailOrPhone, password);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        }
    };

    const register = async (email, password, userData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await authService.register(email, password, userData);
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
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
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};
