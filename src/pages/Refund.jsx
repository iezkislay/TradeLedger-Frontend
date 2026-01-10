import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const MODES = ["CASH", "UPI", "CREDIT"];

export default function Refund() {
    const { billId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    /* ================= PREFILL ================= */

    useEffect(() => {
        loadBill();

        // From return flow
        if (location.state?.amount) {
            setAmount(location.state.amount);
        }

        if (location.state?.reason) {
            setReason(location.state.reason);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBill = async () => {
        const res = await api.get(`/bills/${billId}`);
        setBill(res.data.data);
    };

    /* ================= SUBMIT ================= */

    const submit = async () => {
        if (!amount || Number(amount) <= 0) {
            alert("Refund amount is required");
            return;
        }

        if (!mode) {
            alert("Select refund mode");
            return;
        }

        setSaving(true);
        try {
            await api.post("/refunds", {
                billId,
                amount: Number(amount),
                refundMode: mode,
                reason: reason.trim() || undefined
            });

            navigate(`/bills/${billId}/view`);
        } finally {
            setSaving(false);
        }
    };

    if (!bill) {
        return <div style={page}>Loading…</div>;
    }

    return (
        <div style={page}>
            <div style={card}>
                <h2 style={{ marginBottom: 16 }}>💳 Process Refund</h2>

                {/* BILL INFO */}
                <div style={infoCard}>
                    <div style={title}>
                        Bill #{bill.billNumber}
                    </div>

                    <div style={meta}>
                        Customer: {bill.customerName}
                    </div>

                    <div style={meta}>
                        Paid: ₹{bill.amountPaid} | Total: ₹{bill.totalAmount}
                    </div>
                </div>

                {/* FORM */}
                <div style={form}>
                    <Field label="Refund Amount (₹)">
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Enter refund amount"
                        />
                    </Field>

                    <Field label="Refund Mode">
                        <select
                            value={mode}
                            onChange={e => setMode(e.target.value)}
                        >
                            <option value="">Select</option>
                            {MODES.map(m => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Reason (optional)">
                        <input
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Reason for refund"
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
                            onClick={submit}
                            style={primaryBtn}
                            disabled={saving}
                        >
                            {saving ? "Processing…" : "Process Refund"}
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

/* ================= STYLES ================= */

const page = {
    padding: 24,
    display: "flex",
    justifyContent: "center"
};

const card = {
    width: "100%",
    maxWidth: 520,
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 20,
    background: "#fff"
};

const infoCard = {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 12,
    background: "#fafafa",
    marginBottom: 16
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
