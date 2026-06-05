import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
    name: string;
    email: string;
    role: 'visitor' | 'user' | 'admin';
}

export interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

const storedToken = window.localStorage.getItem('token');
const storedUser = window.localStorage.getItem('user');

let parsedUser = null;
if (storedUser) {
    try {
        parsedUser = JSON.parse(storedUser);
    } catch (e) {
        console.error("Hiba a felhasználói adatok beolvasásakor a localStorage-ból", e);
    }
}

const initialState: AuthState = {
    token: storedToken || null,
    user: parsedUser,
    isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            
            window.localStorage.setItem('token', action.payload.token);
            window.localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('user');
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;