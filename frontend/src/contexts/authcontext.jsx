// src/contexts/authcontext.jsx
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // <-- 1. Adicionar estado loading

    useEffect(() => {
        console.log("AuthProvider Effect: Checking localStorage..."); // Log para depuração
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                console.log("AuthProvider Effect: User found in localStorage", storedUser); // Log
                setUser(JSON.parse(storedUser));
            } else {
                console.log("AuthProvider Effect: No user in localStorage"); // Log
            }
        } catch (error) {
            console.error("AuthProvider Effect: Error reading user from localStorage", error);
            localStorage.removeItem('user'); // Limpar se estiver inválido
        } finally {
            console.log("AuthProvider Effect: Setting loading to false"); // Log
            setLoading(false); // <-- 2. Definir loading para false aqui
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        setLoading(false); // Boa prática definir loading false no login também
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setLoading(false); // E no logout
        localStorage.removeItem('user');
    };

    // 3. Incluir 'loading' no value
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };