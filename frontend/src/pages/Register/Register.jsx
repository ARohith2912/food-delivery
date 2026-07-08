import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {

    const { register, loading } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "customer"
    });

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {
            await register(formData);
        } catch {
            // toast already handled in AuthContext
        }

    };

    return (

        <div className="register-container">

            <form
                className="register-form"
                onSubmit={handleSubmit}
            >

                <h2>Register</h2>

                <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                />

                <input
                    type="text"
                    name="phone"
                    placeholder="Enter Phone"
                    value={formData.phone}
                    onChange={handleChange}
                />

                <label className="role-label">I want to</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="customer">Order food (Customer)</option>
                    <option value="owner">Sell food (Restaurant Owner)</option>
                </select>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                <p>
                    Already have an account?
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </form>

        </div>

    );

}

export default Register;
