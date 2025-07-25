export const initialState = {
    user: null,
    userData: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isInitialized: false,
    userRole: 'guest'
};

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                loading: false,
                error: null
            };
        case 'SET_USER_DATA':
            return {
                ...state,
                userData: action.payload,
                userRole: action.payload?.seller ? 'seller' : 'user',
                isInitialized: true
            };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'CLEAR_AUTH':
            return {
                ...state,
                user: null,
                userData: null,
                loading: false,
                error: null,
                isInitialized: true
            };
        default:
            return state;
    }
};
