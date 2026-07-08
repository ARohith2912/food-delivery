import "./Home.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import restaurantService from "../../services/restaurantService";
import categoryService from "../../services/categoryService";
import Loader from "../../components/Loader/Loader";
import { getImageUrl } from "../../utils/helpers";

function Home() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHome = async () => {
      try {
        const [categoriesRes, restaurantsRes] = await Promise.all([
          categoryService.getAll(),
          restaurantService.getAll()
        ]);

        setCategories(categoriesRes.data || []);
        setRestaurants(restaurantsRes.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  // De-duplicate categories by name since categories are per-restaurant
  const uniqueCategories = Array.from(
    new Map(categories.map((c) => [c.category_name, c])).values()
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>Delicious Food Delivered To Your Door</h1>
        <p>Order your favourite meals from nearby restaurants.</p>
        <Link to="/restaurants" className="hero-cta">
          Browse Restaurants
        </Link>
      </section>

      {uniqueCategories.length > 0 && (
        <section className="categories">
          <h2>Categories</h2>

          <div className="category-list">
            {uniqueCategories.map((category) => (
              <Link
                key={category.id}
                to={`/restaurants?category=${category.id}`}
                className="category-card"
              >
                {category.category_name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="restaurants">
        <h2>Featured Restaurants</h2>

        {restaurants.length === 0 ? (
          <p className="empty-message">No restaurants available yet.</p>
        ) : (
          <div className="restaurant-grid">
            {restaurants.slice(0, 6).map((restaurant) => (
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
      </section>
    </div>
  );
}

export default Home;
