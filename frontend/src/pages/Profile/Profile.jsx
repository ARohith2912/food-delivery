import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
    const { user, logout } = useAuth();

    if (!user) {
        return <h2 className="message">No profile data found.</h2>;
    }

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <div className="profile-card">
                <div className="profile-row">
                    <strong>Name:</strong>
                    <span>{user.name}</span>
                </div>
                <div className="profile-row">
                    <strong>Email:</strong>
                    <span>{user.email}</span>
                </div>
                <div className="profile-row">
                    <strong>Role:</strong>
                    <span>{user.role}</span>
                </div>

                <div className="profile-links">
                    <Link to="/orders">My Orders</Link>
                    {user.role === "customer" && (
                        <Link to="/address">My Addresses</Link>
                    )}
                    {user.role === "owner" && (
                        <Link to="/owner">Owner Dashboard</Link>
                    )}
                    {user.role === "admin" && (
                        <Link to="/admin">Admin Dashboard</Link>
                    )}
                </div>

                <button className="logout-btn" onClick={logout}>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Profile;
