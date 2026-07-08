import { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import orderService from '../../services/orderService';
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate, statusLabel } from "../../utils/helpers";
import './Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const navigate = useNavigate();

  async function fetchOrders() {
    try {
      const response = await orderService.getAll();
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.log(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <h2 className="message">No Orders Found</h2>
        {user?.role === "customer" && (
          <Link to="/restaurants" className="browse-link">
            Browse Restaurants
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>{user?.role === "customer" ? "My Orders" : "Orders"}</h1>
      {orders.map((ord) => (
        <div className="order-card" key={ord.id} onClick={() => navigate(`/orders/${ord.id}`)}>
          <div className="order-header">
            <h3>Order #{ord.id}</h3>
            <span className={`status ${ord.status}`}>
              {statusLabel(ord.status)}
            </span>
          </div>
          {user?.role !== "customer" && ord.name && (
            <p>
              <strong>Customer:</strong> {ord.name} ({ord.email})
            </p>
          )}
          <p>
            <strong>Total:</strong> {formatCurrency(ord.total_amount)}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(ord.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Orders;
