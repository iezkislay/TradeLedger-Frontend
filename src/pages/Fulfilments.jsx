import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Fulfilments() {
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchBill, setSearchBill] = useState("");
    const [searchCustomer, setSearchCustomer] = useState("");
    const [processing, setProcessing] = useState(null);

    /* ================= LOAD ================= */

    const load = async () => {
        try {
            const res = await api.get("/fulfilments/pending");
            setData(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, []);

    /* ================= FILTER ================= */

    const filtered = useMemo(() => {
        return data.filter(b => {
            const billMatch = b.billCode
                .toLowerCase()
                .includes(searchBill.toLowerCase());
            const customerMatch = b.customerName
                .toLowerCase()
                .includes(searchCustomer.toLowerCase());
            return billMatch && customerMatch;
        });
    }, [data, searchBill, searchCustomer]);

    /* ================= FULFIL ================= */

    const fulfilItem = async (billItemId, quantity) => {
        if (!quantity || quantity <= 0) return;

        setProcessing(billItemId);
        try {
            await api.post(
                `/fulfilments/${billItemId}?quantity=${quantity}`
            );
            await load();
        } finally {
            setProcessing(null);
        }
    };

    const fulfilAll = async bill => {
        for (const item of bill.items) {
            if (item.pendingQty > 0) {
                await fulfilItem(item.billItemId, item.pendingQty);
            }
        }
    };

    if (loading) return <div style={hint}>Loading fulfilments…</div>;

    return (
        <div style={page}>
            <h2 style={{ textAlign: "center" }}>📦 Fulfilments</h2>

            {/* SEARCH BAR */}
            <div style={filters}>
                <input
                    style={input}
                    placeholder="Search Bill Number"
                    value={searchBill}
                    onChange={e => setSearchBill(e.target.value)}
                />
                <input
                    style={input}
                    placeholder="Filter by Customer"
                    value={searchCustomer}
                    onChange={e => setSearchCustomer(e.target.value)}
                />
                <button style={secondary} onClick={load}>
                    Refresh
                </button>
            </div>

            {/* CARDS */}
            {filtered.map(bill => (
                <div key={bill.billId} style={card}>
                    <div style={cardHeader}>
                        <div>
                            <b>{bill.billCode}</b>
                            <div style={muted}>{bill.customerName}</div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                style={secondary}
                                onClick={() =>
                                    navigate(`/bills/${bill.billId}/view`)
                                }
                            >
                                View
                            </button>

                            <button
                                style={primary}
                                onClick={() => fulfilAll(bill)}
                            >
                                Fulfil All
                            </button>
                        </div>
                    </div>

                    {bill.items.map(item => (
                        <FulfilRow
                            key={item.billItemId}
                            item={item}
                            onFulfil={fulfilItem}
                            processing={processing}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ================= ROW ================= */

function FulfilRow({ item, onFulfil, processing }) {
    const [qty, setQty] = useState("");

    const disabled =
        item.pendingQty === 0 ||
        item.status === "RETURNED";

    return (
        <div style={row}>
            <div style={{ flex: 2 }}>
                <div><b>{item.itemCode}</b> — {item.itemName}</div>
                <div style={muted}>
                    Pending: {item.pendingQty} | Fulfilled: {item.fulfilledQty}
                </div>
            </div>

            <input
                style={smallInput}
                type="number"
                min="1"
                max={item.pendingQty}
                placeholder="Qty"
                value={qty}
                disabled={disabled}
                onChange={e => setQty(e.target.value)}
            />

            <button
                style={primary}
                disabled={disabled || processing === item.billItemId}
                onClick={() =>
                    onFulfil(item.billItemId, Number(qty))
                }
            >
                {processing === item.billItemId
                    ? "..."
                    : "Fulfil"}
            </button>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 24,
    maxWidth: 1100,
    margin: "0 auto"
};

const filters = {
    display: "flex",
    gap: 10,
    marginBottom: 16
};

const input = {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ddd",
    flex: 1
};

const smallInput = {
    width: 80,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ddd"
};

const card = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    background: "#fff"
};

const cardHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
};

const row = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
};

const primary = {
    padding: "6px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const secondary = {
    padding: "6px 12px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const muted = {
    fontSize: 12,
    opacity: 0.6
};

const hint = {
    padding: 24,
    opacity: 0.6
};
