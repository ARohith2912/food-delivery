import api from "../api/api";

const getAll = () => api.get("/addresses");

const getById = (id) => api.get(`/addresses/${id}`);

const create = (data) => api.post("/addresses", data);

const update = (id, data) => api.put(`/addresses/${id}`, data);

const remove = (id) => api.delete(`/addresses/${id}`);

const setDefault = (id) => api.patch(`/addresses/${id}/default`);

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    setDefault
};
