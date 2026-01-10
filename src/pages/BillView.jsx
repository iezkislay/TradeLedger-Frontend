import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import SettlePaymentModal from "../components/SettlePaymentModal";

export default function BillView() {
    const { billId } = useParams();

    const [bill, setBill] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settleOpen, setSettleOpen] = useState(false);

    // 🆕 fulfilment state
    const [fulfilQty, setFulfilQty] = useState({});
    const [fulfilling, setFulfilling] = useState(null);

    useEffect(() => {
        loadBill();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const loadBill = async () => {
        setLoading(true);
        try {
            const billRes = await api.get(`/bills/${billId}`);
            const itemsRes = await api.get(`/bills/${billId}/items`);
            setBill(billRes.data.data);
            setItems(itemsRes.data.data || []);
            setFulfilQty({});
        } finally {
            setLoading(false);
        }
    };

    /* ================= FULFIL ================= */

    const fulfil = async (billItemId, maxQty) => {
        const qty = Number(fulfilQty[billItemId]);

        if (!qty || qty <= 0 || qty > maxQty) {
            alert("Enter valid fulfilment quantity");
            return;
        }

        setFulfilling(billItemId);
        try {
            await api.post(
                `/fulfilments/${billItemId}?quantity=${qty}`
            );
            await loadBill();
        } finally {
            setFulfilling(null);
        }
    };

    if (loading) return <div style={hint}>Loading bill…</div>;
    if (!bill) return <div style={hint}>Bill not found</div>;

    return (
        <div style={pageWrap}>
            <h2>🧾 Bill View</h2>

            {/* HEADER */}
            <div style={box}>
                <div><b>Bill No:</b> {bill.billNumber}</div>
                <div><b>Bill Code:</b> {bill.billCode}</div>
                <div><b>Date:</b> {new Date(bill.billDate).toLocaleString()}</div>
                <div><b>Payment Type:</b> {bill.paymentType}</div>
            </div>

            {/* CUSTOMER */}
            <div style={box}>
                <h4>👤 Customer</h4>
                <div><b>Name:</b> {bill.customerName || "-"}</div>
                <div><b>Code:</b> {bill.customerCode || "-"}</div>
                <div><b>Mobile:</b> {bill.customerMobile || "-"}</div>
                <div><b>Address:</b> {bill.customerAddress || "-"}</div>
            </div>

            {/* ITEMS */}
            <div style={box}>
                <h4>📦 Items</h4>

                <table style={table}>
                    <thead>
                    <tr>
                        <th>Item Code</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((i, idx) => {
                        const pending = i.pendingQty ?? 0;

                        return (
                            <tr key={idx}>
                                <td>{i.itemCode}</td>
                                <td>{i.itemName}</td>
                                <td>
                                    {i.quantity} {i.baseUnit}
                                    {pending > 0 && (
                                        <div style={pendingTxt}>
                                            Pending: {pending}
                                        </div>
                                    )}
                                </td>
                                <td>₹{i.price}</td>
                                <td>₹{i.amount}</td>

                                {/* 🆕 FULFIL */}
                                <td>
                                    {pending > 0 && (
                                        <div style={fulfilBox}>
                                            <input
                                                type="number"
                                                min={1}
                                                max={pending}
                                                value={fulfilQty[i.id] || ""}
                                                onChange={e =>
                                                    setFulfilQty({
                                                        ...fulfilQty,
                                                        [i.id]: e.target.value
                                                    })
                                                }
                                                style={qtyInput}
                                            />
                                            <button
                                                onClick={() =>
                                                    fulfil(i.id, pending)
                                                }
                                                disabled={
                                                    fulfilling === i.id
                                                }
                                                style={fulfilBtn}
                                            >
                                                {fulfilling === i.id
                                                    ? "..."
                                                    : "Fulfil"}
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* SUMMARY */}
            <div style={box}>
                <div>Subtotal: ₹{bill.subtotal}</div>
                <div>Discount: ₹{bill.discountAmount}</div>
                <div>Paid: ₹{bill.amountPaid}</div>
                <div><b>Total: ₹{bill.totalAmount}</b></div>
                <div style={due}>Due: ₹{bill.dueAmount}</div>
            </div>

            {/* ACTIONS */}
            <div style={actions}>
                <button
                    style={secondaryBtn}
                    onClick={() =>
                        (window.location.href =
                            `/billing/print/${billId}`)
                    }
                >
                    Print
                </button>

                {bill.dueAmount > 0 && (
                    <button
                        style={primaryBtn}
                        onClick={() => setSettleOpen(true)}
                    >
                        Settle
                    </button>
                )}
            </div>

            {/* SETTLEMENT */}
            {settleOpen && (
                <SettlePaymentModal
                    bill={{
                        billId: bill.billId,
                        billCode: bill.billCode,
                        totalAmount: bill.totalAmount,
                        paidAmount: bill.amountPaid,
                        dueAmount: bill.dueAmount
                    }}
                    onClose={() => setSettleOpen(false)}
                    onSuccess={() => {
                        setSettleOpen(false);
                        loadBill();
                    }}
                />
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = {
    padding: 24,
    maxWidth: 900,
    margin: "0 auto"
};

const box = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    border: "1px solid #eee"
};

const table = {
    width: "100%",
    borderCollapse: "collapse"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12
};

const primaryBtn = {
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const secondaryBtn = {
    padding: "10px 14px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const due = {
    color: "crimson",
    fontWeight: 600,
    marginTop: 6
};

const hint = {
    padding: 24,
    opacity: 0.6
};

/* 🆕 FULFIL STYLES */

const pendingTxt = {
    fontSize: 12,
    color: "crimson"
};

const fulfilBox = {
    display: "flex",
    gap: 6
};

const qtyInput = {
    width: 60,
    padding: "4px"
};

const fulfilBtn = {
    padding: "4px 8px",
    fontSize: 12,
    borderRadius: 4,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer"
};
