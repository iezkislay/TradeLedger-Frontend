import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ActivateBillModal({ billId, effectiveTotal, onClose, onSuccess }) {
    const [paymentType, setPaymentType] = useState("CASH");
    const [amountPaid, setAmountPaid] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (paymentType === "CASH" || paymentType === "UPI") {
            setAmountPaid(effectiveTotal);
        }
    }, [paymentType, effectiveTotal]);

    const submit = async () => {
        setSaving(true);
        try {
            const finalAmount =
                paymentType === "CREDIT"
                    ? Number(amountPaid) || 0
                    : effectiveTotal;

            await api.post(`/bills/${billId}/activate`, {
                paymentType,
                amountPaid: finalAmount
            });

            onSuccess();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={overlay}>
            <div style={modal}>
                <h3>Activate Estimate</h3>

                <div style={{ marginTop: 12 }}>
                    <label>Payment Type</label>
                    <select
                        style={input}
                        value={paymentType}
                        onChange={e => setPaymentType(e.target.value)}
                    >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="CREDIT">Credit</option>
                    </select>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label>Amount Paid</label>
                    <input
                        type="number"
                        style={input}
                        placeholder="0"
                        value={amountPaid}
                        disabled={paymentType !== "CREDIT"}
                        onChange={e => setAmountPaid(e.target.value)}
                    />
                </div>

                <div style={actions}>
                    <button style={secondary} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        style={primary}
                        onClick={submit}
                        disabled={saving}
                    >
                        {saving ? "Activating..." : "Activate Bill"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ===== STYLES ===== */

const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
};

const modal = {
    background: "#fff",
    padding: 24,
    borderRadius: 8,
    width: 400
};

const input = {
    width: "100%",
    padding: "8px 10px",
    marginTop: 6,
    borderRadius: 6,
    border: "1px solid #ddd"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18
};

const primary = {
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const secondary = {
    padding: "8px 16px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};
