import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import addressService from "../../services/addressService";
import Loader from "../../components/Loader/Loader";
import "./Address.css";

const emptyForm = {
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "home",
    is_default: false
};

function Address() {

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    async function fetchAddresses() {

        try {

            const response = await addressService.getAll();

            setAddresses(response.data?.addresses || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleChange = (event) => {

        const { name, value, type, checked } = event.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });

    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (event) => {

        event.preventDefault();
        setSaving(true);

        try {

            if (editingId) {
                await addressService.update(editingId, formData);
                toast.success("Address Updated Successfully");
            } else {
                await addressService.create(formData);
                toast.success("Address Added Successfully");
            }

            resetForm();
            fetchAddresses();

        } catch (error) {

            console.log(error);
            toast.error(
                error.response?.data?.message || "Failed To Save Address"
            );

        } finally {
            setSaving(false);
        }

    };

    const handleEdit = (address) => {
        setFormData({
            full_name: address.full_name || "",
            phone: address.phone || "",
            address_line1: address.address_line1 || "",
            address_line2: address.address_line2 || "",
            landmark: address.landmark || "",
            city: address.city || "",
            state: address.state || "",
            pincode: address.pincode || "",
            address_type: address.address_type || "home",
            is_default: !!address.is_default
        });
        setEditingId(address.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this address?")) return;

        try {
            await addressService.remove(id);
            toast.success("Address Deleted Successfully");
            fetchAddresses();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed To Delete Address"
            );
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressService.setDefault(id);
            toast.success("Default Address Updated");
            fetchAddresses();
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed To Update Default"
            );
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (

        <div className="address-container">

            <div className="address-header">

                <h1>My Addresses</h1>

                <button
                    className="add-btn"
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                >
                    {showForm ? "Close" : "Add Address"}
                </button>

            </div>

            {
                showForm && (

                    <form
                        className="address-form"
                        onSubmit={handleSubmit}
                    >

                        <input
                            type="text"
                            name="full_name"
                            placeholder="Full Name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="address_line1"
                            placeholder="Address Line 1"
                            value={formData.address_line1}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="address_line2"
                            placeholder="Address Line 2 (optional)"
                            value={formData.address_line2}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="landmark"
                            placeholder="Landmark (optional)"
                            value={formData.landmark}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="address_type"
                            value={formData.address_type}
                            onChange={handleChange}
                        >
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                        </select>

                        <label className="default-check">
                            <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleChange}
                            />
                            Set as default address
                        </label>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                ? "Update Address"
                                : "Save Address"}
                        </button>

                    </form>

                )
            }

            {
                addresses.length === 0 ? (

                    <h2 className="message">
                        No Address Found
                    </h2>

                ) : (

                    addresses.map((address) => (

                        <div
                            className="address-card"
                            key={address.id}
                        >
                            <div className="address-top">

                                <h3>{address.full_name}</h3>

                                {
                                    address.is_default && (
                                        <span className="default-badge">
                                            Default
                                        </span>
                                    )
                                }

                                <span className="type-badge">
                                    {address.address_type}
                                </span>

                            </div>

                            <p>
                                <strong>Phone:</strong> {address.phone}
                            </p>

                            <p>
                                <strong>Address:</strong>{" "}
                                {address.address_line1}
                                {address.address_line2 ? `, ${address.address_line2}` : ""}
                                {address.landmark ? `, near ${address.landmark}` : ""}
                            </p>

                            <p>
                                {address.city}, {address.state} - {address.pincode}
                            </p>

                            <div className="address-actions">

                                <button
                                    className="edit-btn"
                                    onClick={() => handleEdit(address)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(address.id)}
                                >
                                    Delete
                                </button>
                                {
                                    !address.is_default && (
                                        <button
                                            className="default-btn"
                                            onClick={() => handleSetDefault(address.id)}
                                        >
                                            Set Default
                                        </button>
                                    )
                                }
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    );
}

export default Address;
