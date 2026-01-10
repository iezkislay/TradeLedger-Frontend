import { useEffect, useState } from "react";
import api from "../api/axios";

export default function PendingFulfilments() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qtyMap, setQtyMap] = useState({});

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await api.get("/fulfilments/pending");
            setRows(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    const fulfil = async (billItemId, maxQty) => {
        const qty = Number(qtyMap[billItemId]);

        if (!qty || qty <= 0 || qty > maxQty) {
            alert("Invalid quantity");
            return;
        }

        await api.post(
            `/fulfilments/${billItemId}?quantity=${qty}`
        );

        load(); // refresh list
    };

    return (
        <div style={page}>
            <h2>📦 Pending Fulfilments</h2>

            {loading && <div style={hint}>Loading…</div>}

            {!loading && rows.length === 0 && (
                <div style={hint}>🎉 No pending fulfilments</div>
            )}

            <div style={list}>
                {rows.map(r => (
                    <div key={r.id} style={card}>
                        {/* ITEM INFO */}
                        <div>
                            <div style={title}>
                                {r.item.name} • {r.item.itemCode}
                            </div>
                            <div style={meta}>
                                {r.item.brand} • {r.item.category}
                            </div>
                        </div>

                        {/* QTY INFO */}
                        <div style={qtyInfo}>
                            <div>
                                Pending:{" "}
                                <b>
                                    {r.pendingQty} {r.item.baseUnit}
                                </b>
                            </div>
                            <div style={small}>
                                Fulfilled: {r.fulfilledQty}
                            </div>
                        </div>

                        {/* ACTION */}
                        <div style={action}>
                            <input
                                type="number"
                                placeholder="Qty"
                                value={qtyMap[r.id] || ""}
                                onChange={e =>
                                    setQtyMap({
                                        ...qtyMap,
                                        [r.id]: e.target.value
                                    })
                                }
                                style={input}
                            />

                            <button
                                onClick={() =>
                                    fulfil(r.id, r.pendingQty)
                                }
                                style={btn}
                            >
                                Fulfil
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 24,
    maxWidth: 900,
    margin: "0 auto"
};

const list = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 16
};

const card = {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 14,
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 12,
    alignItems: "center",
    background: "#fff"
};

const title = {
    fontWeight: 600,
    fontSize: 15
};

const meta = {
    fontSize: 13,
    opacity: 0.7
};

const qtyInfo = {
    fontSize: 14
};

const small = {
    fontSize: 12,
    opacity: 0.6
};

const action = {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end"
};

const input = {
    width: 80,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ccc"
};

const btn = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "#0d6efd",
    color: "#fff",
    cursor: "pointer"
};

const hint = {
    marginTop: 12,
    opacity: 0.6
};
