import "./RestaurantDetails.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import restaurantService from "../../services/restaurantService";
import foodService from "../../services/foodService";
import categoryService from "../../services/categoryService";
import reviewService from "../../services/reviewService";
import cartService from "../../services/cartService";
import Loader from "../../components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getImageUrl, formatCurrency } from "../../utils/helpers";

function RestaurantDetails() {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const { refreshCartCount } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [restaurantRes, foodsRes, categoriesRes, reviewsRes] =
                    await Promise.all([
                        restaurantService.getById(id),
                        foodService.getAll({ restaurant: id, limit: 100 }),
                        categoryService.getAll(id),
                        reviewService.getAll()
                    ]);

                setRestaurant(restaurantRes.data);
                setFoods(foodsRes.data || []);
                setCategories(categoriesRes.data || []);

                const restaurantReviews = (reviewsRes.data?.reviews || []).filter(
                    (r) => r.restaurant_name === restaurantRes.data.restaurant_name
                );
                setReviews(restaurantReviews);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const addToCart = async (foodId) => {
        if (!isAuthenticated) {
            toast.info("Please login to add items to your cart");
            return;
        }

        if (user?.role !== "customer") {
            toast.info("Only customers can order food");
            return;
        }

        try {
            await cartService.addToCart(foodId, 1);
            toast.success("Food Added To Cart");
            refreshCartCount();
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable To Add Food");
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!restaurant) {
        return <h2 className="message">Restaurant Not Found</h2>;
    }

    const visibleFoods =
        activeCategory === "all"
            ? foods
            : foods.filter((f) => String(f.category_id) === String(activeCategory));

    const avgRating =
        reviews.length > 0
            ? (
                  reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
                  reviews.length
              ).toFixed(1)
            : null;

    return (
        <div className="restaurant-details">
            <img
                src={getImageUrl(restaurant.image)}
                alt={restaurant.restaurant_name}
                className="restaurant-banner"
            />
            <h1>{restaurant.restaurant_name}</h1>
            <p>{restaurant.description}</p>
            <p>Address: {restaurant.address}</p>
            {avgRating && (
                <p className="avg-rating">
                    ⭐ {avgRating} ({reviews.length} review
                    {reviews.length > 1 ? "s" : ""})
                </p>
            )}

            <h2>Menu</h2>

            {categories.length > 0 && (
                <div className="category-tabs">
                    <button
                        className={activeCategory === "all" ? "active" : ""}
                        onClick={() => setActiveCategory("all")}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={
                                String(activeCategory) === String(category.id)
                                    ? "active"
                                    : ""
                            }
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.category_name}
                        </button>
                    ))}
                </div>
            )}

            {visibleFoods.length === 0 ? (
                <p className="empty-message">No dishes found in this category.</p>
            ) : (
                <div className="food-grid">
                    {visibleFoods.map((food) => (
                        <div key={food.id} className="food-card">
                            <img
                                src={getImageUrl(food.image)}
                                alt={food.food_name}
                            />
                            <h3>{food.food_name}</h3>
                            <p className="price">{formatCurrency(food.price)}</p>
                            <p className="description">{food.description}</p>
                            <button
                                disabled={!food.available}
                                onClick={() => addToCart(food.id)}
                            >
                                {food.available ? "Add To Cart" : "Unavailable"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {reviews.length > 0 && (
                <div className="reviews-section">
                    <h2>Reviews</h2>
                    {reviews.map((review) => (
                        <div className="review-card" key={review.id}>
                            <div className="review-top">
                                <strong>{review.name}</strong>
                                <span>⭐ {review.rating}/5</span>
                            </div>
                            <p className="review-food">on {review.food_name}</p>
                            {review.review && <p>{review.review}</p>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default RestaurantDetails;
