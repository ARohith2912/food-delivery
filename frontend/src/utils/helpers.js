export const API_ORIGIN = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

// Food/restaurant images are stored as filenames and served from /uploads/<filename>
export const getImageUrl = (image, fallback = "/food-placeholder.svg") => {
    if (!image) return fallback;
    if (image.endsWith(".jpg")) {
        return image;
    }
    return `${API_ORIGIN}/uploads/${image}`;
};

export const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `₹${number.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

export const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled"
];

export const statusLabel = (status) => {
    if (!status) return "";
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
