import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import orderService from "../../services/orderService";
import { formatCurrency, formatDate, statusLabel, ORDER_STATUSES } from "../../utils/helpers";

function OwnerOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const navigate = useNavigate();

    const loadOrders = async () => {
        try {
            const response = await orderService.getAll();
            setOrders(response.data?.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, status);
            toast.success("Order status updated");
            loadOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <p>Loading orders...</p>;
    }

    if (orders.length === 0) {
        return <p className="empty-message">No orders yet for your restaurant.</p>;
    }

    return (
        <div className="owner-orders">
            {orders.map((order) => (
                <div className="owner-order-card" key={order.id}>
                    <div className="owner-order-top">
                        <h3
                            className="order-link"
                            onClick={() => navigate(`/orders/${order.id}`)}
                        >
                            Order #{order.id}
                        </h3>
                        <span className={`status ${order.status}`}>
                            {statusLabel(order.status)}
                        </span>
                    </div>
                    <p><strong>Customer:</strong> {order.name} ({order.email})</p>
                    <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                    <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                    <p><strong>Payment:</strong> {order.payment_method}</p>

                    <div className="owner-order-actions">
                        <label>Update Status:</label>
                        <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                            {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {statusLabel(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default OwnerOrders;
