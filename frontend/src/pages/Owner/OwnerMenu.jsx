import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import categoryService from "../../services/categoryService";
import foodService from "../../services/foodService";
import { getImageUrl, formatCurrency } from "../../utils/helpers";

const emptyFood = {
  category_id: "",
  food_name: "",
  description: "",
  price: "",
  image: null,
};

function OwnerMenu({ restaurantId }) {
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [foodForm, setFoodForm] = useState(emptyFood);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadMenu = async () => {
    try {
      const [categoriesRes, foodsRes] = await Promise.all([
        categoryService.getAll(restaurantId),
        foodService.getAll({ restaurant: restaurantId, limit: 200 }),
      ]);
      setCategories(categoriesRes.data || []);
      setFoods(foodsRes.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  // ---------- Categories ----------
  const handleAddCategory = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await categoryService.create({
        restaurant_id: restaurantId,
        category_name: newCategory.trim(),
      });
      setNewCategory("");
      toast.success("Category Added");
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleUpdateCategory = async (id) => {
    try {
      await categoryService.update(id, { category_name: editingCategoryName });
      setEditingCategoryId(null);
      toast.success("Category Updated");
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Foods in it will lose their category.")) return;
    try {
      await categoryService.remove(id);
      toast.success("Category Deleted");
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  // ---------- Foods ----------
  const handleFoodChange = (event) => {
    const { name, value, files } = event.target;
    setFoodForm({ ...foodForm, [name]: files ? files[0] : value });
  };

  const resetFoodForm = () => {
    setFoodForm(emptyFood);
    setEditingFoodId(null);
    setShowFoodForm(false);
  };

  const handleFoodSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingFoodId) {
        await foodService.update(editingFoodId, {
          food_name: foodForm.food_name,
          description: foodForm.description,
          price: foodForm.price,
          category_id: foodForm.category_id || undefined,
          available: true,
          image: foodForm.image || undefined, // Sends the new file asset if changed
        });
        toast.success("Food Updated");
      } else {
        await foodService.create({
          restaurant_id: restaurantId,
          category_id: foodForm.category_id || undefined,
          food_name: foodForm.food_name,
          description: foodForm.description,
          price: foodForm.price,
          image: foodForm.image,
        });
        toast.success("Food Added");
      }
      resetFoodForm();
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save food");
    } finally {
      setSaving(false);
    }
  };

  const handleEditFood = (food) => {
    setFoodForm({
      category_id: food.category_id || "",
      food_name: food.food_name,
      description: food.description || "",
      price: food.price,
      image: null, // Keep null until user picks a replacement image file
    });
    setEditingFoodId(food.id);
    setShowFoodForm(true);
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm("Delete this food item?")) return;
    try {
      await foodService.remove(id);
      toast.success("Food Deleted");
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete food");
    }
  };

  const toggleAvailability = async (food) => {
    try {
      await foodService.update(food.id, {
        food_name: food.food_name,
        description: food.description,
        price: food.price,
        category_id: food.category_id || undefined,
        available: !food.available,
      });
      loadMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update food");
    }
  };

  if (loading) {
    return <p>Loading menu...</p>;
  }

  return (
    <div className="owner-menu">
      <section className="owner-section">
        <h2>Categories</h2>
        <form className="inline-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            placeholder="New category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
        {categories.length === 0 ? (
          <p className="empty-message">No categories yet.</p>
        ) : (
          <div className="category-chip-list">
            {categories.map((category) => (
              <div className="category-chip" key={category.id}>
                {editingCategoryId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                    />
                    <button onClick={() => handleUpdateCategory(category.id)}> ✓ </button>
                    <button onClick={() => setEditingCategoryId(null)}> ✕ </button>
                  </>
                ) : (
                  <>
                    <span>{category.category_name}</span>
                    <button
                      onClick={() => {
                        setEditingCategoryId(category.id);
                        setEditingCategoryName(category.category_name);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)}> Delete </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="owner-section">
        <div className="section-header">
          <h2>Food Items</h2>
          <button
            className="add-btn"
            onClick={() => {
              if (showFoodForm) {
                resetFoodForm();
              } else {
                setShowFoodForm(true);
              }
            }}
          >
            {showFoodForm ? "Close" : "Add Food"}
          </button>
        </div>

        {showFoodForm && (
          <form className="food-form" onSubmit={handleFoodSubmit}>
            <input
              type="text"
              name="food_name"
              placeholder="Food Name"
              value={foodForm.food_name}
              onChange={handleFoodChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={foodForm.description}
              onChange={handleFoodChange}
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              min="0"
              step="0.01"
              value={foodForm.price}
              onChange={handleFoodChange}
              required
            />

            <select name="category_id" value={foodForm.category_id} onChange={handleFoodChange}>
              <option value="">No Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>

            <input type="file" name="image" accept="image/*" onChange={handleFoodChange} />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingFoodId ? "Update Food" : "Add Food"}
            </button>
          </form>
        )}

        {foods.length === 0 ? (
          <p className="empty-message">No food items yet.</p>
        ) : (
          <div className="owner-food-grid">
            {foods.map((food) => (
              <div className="owner-food-card" key={food.id}>
                <img src={getImageUrl(food.image)} alt={food.food_name} />
                <h4>{food.food_name}</h4>
                <p>{formatCurrency(food.price)}</p>
                <p className={`availability ${food.available ? "yes" : "no"}`}>
                  {food.available ? "Available" : "Unavailable"}
                </p>
                <div className="owner-food-actions">
                  <button onClick={() => handleEditFood(food)}>Edit</button>
                  <button onClick={() => toggleAvailability(food)}>
                    {food.available ? "Mark Unavailable" : "Mark Available"}
                  </button>
                  <button onClick={() => handleDeleteFood(food.id)}> Delete </button>
                </div>
              </div>
            ))}
          </div>

                )}
            </section>
        </div>
    );
}

export default OwnerMenu;
