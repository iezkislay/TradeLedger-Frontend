import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Items() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get("/items/search?q=");
            setItems(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    const search = async q => {
        setQuery(q);

        if (!q.trim()) {
            return fetchItems();
        }

        setLoading(true);
        try {
            const res = await api.get(
                `/items/search?q=${encodeURIComponent(q)}`
            );
            setItems(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={page}>
            <h2>📦 Item Master</h2>

            <div style={toolbar}>
                <input
                    placeholder="Search item / brand"
                    value={query}
                    onChange={e => search(e.target.value)}
                />

                <button
                    onClick={() =>
                        (window.location.href = "/items/new")
                    }
                >
                    + Add Item
                </button>
            </div>

            {loading && <div style={hint}>Loading…</div>}

            <div style={grid}>
                {items.map(i => (
                    <div
                        key={i.id}
                        style={card}
                        onClick={() =>
                            (window.location.href =
                                `/items/${i.id}/edit`)
                        }
                    >
                        <div style={name}>{i.name}</div>
                        <div style={meta}>
                            {i.brand} • {i.category}
                        </div>
                        <div style={price}>
                            ₹{i.sellingPrice} / {i.baseUnit}
                        </div>
                        <div style={stock}>
                            Min Stock: {i.minStock}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = { padding: 24 };

const toolbar = {
    display: "flex",
    gap: 12,
    marginBottom: 16
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16
};

const card = {
    border: "1px solid #eee",
    padding: 14,
    borderRadius: 8,
    cursor: "pointer"
};

const name = { fontWeight: 600 };

const meta = { fontSize: 13, opacity: 0.7 };

const price = { marginTop: 6 };

const stock = { fontSize: 13, opacity: 0.8 };

const hint = { opacity: 0.6 };
