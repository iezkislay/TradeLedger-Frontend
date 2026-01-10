import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = [
    "CPVC",
    "UPVC",
    "SWR",
    "GI",
    "BORING",
    "CP_ITEMS",
    "OTHERS"
];

const BASE_UNITS = ["PCS", "FEET", "METER", "KG"];

export default function ItemForm() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(itemId);

    const [loading, setLoading] = useState(false);

    const [item, setItem] = useState({
        itemCode: "",            // 🔥 ADDED
        name: "",
        brand: "",
        category: "",
        baseUnit: "",
        sellingPrice: "",
        costPrice: "",
        minStock: "",
        openingStock: "" // only for create
    });

    /* ================= LOAD ITEM (EDIT MODE) ================= */

    useEffect(() => {
        if (isEdit) {
            loadItem();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadItem = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/items/${itemId}`);
            const data = res.data.data;

            setItem({
                itemCode: data.itemCode || "",   // 🔥 ADDED
                name: data.name || "",
                brand: data.brand || "",
                category: data.category || "",
                baseUnit: data.baseUnit || "",
                sellingPrice: data.sellingPrice ?? "",
                costPrice: data.costPrice ?? "",
                minStock: data.minStock ?? "",
                openingStock: "" // never editable
            });
        } finally {
            setLoading(false);
        }
    };

    /* ================= SAVE ================= */

    const save = async () => {
        const payload = {
            itemCode: item.itemCode, // 🔥 MUST BE SENT
            name: item.name.trim(),
            brand: item.brand.trim(),
            category: item.category,
            baseUnit: item.baseUnit,
            sellingPrice: Number(item.sellingPrice),
            costPrice: Number(item.costPrice),
            minStock:
                item.minStock === "" ? null : Number(item.minStock)
        };

        if (isEdit) {
            await api.put(`/items/${itemId}`, payload);
        } else {
            await api.post("/items", {
                ...payload,
                openingStock:
                    item.openingStock === ""
                        ? 0
                        : Number(item.openingStock)
            });
        }

        navigate(-1);
    };

    /* ================= UI ================= */

    return (
        <div style={page}>
            <div style={card}>
                <h2 style={{ marginBottom: 16 }}>
                    {isEdit ? "✏️ Edit Item" : "➕ Add New Item"}
                </h2>

                {loading && <div style={hint}>Loading item…</div>}

                {!loading && (
                    <div style={form}>

                        {/* ITEM CODE (EDIT ONLY) */}
                        {isEdit && (
                            <Field label="Item Code">
                                <input
                                    value={item.itemCode}
                                    disabled
                                />
                            </Field>
                        )}

                        {/* NAME */}
                        <Field label="Item Name">
                            <input
                                value={item.name}
                                onChange={e =>
                                    setItem({ ...item, name: e.target.value })
                                }
                            />
                        </Field>

                        {/* BRAND */}
                        <Field label="Brand">
                            <input
                                value={item.brand}
                                onChange={e =>
                                    setItem({ ...item, brand: e.target.value })
                                }
                            />
                        </Field>

                        {/* CATEGORY + UNIT */}
                        <div style={row}>
                            <Field label="Category">
                                <select
                                    value={item.category}
                                    onChange={e =>
                                        setItem({
                                            ...item,
                                            category: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Select</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Base Unit">
                                <select
                                    value={item.baseUnit}
                                    onChange={e =>
                                        setItem({
                                            ...item,
                                            baseUnit: e.target.value
                                        })
                                    }
                                >
                                    <option value="">Select</option>
                                    {BASE_UNITS.map(u => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* PRICES */}
                        <div style={row}>
                            <Field label="Selling Price (₹)">
                                <input
                                    type="number"
                                    value={item.sellingPrice}
                                    onChange={e =>
                                        setItem({
                                            ...item,
                                            sellingPrice: e.target.value
                                        })
                                    }
                                />
                            </Field>

                            <Field label="Cost Price (₹)">
                                <input
                                    type="number"
                                    value={item.costPrice}
                                    onChange={e =>
                                        setItem({
                                            ...item,
                                            costPrice: e.target.value
                                        })
                                    }
                                />
                            </Field>
                        </div>

                        {/* MIN STOCK */}
                        <Field label="Minimum Stock Alert">
                            <input
                                type="number"
                                value={item.minStock}
                                onChange={e =>
                                    setItem({
                                        ...item,
                                        minStock: e.target.value
                                    })
                                }
                                placeholder="Optional"
                            />
                        </Field>

                        {/* OPENING STOCK (CREATE ONLY) */}
                        {!isEdit && (
                            <Field label="Opening Stock">
                                <input
                                    type="number"
                                    value={item.openingStock}
                                    onChange={e =>
                                        setItem({
                                            ...item,
                                            openingStock: e.target.value
                                        })
                                    }
                                    placeholder="Initial available stock"
                                />
                            </Field>
                        )}

                        {/* ACTIONS */}
                        <div style={actions}>
                            <button
                                onClick={() => navigate(-1)}
                                style={secondaryBtn}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={save}
                                style={primaryBtn}
                            >
                                {isEdit ? "Update Item" : "Create Item"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ================= SMALL COMPONENT ================= */

function Field({ label, children }) {
    return (
        <div style={field}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 24,
    display: "flex",
    justifyContent: "center"
};

const card = {
    width: "100%",
    maxWidth: 600,
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 20,
    background: "#fff"
};

const form = {
    display: "flex",
    flexDirection: "column",
    gap: 14
};

const field = {
    display: "flex",
    flexDirection: "column",
    gap: 6
};

const labelStyle = {
    fontSize: 13,
    opacity: 0.7
};

const row = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10
};

const primaryBtn = {
    padding: "8px 16px",
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const secondaryBtn = {
    padding: "8px 16px",
    background: "#f1f1f1",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer"
};

const hint = {
    opacity: 0.6
};
