import api from "../api/api";

const getAll = () => api.get("/restaurants");

const getById = (id) => api.get(`/restaurants/${id}`);

const toFormData = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });
    return formData;
};

// data: { restaurant_name, description, address, image?(File) }
const create = (data) =>
    api.post("/restaurants", toFormData(data), {
        headers: { "Content-Type": "multipart/form-data" }
    });

const update = (id, data) =>
    api.put(`/restaurants/${id}`, toFormData(data), {
        headers: { "Content-Type": "multipart/form-data" }
    });

const remove = (id) => api.delete(`/restaurants/${id}`);

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
