import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import StockCard from "../components/StockCard";
import { useAuth } from "../context/useAuth";

const CATEGORIES = [
    "ALL",
    "CPVC",
    "UPVC",
    "SWR",
    "GI",
    "BORING",
    "CP_ITEMS",
    "OTHERS"
];

export default function Items() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.role?.name === "OWNER";

    const [items, setItems] = useState([]);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState("DEFAULT");
    const [loading, setLoading] = useState(false);

    /* ================= LOAD ITEMS ================= */

    useEffect(() => {
        if (query.trim()) {
            searchItems(query);
        } else {
            fetchPagedItems();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const fetchPagedItems = async () => {
        setLoading(true);
        try {
            const params = [];

            if (category !== "ALL") {
                params.push(`category=${category}`);
            }

            const res = await api.get(
                `/items/paged?page=0&size=1000${
                    params.length ? "&" + params.join("&") : ""
                }`
            );

            setItems(res.data.data.content || []);
        } finally {
            setLoading(false);
        }
    };

    const searchItems = async q => {
        setQuery(q);

        if (!q.trim()) {
            fetchPagedItems();
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(
                `/items/search?q=${encodeURIComponent(q)}`
            );
            setItems(res.data || []);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FILTER + SORT ================= */

    const processedItems = useMemo(() => {
        let list = [...items];

        // 🔥 Low stock only
        // 🔥 Low stock only
        if (lowStockOnly) {
            list = list.filter(
                i =>
                    i.minStock != null &&
                    i.minStock > 0 && // Ignore items where min stock is 0
                    (i.availableStock ?? 0) <= i.minStock
            );
        }

        // 🔃 Sorting
        switch (sortBy) {
            case "NAME":
                list.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                break;

            case "STOCK_ASC":
                list.sort(
                    (a, b) =>
                        (a.availableStock ?? 0) -
                        (b.availableStock ?? 0)
                );
                break;

            case "STOCK_DESC":
                list.sort(
                    (a, b) =>
                        (b.availableStock ?? 0) -
                        (a.availableStock ?? 0)
                );
                break;

            default:
                break;
        }

        return list;
    }, [items, lowStockOnly, sortBy]);

    return (
        <div style={page}>
            <h2>📦 Items & Stock</h2>

            {/* SEARCH + ADD */}
            <div style={toolbar}>
                <input
                    placeholder="Search item / brand / code"
                    value={query}
                    onChange={e => searchItems(e.target.value)}
                    style={search}
                />

                <button onClick={() => navigate("/items/new")}>
                    + Add Item
                </button>
            </div>

            {/* FILTER BAR */}
            <div style={filterRow}>
                <label style={checkbox}>
                    <input
                        type="checkbox"
                        checked={lowStockOnly}
                        onChange={e =>
                            setLowStockOnly(e.target.checked)
                        }
                    />
                    Low Stock Only
                </label>

                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={select}
                >
                    <option value="DEFAULT">Sort: Default</option>
                    <option value="NAME">Sort: Name (A → Z)</option>
                    <option value="STOCK_ASC">
                        Sort: Stock (Low → High)
                    </option>
                    <option value="STOCK_DESC">
                        Sort: Stock (High → Low)
                    </option>
                </select>
            </div>

            {/* CATEGORY FILTER */}
            <div style={filters}>
                {CATEGORIES.map(c => (
                    <button
                        key={c}
                        onClick={() => {
                            setCategory(c);
                            setQuery("");
                        }}
                        style={chip(c === category)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading && <div style={hint}>Loading items…</div>}

            {!loading && processedItems.length === 0 && (
                <div style={hint}>No items found</div>
            )}

            {/* GRID */}
            <div style={grid}>
                {processedItems.map(item => (
                    <StockCard
                        key={item.id}
                        isOwner={isOwner}
                        item={{
                            itemId: item.id,
                            name: item.name,
                            itemCode: item.itemCode,
                            brand: item.brand,
                            category: item.category,
                            baseUnit: item.baseUnit,
                            sellingPrice: item.sellingPrice,
                            costPrice: item.costPrice,
                            availableStock:
                                item.availableStock ?? 0,
                            minStock: item.minStock ?? null
                        }}
                    />
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
    marginBottom: 12
};

const search = {
    flex: 1,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ccc"
};

const filterRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
};

const checkbox = {
    display: "flex",
    gap: 6,
    fontSize: 14
};

const select = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc"
};

const filters = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16
};

const chip = active => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    cursor: "pointer",
    background: active ? "#0d6efd" : "#fff",
    color: active ? "#fff" : "#000"
});

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16
};

const hint = {
    opacity: 0.6,
    marginTop: 12
};
