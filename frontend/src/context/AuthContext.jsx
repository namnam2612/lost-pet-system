import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../api/config';

const STORAGE_KEY = 'pf_auth_user';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        try {
            if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            else localStorage.removeItem(STORAGE_KEY);
        } catch {
            /* ignore */
        }
    }, [user]);

    // Listen for updates from other parts (like MyAccount save)
    useEffect(() => {
        const handleStorageUpdate = () => {
            try {
                const updated = localStorage.getItem(STORAGE_KEY);
                if (updated) setUser(JSON.parse(updated));
            } catch {
                /* ignore */
            }
        };
        window.addEventListener('pf_auth_user_updated', handleStorageUpdate);
        return () => window.removeEventListener('pf_auth_user_updated', handleStorageUpdate);
    }, []);

    const login = async ({ email, password }) => {
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            setUser(res.data);
            return res.data;
        } catch (err) {
            setError(err?.response?.data?.message || 'Đăng nhập thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async ({ name, email, password, phone }) => {
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
            setUser(res.data);
            return res.data;
        } catch (err) {
            setError(err?.response?.data?.message || 'Đăng ký thất bại');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => setUser(null);

    const value = useMemo(() => ({ user, login, register, logout, loading, error, setError }), [user, loading, error]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

