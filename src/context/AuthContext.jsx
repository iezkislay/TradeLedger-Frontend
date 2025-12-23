import { createContext, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi, me } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        me()
            .then(res => {
                if (res.data.success) {
                    setUser(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        const res = await loginApi({ username, password });
        setUser(res.data.data);
    };

    const logout = async () => {
        await logoutApi();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};