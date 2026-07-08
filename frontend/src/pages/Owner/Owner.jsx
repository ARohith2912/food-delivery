import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import restaurantService from "../../services/restaurantService";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../utils/helpers";
import OwnerMenu from "./OwnerMenu";
import OwnerOrders from "./OwnerOrders";
import "./Owner.css";

const emptyRestaurant = {
    restaurant_name: "",
    description: "",
    address: "",
    image: null
};

function Owner() {
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState(emptyRestaurant);
    const [editingInfo, setEditingInfo] = useState(false);
    const [tab, setTab] = useState("menu");

    const loadRestaurant = async () => {
        try {
            const response = await restaurantService.getAll();
            const mine = (response.data || []).find(
                (r) => r.owner_id === user?.id
            );
            setRestaurant(mine || null);

            if (mine) {
                setFormData({
                    restaurant_name: mine.restaurant_name,
                    description: mine.description || "",
                    address: mine.address || ""
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurant();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleChange = (event) => {
        const { name, value, files } = event.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            if (restaurant) {
                await restaurantService.update(restaurant.id, formData);
                toast.success("Restaurant Updated");
            } else {
                await restaurantService.create(formData);
                toast.success("Restaurant Created Successfully");
            }
            setEditingInfo(false);
            loadRestaurant();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to save restaurant"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!restaurant || editingInfo) {
        return (
            <div className="owner">
                <h1>{restaurant ? "Edit Restaurant" : "Set Up Your Restaurant"}</h1>
                <form className="restaurant-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="restaurant_name"
                        placeholder="Restaurant Name"
                        value={formData.restaurant_name}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <textarea
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                    <label className="image-label">
                        Restaurant Photo{restaurant ? " (leave empty to keep current)" : ""}
                    </label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    {restaurant?.image && (
                        <img
                            src={getImageUrl(restaurant.image)}
                            alt={restaurant.restaurant_name}
                            className="current-image-preview"
                        />
                    )}
                    <div className="form-actions">
                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : restaurant ? "Update" : "Create Restaurant"}
                        </button>
                        {restaurant && (
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setEditingInfo(false)}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="owner">
            <div className="owner-header">
                <div className="owner-header-info">
                    <img
                        src={getImageUrl(restaurant.image)}
                        alt={restaurant.restaurant_name}
                        className="owner-restaurant-thumb"
                    />
                    <div>
                        <h1>{restaurant.restaurant_name}</h1>
                        <p>{restaurant.address}</p>
                        {Number(restaurant.rating) > 0 && (
                            <p className="rating">⭐ {restaurant.rating}</p>
                        )}
                    </div>
                </div>
                <button className="edit-info-btn" onClick={() => setEditingInfo(true)}>
                    Edit Restaurant Info
                </button>
            </div>

            <div className="owner-tabs">
                <button
                    className={tab === "menu" ? "active" : ""}
                    onClick={() => setTab("menu")}
                >
                    Menu
                </button>
                <button
                    className={tab === "orders" ? "active" : ""}
                    onClick={() => setTab("orders")}
                >
                    Orders
                </button>
            </div>

            {tab === "menu" ? (
                <OwnerMenu restaurantId={restaurant.id} />
            ) : (
                <OwnerOrders />
            )}
        </div>
    );
}

export default Owner;
