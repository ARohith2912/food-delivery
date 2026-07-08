import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://food-delivery-2-xsq0.onrender.com/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    pendingQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't try to refresh for the auth endpoints themselves
        const isAuthEndpoint =
            originalRequest?.url?.includes("/users/login") ||
            originalRequest?.url?.includes("/users/register") ||
            originalRequest?.url?.includes("/users/refresh-token");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${BASE_URL}/users/refresh-token`,
                    { refreshToken }
                );

                const newAccessToken = response.data.accessToken;

                localStorage.setItem("accessToken", newAccessToken);
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
