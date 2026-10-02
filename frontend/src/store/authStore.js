import { create } from 'zustand';
import { getMe, loginUser, registerUser } from '../api/api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,

    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await loginUser({ email, password });
            localStorage.setItem('token', data.token);
            set({ user: data, token: data.token, loading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Login failed', loading: false });
            throw err;
        }
    },

    register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
            const { data } = await registerUser({ name, email, password });
            localStorage.setItem('token', data.token);
            set({ user: data, token: data.token, loading: false });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Registration failed', loading: false });
            throw err;
        }
    },

    loadUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const { data } = await getMe();
            set({ user: data });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
