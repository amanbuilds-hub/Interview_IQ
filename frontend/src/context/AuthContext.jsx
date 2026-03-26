import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

    // Axios defaults
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const res = await axios.get(`${API_URL}/auth/me`);
                    setUser(res.data.user);
                } catch (err) {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [API_URL]);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, user: userData } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            toast.success(`Welcome back, ${userData.name}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            const { token, user: userData } = res.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            navigate('/login');
            toast.success('Logged out');
        } catch (err) {
            toast.error('Logout failed');
        }
    };

    const updateProfile = async (data) => {
        try {
            const res = await axios.put(`${API_URL}/auth/update-me`, data);
            setUser(res.data.user);
            toast.success('Profile updated successfully!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
