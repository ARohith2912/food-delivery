import api from "../api/api";

// params: { search, page, limit, category, restaurant, available, sort }
const getAll = (params = {}) => api.get("/foods", { params });

const getById = (id) => api.get(`/foods/${id}`);

// data: { restaurant_id, category_id, food_name, description, price, image(File) }
const create = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    return api.post("/foods", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
};

// Note: backend updateFood does not accept a new image file, only text fields
const update = (id, data) => api.put(`/foods/${id}`, data);

const remove = (id) => api.delete(`/foods/${id}`);

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
