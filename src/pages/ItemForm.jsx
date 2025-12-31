import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function ItemForm() {
    const { itemId } = useParams();
    const isEdit = Boolean(itemId);

    const [item, setItem] = useState({
        name: "",
        brand: "",
        category: "",
        baseUnit: "",
        sellingPrice: "",
        costPrice: "",
        minStock: ""
    });

    useEffect(() => {
        if (isEdit) loadItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadItem = async () => {
        const res = await api.get(`/items/${itemId}`);
        setItem(res.data.data);
    };

    const save = async () => {
        if (isEdit) {
            await api.put(`/items/${itemId}`, item);
        } else {
            await api.post("/items", item);
        }
        window.history.back();
    };

    return (
        <div style={page}>
            <h2>{isEdit ? "✏️ Edit Item" : "➕ New Item"}</h2>

            <div style={form}>
                {/* Name */}
                <div style={field}>
                    <label>Name</label>
                    <input
                        value={item.name}
                        onChange={e =>
                            setItem({ ...item, name: e.target.value })
                        }
                        placeholder="Item name"
                    />
                </div>

                {/* Brand */}
                <div style={field}>
                    <label>Brand</label>
                    <input
                        value={item.brand}
                        onChange={e =>
                            setItem({ ...item, brand: e.target.value })
                        }
                        placeholder="Brand name"
                    />
                </div>

                {/* Category */}
                <div style={field}>
                    <label>Category</label>
                    <input
                        value={item.category}
                        onChange={e =>
                            setItem({ ...item, category: e.target.value })
                        }
                        placeholder="CPVC / UPVC / SWR / GI / BORING / CP_ITEMS / OTHERS"
                    />
                </div>

                {/* Base Unit */}
                <div style={field}>
                    <label>Base Unit</label>
                    <input
                        value={item.baseUnit}
                        onChange={e =>
                            setItem({ ...item, baseUnit: e.target.value })
                        }
                        placeholder="PCS / FEET / METER / KG"
                    />
                </div>

                {/* Selling Price */}
                <div style={field}>
                    <label>Selling Price</label>
                    <input
                        type="number"
                        value={item.sellingPrice}
                        onChange={e =>
                            setItem({
                                ...item,
                                sellingPrice: e.target.value
                            })
                        }
                        placeholder="Selling price"
                    />
                </div>

                {/* Cost Price */}
                <div style={field}>
                    <label>Cost Price</label>
                    <input
                        type="number"
                        value={item.costPrice}
                        onChange={e =>
                            setItem({
                                ...item,
                                costPrice: e.target.value
                            })
                        }
                        placeholder="Cost price"
                    />
                </div>

                {/* Min Stock */}
                <div style={field}>
                    <label>Min Stock</label>
                    <input
                        type="number"
                        value={item.minStock}
                        onChange={e =>
                            setItem({
                                ...item,
                                minStock: e.target.value
                            })
                        }
                        placeholder="Minimum stock alert"
                    />
                </div>

                <button onClick={save}>
                    Save Item
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 24,
    maxWidth: 500
};

const form = {
    display: "flex",
    flexDirection: "column",
    gap: 12
};

const field = {
    display: "flex",
    flexDirection: "column",
    gap: 4
};
