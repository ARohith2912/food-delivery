import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../services/authService";

const AuthContext = createContext(null);

const readUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readUser);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const isAuthenticated = !!user;

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authService.login({ email, password });

            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            setUser(response.data.user);

            toast.success(response.data.message || "Login Successful");

            if (response.data.user.role === "owner") {
                navigate("/owner");
            } else if (response.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }

            return response.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || "Login Failed");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setLoading(true);
        try {
            const response = await authService.register(data);
            toast.success(response.data.message || "Registered Successfully");
            navigate("/login");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await authService.logout(refreshToken);
            }
        } catch {
            // ignore network errors on logout
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setUser(null);
            navigate("/login");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                register,
                logout,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
