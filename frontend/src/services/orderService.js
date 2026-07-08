import api from "../api/api";

// data: { delivery_address, payment_method }
const placeOrder = (data) => api.post("/orders/place", data);

const getAll = () => api.get("/orders");

const getById = (id) => api.get(`/orders/${id}`);

const updateStatus = (id, status) =>
    api.put(`/orders/${id}/status`, { status });

const cancelOrder = (id) => api.delete(`/orders/${id}`);

export default {
    placeOrder,
    getAll,
    getById,
    updateStatus,
    cancelOrder
};
