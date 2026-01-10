import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function StockCard({ item, isOwner }) {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);

    const {
        itemId,
        name,
        itemCode,
        brand,
        category,
        sellingPrice,
        costPrice,
        availableStock,
        baseUnit,
        minStock
    } = item;

    const isLowStock =
        minStock !== null &&
        availableStock !== null &&
        availableStock <= minStock;

    const stockValue =
        isOwner && costPrice != null && availableStock != null
            ? costPrice * availableStock
            : null;

    return (
        <div
            style={card(isLowStock, active)}
            onClick={() => setActive(a => !a)}
        >
            {/* NAME + CODE */}
            <div style={title}>
                {name} • {itemCode}
            </div>

            {/* BRAND + CATEGORY */}
            <div style={meta}>
                {brand} • {category}
            </div>

            {/* STOCK */}
            <div style={qty(isLowStock)}>
                {availableStock ?? 0} {baseUnit}
            </div>

            {/* MIN STOCK */}
            {minStock !== null && (
                <div style={min}>
                    Min: {minStock} {baseUnit}
                </div>
            )}

            {/* SELLING PRICE */}
            <div style={price}>
                Sell: ₹{sellingPrice}
            </div>

            {/* OWNER ONLY */}
            {isOwner && (
                <>
                    <div style={cost}>
                        Cost: ₹{costPrice}
                    </div>

                    <div style={value}>
                        💰 Stock Value: ₹{stockValue?.toFixed(2)}
                    </div>
                </>
            )}

            {/* LOW STOCK ALERT */}
            {isLowStock && (
                <div style={alert}>
                    ⚠ Low Stock
                </div>
            )}

            {/* ACTIONS — SHOWN ONLY WHEN ACTIVE */}
            {active && (
                <div
                    style={actions}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        style={editBtn}
                        onClick={() =>
                            navigate(`/items/${itemId}/edit`)
                        }
                    >
                        Edit
                    </button>

                    <button
                        style={adjustBtn}
                        onClick={() =>
                            navigate(`/stock/${itemId}/adjust`)
                        }
                    >
                        Adjust
                    </button>
                </div>
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const card = (isLow, active) => ({
    border: active
        ? "1px solid #0d6efd"
        : "1px solid #eee",
    borderRadius: 10,
    padding: 14,
    background: isLow ? "#fff4f4" : "#fff",
    cursor: "pointer",
    transition: "border 0.15s ease"
});

const title = {
    fontWeight: 600,
    fontSize: 15
};

const meta = {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2
};

const qty = isLow => ({
    marginTop: 10,
    fontSize: 18,
    fontWeight: 700,
    color: isLow ? "crimson" : "#000"
});

const min = {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2
};

const price = {
    marginTop: 6,
    fontSize: 13
};

const cost = {
    fontSize: 13,
    opacity: 0.7
};

const value = {
    marginTop: 6,
    fontSize: 13,
    fontWeight: 600
};

const alert = {
    marginTop: 6,
    fontSize: 12,
    color: "crimson",
    fontWeight: 600
};

/* ACTIONS */

const actions = {
    marginTop: 12,
    display: "flex",
    gap: 10
};

const editBtn = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer"
};

const adjustBtn = {
    padding: "6px 14px",
    borderRadius: 6,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    cursor: "pointer"
};
