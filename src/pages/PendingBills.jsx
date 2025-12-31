import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPendingBills } from "../api/billingApi";
import SettlePaymentModal from "../components/SettlePaymentModal";
import BillSettlement from "./BillSettlement";

export default function PendingBills() {
    const { customerId } = useParams();

    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        loadBills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const loadBills = () => {
        setLoading(true);
        getPendingBills(customerId)
            .then(res => {
                setBills(res.data.data || []);
            })
            .catch(err => {
                console.error("Failed to load pending bills", err);
                setBills([]);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div style={pageWrap}>
            <h2>💰 Pending Bills</h2>

            {loading && <div style={hint}>Loading pending bills…</div>}

            {!loading && bills.length === 0 && (
                <div style={hint}>🎉 No pending bills</div>
            )}

            <div style={list}>
                {bills.map(b => (
                    <div key={b.billId} style={card}>
                        {/* LEFT */}
                        <div style={left}>
                            <div style={billCode}>
                                {b.billCode}
                            </div>
                            <div style={date}>
                                {b.billDate}
                            </div>
                        </div>

                        {/* AMOUNTS */}
                        <div style={amounts}>
                            <div>Total: ₹{b.totalAmount.toFixed(2)}</div>
                            <div style={paid}>
                                Paid: ₹{b.paidAmount.toFixed(2)}
                            </div>
                            <div style={due}>
                                Due: ₹{b.dueAmount.toFixed(2)}
                            </div>
                        </div>

                        {/* ACTION */}
                        <div>
                            <button
                                style={settleBtn}
                                onClick={() => setSelectedBill(b)}
                            >
                                Settle
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 🔥 SETTLEMENT MODAL (UNCHANGED LOGIC) */}
            {selectedBill && (
                <SettlePaymentModal
                    bill={selectedBill}
                    onClose={() => setSelectedBill(null)}
                    onSuccess={() => {
                        setSelectedBill(null);
                        loadBills(); // 🔥 auto refresh
                    }}
                />
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = {
    padding: "24px",
    maxWidth: 900,
    margin: "0 auto"
};

const list = {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12
};

const card = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 16,
    padding: 16,
    border: "1px solid #eee",
    borderRadius: 8,
    alignItems: "center",
    background: "#fff"
};

const left = {
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const billCode = {
    fontWeight: 600
};

const date = {
    fontSize: 13,
    opacity: 0.6
};

const amounts = {
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const paid = {
    color: "green"
};

const due = {
    color: "crimson",
    fontWeight: 600
};

const settleBtn = {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer"
};

const hint = {
    marginTop: 12,
    opacity: 0.6
};
