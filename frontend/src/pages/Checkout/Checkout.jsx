import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import cartService from "../../services/cartService";
import addressService from "../../services/addressService";
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import razorpayService from "../../services/razorpayService";
import Loader from "../../components/Loader/Loader";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/helpers";
import "./Checkout.css";

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

function Checkout() {
    const navigate = useNavigate();
    const { refreshCartCount } = useCart();

    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [cartRes, addressRes] = await Promise.all([
                    cartService.getCart(),
                    addressService.getAll()
                ]);

                setCart(cartRes.data?.cart || []);
                setTotal(cartRes.data?.total || 0);

                const addressList = addressRes.data?.addresses || [];
                setAddresses(addressList);

                const defaultAddress = addressList.find((a) => a.is_default);
                setSelectedAddressId(
                    defaultAddress ? defaultAddress.id : addressList[0]?.id || ""
                );
            } catch (error) {
                console.log(error);
                toast.error("Failed to load checkout details");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const buildAddressText = (address) => {
        return [
            address.full_name,
            address.address_line1,
            address.address_line2,
            address.landmark,
            `${address.city}, ${address.state} - ${address.pincode}`,
            `Phone: ${address.phone}`
        ]
            .filter(Boolean)
            .join(", ");
    };

    const placeOrder = async () => {
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        const selectedAddress = addresses.find(
            (a) => String(a.id) === String(selectedAddressId)
        );

        if (!selectedAddress) {
            toast.error("Please select a delivery address");
            return;
        }

        setPlacing(true);

        try {
            const orderRes = await orderService.placeOrder({
                delivery_address: buildAddressText(selectedAddress),
                payment_method: paymentMethod
            });

            const orderId = orderRes.data.orderId;

            if (paymentMethod === "COD") {
                try {
                    await paymentService.makePayment({
                        order_id: orderId,
                        payment_method: "COD"
                    });
                } catch (paymentError) {
                    console.log(paymentError);
                }

                toast.success("Order placed successfully");
                refreshCartCount();
                navigate(`/orders/${orderId}`);
                return;
            }

            // ONLINE payment via Razorpay
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                toast.error("Unable to load payment gateway. Please try again.");
                setPlacing(false);
                return;
            }

            const razorRes = await razorpayService.createOrder(orderId);
            const { razorpay_order_id, amount, currency } = razorRes.data;

            const razorpay = new window.Razorpay({
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
                amount,
                currency,
                name: "Food Delivery",
                description: `Order #${orderId}`,
                order_id: razorpay_order_id,
                handler: async (response) => {
                    try {
                        await razorpayService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderId
                        });

                        toast.success("Payment successful, order confirmed");
                        refreshCartCount();
                        navigate(`/orders/${orderId}`);
                    } catch (verifyError) {
                        console.log(verifyError);
                        toast.error(
                            "Payment verification failed. Please contact support."
                        );
                        navigate(`/orders/${orderId}`);
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.info(
                            "Payment not completed. You can pay later from your order."
                        );
                        refreshCartCount();
                        navigate(`/orders/${orderId}`);
                    }
                },
                theme: { color: "#aa3bff" }
            });

            razorpay.open();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setPlacing(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (cart.length === 0) {
        return (
            <div className="checkout empty-checkout">
                <h2>Your cart is empty</h2>
                <Link to="/restaurants">Browse Restaurants</Link>
            </div>
        );
    }

    return (
        <div className="checkout">
            <h2>Checkout</h2>

            <section className="checkout-section">
                <div className="section-header">
                    <h3>Delivery Address</h3>
                    <Link to="/address">Manage Addresses</Link>
                </div>

                {addresses.length === 0 ? (
                    <p className="empty-message">
                        You have no saved addresses.{" "}
                        <Link to="/address">Add one</Link> to continue.
                    </p>
                ) : (
                    <div className="address-options">
                        {addresses.map((address) => (
                            <label className="address-option" key={address.id}>
                                <input
                                    type="radio"
                                    name="address"
                                    value={address.id}
                                    checked={
                                        String(selectedAddressId) === String(address.id)
                                    }
                                    onChange={() => setSelectedAddressId(address.id)}
                                />
                                <div>
                                    <strong>{address.full_name}</strong>{" "}
                                    <span className="tag">{address.address_type}</span>
                                    <p>
                                        {address.address_line1}
                                        {address.address_line2
                                            ? `, ${address.address_line2}`
                                            : ""}
                                        , {address.city}, {address.state} -{" "}
                                        {address.pincode}
                                    </p>
                                    <p>Phone: {address.phone}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </section>

            <section className="checkout-section">
                <h3>Payment Method</h3>
                <div className="payment-options">
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="COD"
                            checked={paymentMethod === "COD"}
                            onChange={() => setPaymentMethod("COD")}
                        />
                        Cash on Delivery
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="payment"
                            value="ONLINE"
                            checked={paymentMethod === "ONLINE"}
                            onChange={() => setPaymentMethod("ONLINE")}
                        />
                        Pay Online (Razorpay)
                    </label>
                </div>
            </section>

            <section className="checkout-section">
                <h3>Order Summary</h3>
                <div className="order-summary-list">
                    {cart.map((item) => (
                        <div className="summary-row" key={item.id}>
                            <span>
                                {item.food_name} x {item.quantity}
                            </span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                    ))}
                </div>
                <h3 className="checkout-total">Total: {formatCurrency(total)}</h3>
            </section>

            <button
                className="place-order-btn"
                onClick={placeOrder}
                disabled={placing || addresses.length === 0}
            >
                {placing ? "Placing Order..." : "Place Order"}
            </button>
        </div>
    );
}

export default Checkout;
