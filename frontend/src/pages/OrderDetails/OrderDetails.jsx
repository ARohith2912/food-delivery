import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import orderService from "../../services/orderService";
import reviewService from "../../services/reviewService";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import {
    formatCurrency,
    formatDate,
    statusLabel,
    ORDER_STATUSES,
    getImageUrl
} from "../../utils/helpers";
import "./OrderDetails.css";

function OrderDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [reviewDrafts, setReviewDrafts] = useState({});
    const [submittingReview, setSubmittingReview] = useState(null);

    const fetchOrder = async () => {
        try {
            const response = await orderService.getById(id);
            setOrder(response.data.order);
            setItems(response.data.items || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const canManageStatus = user?.role === "owner" || user?.role === "admin";
    const canCancel =
        user?.role === "customer" &&
        order &&
        !["delivered", "cancelled"].includes(order.status);
    const canReview =
        user?.role === "customer" && order?.status === "delivered";

    const handleStatusChange = async (status) => {
        setUpdating(true);
        try {
            await orderService.updateStatus(id, status);
            toast.success("Order status updated");
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Cancel this order?")) return;

        setUpdating(true);
        try {
            await orderService.cancelOrder(id);
            toast.success("Order cancelled");
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        } finally {
            setUpdating(false);
        }
    };

    const handleReviewChange = (foodId, field, value) => {
        setReviewDrafts((prev) => ({
            ...prev,
            [foodId]: { ...prev[foodId], [field]: value }
        }));
    };

    const handleSubmitReview = async (item) => {
        const draft = reviewDrafts[item.food_id] || {};
        const rating = Number(draft.rating || 5);

        setSubmittingReview(item.food_id);
        try {
            await reviewService.create({
                order_id: Number(id),
                restaurant_id: item.restaurant_id,
                food_id: item.food_id,
                rating,
                review: draft.review || ""
            });
            toast.success("Review submitted, thank you!");
            setReviewDrafts((prev) => ({
                ...prev,
                [item.food_id]: { ...prev[item.food_id], submitted: true }
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!order) {
        return <h2 className="message">Order Not Found</h2>;
    }

    return (

        <div className="order-details-container">

            <h1>Order Details</h1>

            <div className="order-summary">

                <p><strong>Order ID :</strong> {order.id}</p>

                <p>
                    <strong>Status :</strong>{" "}
                    <span className={`status ${order.status}`}>
                        {statusLabel(order.status)}
                    </span>
                </p>

                <p>
                    <strong>Date :</strong>{" "}
                    {formatDate(order.created_at)}
                </p>

                <p><strong>Total :</strong> {formatCurrency(order.total_amount)}</p>

                <p><strong>Payment Method :</strong> {order.payment_method}</p>

                <p><strong>Delivery Address :</strong> {order.delivery_address}</p>

            </div>

            {canManageStatus && (
                <div className="status-manager">
                    <label htmlFor="status-select"><strong>Update Status:</strong></label>
                    <select
                        id="status-select"
                        value={order.status}
                        disabled={updating}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {statusLabel(status)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {canCancel && (
                <button
                    className="cancel-order-btn"
                    disabled={updating}
                    onClick={handleCancel}
                >
                    Cancel Order
                </button>
            )}

            <h2>Items</h2>

            <div className="items-list">

                {items.map((item) => {
                    const draft = reviewDrafts[item.food_id] || {};

                    return (
                        <div className="item-card" key={item.id}>
                            <div className="item-row">
                                <img
                                    src={getImageUrl(item.image)}
                                    alt={item.food_name}
                                    className="item-thumb"
                                />
                                <div>
                                    <h3>{item.food_name}</h3>
                                    <p>Price : {formatCurrency(item.price)}</p>
                                    <p>Quantity : {item.quantity}</p>
                                    <p>
                                        Subtotal :{" "}
                                        {formatCurrency(item.price * item.quantity)}
                                    </p>
                                </div>
                            </div>

                            {canReview && !draft.submitted && (
                                <div className="review-form">
                                    <label>
                                        Rating:
                                        <select
                                            value={draft.rating || 5}
                                            onChange={(e) =>
                                                handleReviewChange(
                                                    item.food_id,
                                                    "rating",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {[5, 4, 3, 2, 1].map((r) => (
                                                <option key={r} value={r}>
                                                    {r} ⭐
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <textarea
                                        placeholder="Write a review (optional)"
                                        value={draft.review || ""}
                                        onChange={(e) =>
                                            handleReviewChange(
                                                item.food_id,
                                                "review",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <button
                                        disabled={submittingReview === item.food_id}
                                        onClick={() => handleSubmitReview(item)}
                                    >
                                        {submittingReview === item.food_id
                                            ? "Submitting..."
                                            : "Submit Review"}
                                    </button>
                                </div>
                            )}

                            {draft.submitted && (
                                <p className="review-thanks">
                                    Thanks for your review!
                                </p>
                            )}
                        </div>
                    );
                })}

            </div>

            <button className="back-btn" onClick={() => navigate("/orders")}>
                Back to Orders
            </button>

        </div>

    );

}

export default OrderDetails;
