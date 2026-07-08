import api from "../api/api";

const getCart = () => api.get("/cart");

const addToCart = (food_id, quantity = 1) =>
    api.post("/cart", { food_id, quantity });

const updateQuantity = (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity });

const removeItem = (cartItemId) => api.delete(`/cart/${cartItemId}`);

const clearCart = () => api.delete("/cart");

export default {
    getCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart
};
