import api from "../api/api";

const getAll = (restaurantId) =>
    api.get("/categories", {
        params: restaurantId ? { restaurant: restaurantId } : {}
    });

const getById = (id) => api.get(`/categories/${id}`);

const create = (data) => api.post("/categories", data);

const update = (id, data) => api.put(`/categories/${id}`, data);

const remove = (id) => api.delete(`/categories/${id}`);

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
