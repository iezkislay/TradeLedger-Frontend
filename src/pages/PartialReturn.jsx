import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function PartialReturn() {
    const { billItemId } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [quantity, setQuantity] = useState("");
    const [returnType, setReturnType] = useState("DELIVERED");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    const [showRefundPrompt, setShowRefundPrompt] = useState(false);
    const [refundAmount, setRefundAmount] = useState(0);

    /* ================= LOAD BILL ITEM ================= */

    useEffect(() => {
        loadItem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadItem = async () => {
        const res = await api.get(`/bill-items/${billItemId}`);
        setItem(res.data.data);
    };

    /* ================= SUBMIT RETURN ================= */

    const submitReturn = async () => {
        const qty = Number(quantity);

        if (!qty || qty <= 0) {
            alert("Return quantity must be greater than zero");
            return;
        }

        if (
            returnType === "DELIVERED" &&
            qty > (item.deliveredQty - item.returnedQty)
        ) {
            alert("Return quantity exceeds delivered quantity");
            return;
        }

        if (
            returnType === "PENDING" &&
            qty > item.pendingQty
        ) {
            alert("Return quantity exceeds pending quantity");
            return;
        }

        setSaving(true);
        try {
            await api.post("/returns/partial", {
                billItemId,
                quantity: qty,
                returnType,
                reason: reason.trim() || undefined
            });

            const amount = qty * item.price;
            setRefundAmount(amount);
            setShowRefundPrompt(true);
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
                <h2 style={{ marginBottom: 16 }}>↩️ Partial Return</h2>

                {/* ITEM CARD */}
                <div style={itemCard}>
                    <div style={title}>
                        {item.itemName} • {item.itemCode}
                    </div>

                    <div style={meta}>
                        Price: ₹{item.price} / {item.baseUnit}
                    </div>

                    <div style={stats}>
                        <Stat label="Ordered" value={item.quantity} />
                        <Stat label="Delivered" value={item.deliveredQty} />
                        <Stat label="Pending" value={item.pendingQty} />
                        <Stat label="Returned" value={item.returnedQty} />
                    </div>

                    <div style={status}>
                        Status: {item.fulfilmentStatus}
                    </div>
                </div>

                {/* FORM */}
                <div style={form}>
                    <Field label="Return Quantity">
                        <input
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            placeholder="Enter quantity"
                        />
                    </Field>

                    <Field label="Return Type">
                        <div style={radioRow}>
                            <label>
                                <input
                                    type="radio"
                                    checked={returnType === "DELIVERED"}
                                    onChange={() =>
                                        setReturnType("DELIVERED")
                                    }
                                />{" "}
                                Delivered & Returned
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    checked={returnType === "PENDING"}
                                    onChange={() =>
                                        setReturnType("PENDING")
                                    }
                                />{" "}
                                Never Delivered
                            </label>
                        </div>
                    </Field>

                    <Field label="Reason (optional)">
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Reason for return"
                        />
                    </Field>

                    <div style={actions}>
                        <button
                            onClick={() => navigate(-1)}
                            style={secondaryBtn}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={submitReturn}
                            style={primaryBtn}
                            disabled={saving}
                        >
                            {saving ? "Processing…" : "Process Return"}
                        </button>
                    </div>
                </div>
            </div>

            {/* REFUND PROMPT */}
            {showRefundPrompt && (
                <div style={overlay}>
                    <div style={modal}>
                        <h3>Refund Available</h3>
                        <p>
                            A return amount of <b>₹{refundAmount.toFixed(2)}</b>{" "}
                            has been recorded.
                        </p>
                        <p>Would you like to initiate the refund now?</p>

                        <div style={actions}>
                            <button
                                style={secondaryBtn}
                                onClick={() =>
                                    navigate(`/bills/${item.billId}/view`)
                                }
                            >
                                Refund Later
                            </button>

                            <button
                                style={primaryBtn}
                                onClick={() =>
                                    navigate(
                                        `/bills/${item.billId}/refund`,
                                        {
                                            state: {
                                                amount: refundAmount,
                                                reason:
                                                    reason ||
                                                    "Item returned"
                                            }
                                        }
                                    )
                                }
                            >
                                Initiate Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ================= SMALL COMPONENTS ================= */

function Field({ label, children }) {
    return (
        <div style={field}>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div style={stat}>
            <div style={{ fontSize: 12, opacity: 0.6 }}>{label}</div>
            <div style={{ fontWeight: 600 }}>{value}</div>
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
    maxWidth: 650,
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 20,
    background: "#fff"
};

const itemCard = {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
    background: "#fafafa"
};

const title = {
    fontWeight: 600,
    fontSize: 15
};

const meta = {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4
};

const stats = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginTop: 12
};

const stat = {
    border: "1px solid #eee",
    borderRadius: 6,
    padding: 8,
    textAlign: "center",
    background: "#fff"
};

const status = {
    marginTop: 10,
    fontSize: 13,
    fontWeight: 600
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

const radioRow = {
    display: "flex",
    gap: 16,
    fontSize: 14
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

const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
};

const modal = {
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    width: 420
};
