import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import cartService from "../../services/cartService";
import Loader from "../../components/Loader/Loader";
import { useCart } from "../../context/CartContext";
import { getImageUrl, formatCurrency } from "../../utils/helpers";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data?.cart || []);
      setTotal(response.data?.total || 0);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id, quantity) => {
    if (!id) return;
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    try {
      await cartService.updateQuantity(id, quantity);
      await fetchCart();
      refreshCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating quantity");
    }
  };

  const removeItem = async (id) => {
    if (!id) return;
    try {
      await cartService.removeItem(id);
      toast.success("Item removed from cart");
      await fetchCart();
      refreshCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error removing item");
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      toast.success("Cart cleared");
      await fetchCart();
      refreshCartCount();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error clearing cart");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="cart">
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Link to="/restaurants" className="browse-link">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <img src={getImageUrl(item.image)} alt={item.food_name} />
              <div className="cart-item-info">
                <h3>{item.food_name}</h3>
                <p>{formatCurrency(item.price)}</p>
                <div className="quantity-box">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="subtotal">
                  Subtotal: {formatCurrency(item.subtotal)}
                </p>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Remove Item
                </button>
              </div>
            </div>
          ))}

          <div className="cart-total">
            <h2>Total: {formatCurrency(total)}</h2>
            <div className="cart-actions">
              <button className="clear-btn" onClick={handleClearCart}>
                Clear Cart
              </button>
              <button onClick={() => navigate("/checkout")}>
                Proceed To Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
