import api from "../api/api";

const register = (data) => api.post("/users/register", data);

const login = (data) => api.post("/users/login", data);

const logout = (refreshToken) => api.post("/users/logout", { refreshToken });

const refreshToken = (refreshToken) =>
    api.post("/users/refresh-token", { refreshToken });

const getProfile = () => api.get("/users/profile");

export default {
    register,
    login,
    logout,
    refreshToken,
    getProfile
};
