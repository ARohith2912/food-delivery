import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import restaurantService from "../../services/restaurantService";
import categoryService from "../../services/categoryService";
import Loader from "../../components/Loader/Loader";
import { getImageUrl } from "../../utils/helpers";
import "./Restaurants.css";

function Restaurants() {
    const [restaurants, setRestaurants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category") || "";

    useEffect(() => {
        const load = async () => {
            try {
                const [restaurantsRes, categoriesRes] = await Promise.all([
                    restaurantService.getAll(),
                    categoryService.getAll()
                ]);

                setRestaurants(restaurantsRes.data || []);
                setCategories(categoriesRes.data || []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // Restaurant ids that have the selected category (categories are scoped per restaurant)
    const restaurantIdsForCategory = useMemo(() => {
        if (!categoryId) return null;

        const selected = categories.find(
            (c) => String(c.id) === String(categoryId)
        );

        if (!selected) return null;

        return new Set(
            categories
                .filter((c) => c.category_name === selected.category_name)
                .map((c) => c.restaurant_id)
        );
    }, [categoryId, categories]);

    const filteredRestaurants = restaurants.filter((restaurant) => {
        const matchesSearch = search
            ? restaurant.restaurant_name
                  .toLowerCase()
                  .includes(search.toLowerCase())
            : true;

        const matchesCategory = restaurantIdsForCategory
            ? restaurantIdsForCategory.has(restaurant.id)
            : true;

        return matchesSearch && matchesCategory;
    });

    const handleSearchChange = (event) => {
        const value = event.target.value;
        const next = new URLSearchParams(searchParams);

        if (value) {
            next.set("search", value);
        } else {
            next.delete("search");
        }

        setSearchParams(next);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="restaurants-page">
            <h1>Restaurants</h1>

            <input
                type="text"
                className="restaurants-search"
                placeholder="Search restaurants..."
                value={search}
                onChange={handleSearchChange}
            />

            {categoryId && (
                <button
                    className="clear-filter"
                    onClick={() => setSearchParams({})}
                >
                    Clear category filter ✕
                </button>
            )}

            {filteredRestaurants.length === 0 ? (
                <p className="empty-message">No restaurants match your search.</p>
            ) : (
                <div className="restaurant-grid">
                    {filteredRestaurants.map((restaurant) => (
                        <Link
                            key={restaurant.id}
                            to={`/restaurants/${restaurant.id}`}
                            className="restaurant-link"
                        >
                            <div className="restaurant-card">
                                <img
                                    src={getImageUrl(restaurant.image)}
                                    alt={restaurant.restaurant_name}
                                />
                                <h3>{restaurant.restaurant_name}</h3>
                                <p>{restaurant.address}</p>
                                {Number(restaurant.rating) > 0 && (
                                    <p className="rating">⭐ {restaurant.rating}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Restaurants;
