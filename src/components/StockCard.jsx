import { useNavigate } from "react-router-dom";

export default function StockCard({ item }) {
    const navigate = useNavigate();

    const isLow =
        item.minStock !== null &&
        item.quantity <= item.minStock;

    return (
        <div
            onClick={() =>
                navigate(`/items/${item.itemId}/edit`)
            }
            style={card(isLow)}
        >
            <div style={name}>
                {item.name} • {item.itemCode}
            </div>

            <div style={meta}>
                {item.brand} • {item.category}
            </div>

            <div style={qty(isLow)}>
                {item.quantity} {item.baseUnit}
            </div>

            {item.minStock !== null && (
                <div style={min}>
                    Min: {item.minStock}
                </div>
            )}

            <div style={{ marginTop: 6 }}>
                💰 ₹{item.stockValue.toFixed(2)}
            </div>

            {isLow && (
                <div style={alert}>
                    ⚠ Low Stock
                </div>
            )}
        </div>
    );
}

/* ================= STYLES (FROM OLD UI) ================= */

const card = isLow => ({
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 14,
    background: isLow ? "#fff4f4" : "#fff",
    cursor: "pointer"
});

const name = {
    fontWeight: 600,
    fontSize: 15
};

const meta = {
    fontSize: 13,
    opacity: 0.7
};

const qty = isLow => ({
    marginTop: 8,
    fontSize: 18,
    fontWeight: 700,
    color: isLow ? "crimson" : "#000"
});

const min = {
    fontSize: 12,
    opacity: 0.6
};

const alert = {
    marginTop: 6,
    fontSize: 12,
    color: "crimson",
    fontWeight: 600
};
