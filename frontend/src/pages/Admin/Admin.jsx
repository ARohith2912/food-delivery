import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import adminService from "../../services/adminService";
import orderService from "../../services/orderService";
import Loader from "../../components/Loader/Loader";
import {
    formatCurrency,
    formatDate,
    statusLabel,
    ORDER_STATUSES
} from "../../utils/helpers";
import "./Admin.css";

function Admin() {
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const loadData = async () => {
        try {
            const [statsRes, ordersRes] = await Promise.all([
                adminService.getStats(),
                orderService.getAll()
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data?.orders || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStatusChange = async (id, status) => {
        setUpdatingId(id);
        try {
            await orderService.updateStatus(id, status);
            toast.success("Order status updated");
            loadData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="admin">
            <h1>Admin Dashboard</h1>

            <div className="stat-cards">
                <div className="stat-card">
                    <span className="stat-label">Total Users</span>
                    <span className="stat-value">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Foods</span>
                    <span className="stat-value">{stats?.totalFoods ?? 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Orders</span>
                    <span className="stat-value">{stats?.totalOrders ?? 0}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">
                        {formatCurrency(stats?.totalRevenue)}
                    </span>
                </div>
            </div>

            {stats?.orderStatus?.length > 0 && (
                <div className="status-breakdown">
                    <h2>Orders by Status</h2>
                    <div className="status-bars">
                        {stats.orderStatus.map((s) => (
                            <div className="status-bar-row" key={s.status}>
                                <span className={`status ${s.status}`}>
                                    {statusLabel(s.status)}
                                </span>
                                <span className="status-count">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2>All Orders</h2>

            {orders.length === 0 ? (
                <p className="empty-message">No orders yet.</p>
            ) : (
                <div className="admin-orders">
                    {orders.map((order) => (
                        <div className="admin-order-card" key={order.id}>
                            <div className="admin-order-top">
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
                            <p>
                                <strong>Customer:</strong> {order.name} ({order.email})
                            </p>
                            <p>
                                <strong>Total:</strong> {formatCurrency(order.total_amount)}
                            </p>
                            <p>
                                <strong>Date:</strong> {formatDate(order.created_at)}
                            </p>
                            <p>
                                <strong>Payment:</strong> {order.payment_method}
                            </p>

                            <div className="admin-order-actions">
                                <label>Update Status:</label>
                                <select
                                    value={order.status}
                                    disabled={updatingId === order.id}
                                    onChange={(e) =>
                                        handleStatusChange(order.id, e.target.value)
                                    }
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
            )}
        </div>
    );
}

export default Admin;
