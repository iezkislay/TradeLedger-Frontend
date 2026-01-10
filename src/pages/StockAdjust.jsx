import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function StockAdjust() {
    const { itemId } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ================= LOAD ITEM ================= */

    const loadItem = async () => {
        const res = await api.get(`/items/${itemId}`);
        setItem(res.data.data);
    };

    /* ================= SUBMIT ================= */

    const submit = async () => {
        if (quantity === "" || isNaN(quantity)) {
            alert("Quantity is required");
            return;
        }

        setSaving(true);
        try {
            await api.post(`/stock/${itemId}/adjust`, {
                quantity: Number(quantity),
                reason: reason.trim() || undefined
            });

            navigate("/items");
        } finally {
            setSaving(false);
        }
    };

    if (!item) {
        return <div style={page}>Loading…</div>;
    }

    return (
        <div style={page}>
            <div style={card}>
                <h2 style={{ marginBottom: 16 }}>📦 Adjust Stock</h2>

                <div style={form}>
                    {/* ITEM */}
                    <Field label="Item">
                        <input
                            value={`${item.name} • ${item.itemCode}`}
                            disabled
                        />
                    </Field>

                    {/* CURRENT STOCK */}
                    <Field label="Current Stock">
                        <input
                            value={`${item.availableStock ?? 0} ${item.baseUnit}`}
                            disabled
                        />
                    </Field>

                    {/* ADJUSTMENT */}
                    <Field label="Adjustment Quantity">
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            placeholder="e.g. 50 or -10"
                        />
                    </Field>

                    {/* REASON */}
                    <Field label="Reason (optional)">
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Reason for adjustment"
                        />
                    </Field>

                    {/* ACTIONS */}
                    <div style={actions}>
                        <button
                            onClick={() => navigate(-1)}
                            disabled={saving}
                            style={secondaryBtn}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={submit}
                            disabled={saving}
                            style={primaryBtn}
                        >
                            {saving ? "Saving…" : "Adjust Stock"}
                        </button>
                    </div>
                </div>
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

/* ================= STYLES (MATCH EDIT ITEM) ================= */

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
