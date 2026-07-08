import "./Navbar.css";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const handleSearch = (event) => {
        event.preventDefault();
        if (!search.trim()) return;
        navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">🍔 Food Delivery</Link>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/restaurants">Restaurants</Link></li>
                {isAuthenticated && <li><Link to="/orders">Orders</Link></li>}
                {isAuthenticated && user?.role === "owner" && (
                    <li><Link to="/owner">Owner Dashboard</Link></li>
                )}
                {isAuthenticated && user?.role === "admin" && (
                    <li><Link to="/admin">Admin Dashboard</Link></li>
                )}
            </ul>

            <div className="nav-right">
                <form className="nav-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search food..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" aria-label="Search">🔍</button>
                </form>

                {(!isAuthenticated || user?.role === "customer") && (
                    <Link to="/cart" className="cart">
                        <FaShoppingCart />
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>
                )}

                {isAuthenticated ? (
                    <div className="user-menu">
                        <Link to="/profile" className="user">
                            <FaUserCircle />
                            <span>{user?.name || "Account"}</span>
                        </Link>
                        <button className="logout-link" onClick={logout}>Logout</button>
                    </div>
                ) : (
                    <Link to="/login" className="user">
                        <FaUserCircle />
                        <span>Login</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
export default Navbar;