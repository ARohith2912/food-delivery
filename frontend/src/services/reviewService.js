import api from "../api/api";

const getAll = () => api.get("/reviews");

const getById = (id) => api.get(`/reviews/${id}`);

// data: { order_id, restaurant_id, food_id, rating, review }
const create = (data) => api.post("/reviews", data);

const update = (id, data) => api.put(`/reviews/${id}`, data);

const remove = (id) => api.delete(`/reviews/${id}`);

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
