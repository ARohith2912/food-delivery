import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import foodService from "../../services/foodService";
import restaurantService from "../../services/restaurantService";
import Loader from "../../components/Loader/Loader";
import { getImageUrl, formatCurrency } from "../../utils/helpers";
import "./Search.css";

function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [foods, setFoods] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantMap, setRestaurantMap] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setFoods([]);
            setRestaurants([]);
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const [foodsRes, restaurantsRes] = await Promise.all([
                    foodService.getAll({ search: query, limit: 50 }),
                    restaurantService.getAll()
                ]);

                const allRestaurants = restaurantsRes.data || [];
                const map = {};
                allRestaurants.forEach((r) => {
                    map[r.id] = r.restaurant_name;
                });
                setRestaurantMap(map);

                setFoods(foodsRes.data || []);

                const matchingRestaurants = allRestaurants.filter((r) =>
                    r.restaurant_name.toLowerCase().includes(query.toLowerCase())
                );
                setRestaurants(matchingRestaurants);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [query]);

    if (loading) {
        return <Loader />;
    }

    const hasResults = foods.length > 0 || restaurants.length > 0;

    return (
        <div className="search-page">
            <h1>Search results for "{query}"</h1>

            {!hasResults && (
                <p className="empty-message">
                    No dishes or restaurants matched "{query}".
                </p>
            )}

            {restaurants.length > 0 && (
                <section>
                    <h2>Restaurants</h2>
                    <div className="restaurant-grid">
                        {restaurants.map((restaurant) => (
                            <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`} className="restaurant-link">
                                <div className="restaurant-card">
                                    <img src={getImageUrl(restaurant.image)} alt={restaurant.restaurant_name} />
                                    <h3>{restaurant.restaurant_name}</h3>
                                    <p>{restaurant.address}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {foods.length > 0 && (
                <section>
                    <h2>Food Items</h2>
                    <div className="food-grid">
                        {foods.map((food) => (
                            <Link key={food.id} to={`/restaurants/${food.restaurant_id}`} className="food-link">
                                <div className="food-card">
                                    <img src={getImageUrl(food.image)} alt={food.food_name} />
                                    <h3>{food.food_name}</h3>
                                    <p className="price">{formatCurrency(food.price)}</p>
                                    <p className="from-restaurant">
                                        from {restaurantMap[food.restaurant_id] || "a restaurant"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default Search;