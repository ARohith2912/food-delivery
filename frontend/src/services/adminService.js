import api from "../api/api";

const getStats = () => api.get("/admin/dashboard/stats");

export default {
    getStats
};
