import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(

    <BrowserRouter>

        <AuthProvider>
            <CartProvider>
                <App />
            </CartProvider>
        </AuthProvider>

        <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="colored"
        />

    </BrowserRouter>

);
