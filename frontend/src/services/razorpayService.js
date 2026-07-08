import api from "../api/api";

const createOrder = (order_id) =>
    api.post("/payment/razorpay/create-order", { order_id });

const verifyPayment = (data) => api.post("/payment/razorpay/verify", data);

export default {
    createOrder,
    verifyPayment
};
