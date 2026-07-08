import api from "../api/api";

// data: { order_id, payment_method: "COD" | "ONLINE" }
const makePayment = (data) => api.post("/payments", data);

const getAll = () => api.get("/payments");

const getById = (id) => api.get(`/payments/${id}`);

const updateStatus = (id, payment_status) =>
    api.patch(`/payments/${id}/status`, { payment_status });

export default {
    makePayment,
    getAll,
    getById,
    updateStatus
};
