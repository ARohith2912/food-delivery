import { createContext, useContext, useCallback, useEffect, useState } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated, user } = useAuth();
    const [cartCount, setCartCount] = useState(0);

    const refreshCartCount = useCallback(async () => {
        if (!isAuthenticated || user?.role !== "customer") {
            setCartCount(0);
            return;
        }

        try {
            const response = await cartService.getCart();
            const items = response.data?.cart || [];
            const count = items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0
            );
            setCartCount(count);
        } catch {
            setCartCount(0);
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        refreshCartCount();
    }, [refreshCartCount]);

    return (
        <CartContext.Provider value={{ cartCount, refreshCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
