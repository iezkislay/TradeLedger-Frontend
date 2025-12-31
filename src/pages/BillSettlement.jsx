import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function BillSettlement() {
    const { billId } = useParams();

    const [bill, setBill] = useState(null);
    const [amountPaid, setAmountPaid] = useState("");
    const [adjustment, setAdjustment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /* ================= LOAD BILL ================= */
    useEffect(() => {
        fetchBill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const fetchBill = async () => {
        try {
            const res = await api.get(`/bills/${billId}`);
            setBill(res.data.data);
        } catch {
            setError("Failed to load bill");
        }
    };

    /* ================= SETTLEMENT ================= */
    const submitSettlement = async () => {
        const paid = Number(amountPaid) || 0;
        const adj = Number(adjustment) || 0;

        if (paid <= 0 && adj <= 0) {
            setError("Enter payment or adjustment amount");
            return;
        }

        if (paid + adj > bill.dueAmount) {
            setError("Amount exceeds due");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.post(`/bills/${billId}/settle`, {
                amountPaid: paid,
                adjustment: adj
            });

            window.history.back();
        } catch (e) {
            setError(
                e.response?.data?.message ||
                "Settlement failed"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!bill) {
        return <div style={pageWrap}>Loading bill…</div>;
    }

    return (
        <div style={pageWrap}>
            <h2>💰 Settle Bill</h2>

            {/* ================= CUSTOMER & BILL INFO ================= */}
            <div style={infoCard}>
                <div>
                    <strong>{bill.customerName}</strong>
                    <div style={muted}>📞 {bill.customerMobile}</div>
                    {bill.customerAddress && (
                        <div style={muted}>
                            📍 {bill.customerAddress}
                        </div>
                    )}
                </div>

                <div style={billMeta}>
                    <div><strong>{bill.billCode}</strong></div>
                    <div>Total: ₹{bill.totalAmount.toFixed(2)}</div>
                    <div>Paid: ₹{bill.amountPaid.toFixed(2)}</div>
                    <div style={due}>
                        Due: ₹{bill.dueAmount.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* ================= SETTLEMENT FORM ================= */}
            <div style={card}>
                <div style={field}>
                    <label>Amount Paid</label>
                    <input
                        type="number"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        placeholder="Enter amount received"
                    />
                </div>

                <div style={field}>
                    <label>Adjustment (Optional)</label>
                    <input
                        type="number"
                        value={adjustment}
                        onChange={e => setAdjustment(e.target.value)}
                        placeholder="Waived / discount amount"
                    />
                </div>

                {error && <div style={errorStyle}>{error}</div>}

                <div style={actions}>
                    <button
                        onClick={() => window.history.back()}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submitSettlement}
                        disabled={loading}
                        style={primaryBtn}
                    >
                        {loading ? "Saving…" : "Confirm Settlement"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = {
    padding: "24px",
    maxWidth: 600,
    margin: "0 auto"
};

const infoCard = {
    marginTop: 12,
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 8,
    display: "flex",
    justifyContent: "space-between",
    gap: 16
};

const billMeta = {
    textAlign: "right",
    fontSize: 14
};

const due = {
    color: "crimson",
    fontWeight: 600
};

const muted = {
    fontSize: 13,
    opacity: 0.7
};

const card = {
    marginTop: 20,
    padding: 20,
    border: "1px solid #eee",
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 16
};

const field = {
    display: "flex",
    flexDirection: "column",
    gap: 6
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
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
