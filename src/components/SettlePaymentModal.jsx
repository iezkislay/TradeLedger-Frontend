import { useState } from "react";
import { settleBill } from "../api/billingApi";

export default function SettlePaymentModal({
                                               bill,
                                               onClose,
                                               onSuccess
                                           }) {
    if (!bill) return null; // 🔒 safety guard

    const [amountPaid, setAmountPaid] = useState("");
    const [adjustment, setAdjustment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        const paid = Number(amountPaid) || 0;
        const adj = Number(adjustment) || 0;

        if (paid <= 0 && adj <= 0) {
            setError("Enter payment or adjustment amount");
            return;
        }

        if (paid + adj > bill.dueAmount) {
            setError("Amount exceeds due amount");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await settleBill(bill.billId, {
                amountPaid: paid,
                adjustment: adj
            });

            onSuccess(); // 🔥 refresh pending bills
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                "Settlement failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={backdrop}>
            <div style={card}>
                <h3>💰 Settle Bill</h3>

                {/* ================= BILL SUMMARY ================= */}
                <div style={summary}>
                    <div><strong>Bill:</strong> {bill.billCode}</div>
                    <div>Total: ₹{bill.totalAmount.toFixed(2)}</div>
                    <div>Paid: ₹{bill.paidAmount.toFixed(2)}</div>
                    <div style={due}>
                        Due: ₹{bill.dueAmount.toFixed(2)}
                    </div>
                </div>

                {/* ================= INPUTS ================= */}
                <div style={field}>
                    <label>Amount Paid</label>
                    <input
                        type="number"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        placeholder="Amount received"
                    />
                </div>

                <div style={field}>
                    <label>Adjustment / Waiver</label>
                    <input
                        type="number"
                        value={adjustment}
                        onChange={e => setAdjustment(e.target.value)}
                        placeholder="Discount / rounding"
                    />
                </div>

                {error && (
                    <div style={errorStyle}>
                        {error}
                    </div>
                )}

                {/* ================= ACTIONS ================= */}
                <div style={actions}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={primaryBtn}
                    >
                        {loading ? "Processing…" : "Confirm Settlement"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const backdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};

const card = {
    width: 420,
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 14
};

const summary = {
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const due = {
    color: "crimson",
    fontWeight: 600
};

const field = {
    display: "flex",
    flexDirection: "column",
    gap: 6
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8
};

const primaryBtn = {
    background: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer"
};

const errorStyle = {
    color: "crimson",
    fontSize: 14
};
