import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BillRefund() {
    const { billId } = useParams();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [returnsData, setReturnsData] = useState(null);
    const [refunds, setRefunds] = useState([]);

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("CASH");
    const [reason, setReason] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [billRes, returnsRes, refundsRes] = await Promise.all([
                api.get(`/bills/${billId}`),
                api.get(`/returns?billId=${billId}`),
                api.get(`/refunds?billId=${billId}`)
            ]);

            setBill(billRes.data.data);
            setReturnsData(returnsRes.data.data);
            setRefunds(refundsRes.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    const submit = async () => {
        if (!amount || Number(amount) <= 0) {
            alert("Enter valid refund amount");
            return;
        }

        setSaving(true);
        try {
            await api.post("/refunds", {
                billId,
                amount: Number(amount),
                refundMode: mode,
                reason
            });

            setAmount("");
            setReason("");
            await loadAll();
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={hint}>Loading refund…</div>;
    if (!bill) return <div style={hint}>Bill not found</div>;

    if (bill.state !== "ACTIVE") {
        return (
            <div style={hint}>
                Refunds are not allowed for this bill.
            </div>
        );
    }

    const refundedSoFar = refunds.reduce((s, r) => s + r.amount, 0);

    return (
        <div style={page}>
            <h2 style={{ textAlign: "center" }}>💸 Refund</h2>

            {/* ===== CONTEXT ===== */}
            <div style={box}>
                <div><b>Bill:</b> {bill.billNumber}</div>
                <div><b>Customer:</b> {bill.customerName || "-"}</div>
            </div>

            <div style={box}>
                <div>Effective Bill Total: ₹{bill.effectiveTotal}</div>
                <div>Amount Paid: ₹{bill.amountPaid}</div>
                <div>Returned (Effective): ₹{returnsData?.returnedEffectiveTotal || 0}</div>
                <div>Already Refunded: ₹{refundedSoFar}</div>
            </div>

            {/* ===== REFUND FORM ===== */}
            <div style={box}>
                <h4 style={title}>Create Refund</h4>

                <div style={grid}>
                    <div>
                        <label>Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={input}
                        />
                    </div>

                    <div>
                        <label>Mode</label>
                        <select
                            value={mode}
                            onChange={e => setMode(e.target.value)}
                            style={input}
                        >
                            <option value="CASH">CASH</option>
                            <option value="UPI">UPI</option>
                            <option value="CREDIT">CREDIT</option>
                        </select>
                    </div>

                    <div>
                        <label>Reason</label>
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Optional"
                            style={input}
                        />
                    </div>
                </div>

                <div style={actions}>
                    <button style={secondary} onClick={() => navigate(`/bills/${billId}/view`)}>
                        Back
                    </button>
                    <button style={primary} onClick={submit} disabled={saving}>
                        {saving ? "Processing…" : "Issue Refund"}
                    </button>
                </div>
            </div>

            {/* ===== REFUND HISTORY ===== */}
            <div style={box}>
                <h4 style={title}>Refund History</h4>

                <table style={table}>
                    <thead>
                        <tr>
                            <th style={th}>Amount</th>
                            <th style={th}>Mode</th>
                            <th style={th}>Reason</th>
                            <th style={th}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {refunds.map(r => (
                            <tr key={r.refundId}>
                                <td style={td}>₹{r.amount}</td>
                                <td style={td}>{r.refundMode || "-"}</td>
                                <td style={td}>{r.reason || "-"}</td>
                                <td style={td}>{new Date(r.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = { padding: 24, maxWidth: 900, margin: "0 auto" };
const box = { background: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, border: "1px solid #eee" };

const title = { marginBottom: 12 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 };

const input = { width: "100%", padding: "6px 8px" };

const actions = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 };
const primary = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6 };
const secondary = { padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: 6 };

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "6px", borderBottom: "1px solid #ddd" };
const td = { padding: "6px", borderBottom: "1px solid #f1f1f1" };

const hint = { padding: 24, opacity: 0.6 };
