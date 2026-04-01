import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: { full_name: string, email: string } | null;
    token: string | null;
    login: (token: string, fullName: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<{ full_name: string, email: string } | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('weld_ai_token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('weld_ai_token');
        const storedName = localStorage.getItem('weld_ai_user_name');
        if (storedToken && storedName) {
            setToken(storedToken);
            setUser({ full_name: storedName, email: '' });
        }
    }, []);

    const login = (newToken: string, fullName: string) => {
        setToken(newToken);
        setUser({ full_name: fullName, email: '' });
        localStorage.setItem('weld_ai_token', newToken);
        localStorage.setItem('weld_ai_user_name', fullName);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('weld_ai_token');
        localStorage.removeItem('weld_ai_user_name');
        window.location.href = '/auth';
    };

    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
        const headers = new Headers(options.headers || {});
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            logout();
        }
        
        return response;
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, fetchWithAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
