import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ActivateBillModal from "../components/ActivateBillModal";
import api from "../api/axios";
import SettlePaymentModal from "../components/SettlePaymentModal";

export default function BillView() {
    const { billId } = useParams();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [items, setItems] = useState([]);
    const [fulfilments, setFulfilments] = useState([]);
    const [returnsData, setReturnsData] = useState(null);
    const [refunds, setRefunds] = useState([]);
    const [ledger, setLedger] = useState(null);

    const [loading, setLoading] = useState(true);
    const [settleOpen, setSettleOpen] = useState(false);
    const [closing, setClosing] = useState(false);
    const [activateOpen, setActivateOpen] = useState(false);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [
                billRes,
                itemsRes,
                fulfilRes,
                returnsRes,
                refundsRes,
                ledgerRes
            ] = await Promise.all([
                api.get(`/bills/${billId}`),
                api.get(`/bill-items/${billId}/items`),
                api.get(`/fulfilments?billId=${billId}`),
                api.get(`/returns?billId=${billId}`),
                api.get(`/refunds?billId=${billId}`),
                api.get(`/ledger/bill/${billId}/summary`)
            ]);

            setBill(billRes.data.data);
            setItems(itemsRes.data.data || []);
            setFulfilments(fulfilRes.data.data || []);
            setReturnsData(returnsRes.data.data);
            setRefunds(refundsRes.data.data || []);
            setLedger(ledgerRes.data.data);
        } finally {
            setLoading(false);
        }
    };

    const closeBill = async () => {
        const ok = window.confirm(
            "Closing a bill permanently locks it.\nNo returns, refunds, or changes will be possible.\n\nContinue?"
        );
        if (!ok) return;

        setClosing(true);
        try {
            await api.post(`/bills/${billId}/close`);
            await loadAll();
        } finally {
            setClosing(false);
        }
    };

// ================= ESTIMATE ACTIONS =================

const cancelEstimate = async () => {
    const ok = window.confirm("Cancel this estimate? This cannot be undone.");
    if (!ok) return;

    await api.post(`/bills/${billId}/cancel`);
    await loadAll();
};


    if (loading) return <div style={hint}>Loading bill…</div>;
    if (!bill) return <div style={hint}>Bill not found</div>;

    // ================= DERIVED BILL STATE FLAGS =================
    const isActive = bill.state === "ACTIVE";
    const isClosed = bill.state === "CLOSED";
    const isEstimate = bill.state === "ESTIMATE";
    const isCancelled = bill.state === "CANCELLED";

    return (
        <div style={pageWrap}>
            <h2 style={{ textAlign: "center" }}>🧾 Bill View</h2>

            {/* ================= BILL STATE BANNER ================= */}
            <div style={{ ...stateBanner, ...stateStyles[bill.state] }}>
                <b>State:</b> {bill.state}
            </div>

            {isEstimate && (
                <div style={estimateBanner}>
                    🟡 This is an ESTIMATE. No stock or payment recorded.
                </div>
            )}

            {isClosed && (
                <div style={closedBanner}>
                    🔵 This Bill is CLOSED. No further actions allowed.
                </div>
            )}

            {isCancelled && (
                <div style={cancelledBanner}>
                    🔴 This Estimate was CANCELLED.
                </div>
            )}

            {/* ================= BILL DETAILS ================= */}
            <Section title="Bill Details">
                <Grid>
                    <div><b>Bill No:</b> {bill.billNumber}</div>
                    <div><b>Bill Code:</b> {bill.billCode}</div>
                    <div><b>Date:</b> {new Date(bill.billDate).toLocaleString()}</div>
                    <div><b>Payment Type:</b> {bill.paymentType || "-"}</div>
                </Grid>
            </Section>

            <Section title="Customer">
                <Grid>
                    <div><b>Name:</b> {bill.customerName || "-"}</div>
                    <div><b>Code:</b> {bill.customerCode || "-"}</div>
                    <div><b>Mobile:</b> {bill.customerMobile || "-"}</div>
                    <div><b>Address:</b> {bill.customerAddress || "-"}</div>
                </Grid>
            </Section>

            <Section title="Amount Summary">
                <Grid>
                    <div>Subtotal: ₹{bill.subtotal}</div>
                    <div>Discount: ₹{bill.discountAmount}</div>
                    <div><b>Effective Total: ₹{bill.effectiveTotal}</b></div>
                    <div>Amount Paid: ₹{bill.amountPaid}</div>
                    <div style={due}>Due: ₹{bill.dueAmount}</div>
                    <div>Returned (Gross): ₹{bill.returnedAmount}</div>
                </Grid>
            </Section>

            {/* ================= ACTIONS ================= */}
            <div style={actions}>

                {/* ✅ Always allowed */}
                <button
                    style={secondaryBtn}
                    onClick={() => navigate(`/billing/print/${billId}`)}
                >
                    Print
                </button>

                {/* ================= ESTIMATE ================= */}
                {isEstimate && (
                    <>
                        <button
                            style={primaryBtn}
                            onClick={() => setActivateOpen(true)}
                        >
                            Activate
                        </button>

                        <button style={dangerBtn} onClick={cancelEstimate}>
                            Cancel Estimate
                        </button>
                    </>
                )}

                {/* ================= ACTIVE ================= */}
                {isActive && (
                    <>
                        {bill.dueAmount > 0 && (
                            <button
                                style={primaryBtn}
                                onClick={() => setSettleOpen(true)}
                            >
                                Settle
                            </button>
                        )}

                        <button
                            style={secondaryBtn}
                            onClick={() => navigate(`/bills/${billId}/returns/new`)}
                        >
                            Returns
                        </button>

                        <button
                            style={secondaryBtn}
                            onClick={() => navigate(`/bills/${billId}/refund`)}
                        >
                            Refund
                        </button>

                        <button
                            style={secondaryBtn}
                            onClick={() => navigate(`/fulfilments/pending`)}
                        >
                            Fulfil
                        </button>

                        {/* 🔒 Close allowed only when ACTIVE + ledger settled */}
                        {ledger?.netBalance === 0 && (
                            <button
                                style={dangerBtn}
                                onClick={closeBill}
                                disabled={closing}
                            >
                                {closing ? "Closing…" : "Close Bill"}
                            </button>
                        )}
                    </>
                )}

            </div>

            {/* ================= BILL ITEMS ================= */}
            <Section title="Billed Items">
                <Table
                    headers={[
                        "Item Code",
                        "Name",
                        "Ordered",
                        "Fulfilled",
                        "Returned",
                        "Pending",
                        "Net Qty",
                        "Rate",
                        "Amount"
                    ]}
                    rows={items.map(i => [
                        i.itemCode,
                        i.itemName,
                        i.orderedQty,
                        i.fulfilledQty,
                        i.returnedQty,
                        i.pendingQty,
                        i.netQty,
                        `₹${i.rate}`,
                        `₹${i.amount}`
                    ])}
                />
            </Section>

            {/* ================= FULFILMENTS ================= */}
            <Section title="Fulfilments">
                <Table
                    headers={["Item", "Fulfilled", "Pending", "Status", "Last Fulfilled"]}
                    rows={fulfilments.map(f => [
                        `${f.itemCode} • ${f.itemName}`,
                        f.fulfilledQty,
                        f.pendingQty,
                        f.status,
                        f.lastFulfilledAt
                            ? new Date(f.lastFulfilledAt).toLocaleString()
                            : "-"
                    ])}
                />
            </Section>

            {/* ================= RETURNS ================= */}
            <Section title="Returns">
                <Table
                    headers={[
                        "Item",
                        "Qty",
                        "Type",
                        "Gross Amount",
                        "Effective Amount",
                        "Date"
                    ]}
                    rows={
                        (returnsData?.returns || [])
                            .flatMap(ret =>
                                (ret.items || []).map(i => [
                                    `${i.itemCode} • ${i.itemName}`,
                                    i.quantity,
                                    i.returnType,
                                    `₹${i.grossAmount}`,
                                    `₹${i.effectiveAmount}`,
                                    new Date(i.createdAt).toLocaleString()
                                ])
                            )
                    }
                />
            </Section>

            {/* ================= REFUNDS ================= */}
            <Section title="Refunds">
                <Table
                    headers={["Amount", "Mode", "Reason", "Date"]}
                    rows={refunds.map(r => [
                        `₹${r.amount}`,
                        r.refundMode || "-",
                        r.reason || "-",
                        new Date(r.createdAt).toLocaleString()
                    ])}
                />
            </Section>

            {/* ================= LEDGER ================= */}
            <Section title="Ledger Summary">
                <Grid>
                    <div>Debit (Bill): ₹{ledger?.debit}</div>
                    <div>Credit (Paid): ₹{ledger?.credit}</div>
                    <div>Return Credit: ₹{ledger?.returnCredit}</div>
                    <div>Adjustment: ₹{ledger?.adjustment}</div>
                    <div><b>Net Balance: ₹{ledger?.netBalance}</b></div>
                </Grid>
            </Section>

            {activateOpen && (
                <ActivateBillModal
                    billId={billId}
                    effectiveTotal={bill.effectiveTotal}
                    onClose={() => setActivateOpen(false)}
                    onSuccess={() => {
                        setActivateOpen(false);
                        loadAll();
                    }}
                />
            )}

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
                        loadAll();
                    }}
                />
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = { padding: 24, maxWidth: 1100, margin: "0 auto" };

const box = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    border: "1px solid #eee"
};

const sectionTitle = { marginBottom: 12, textAlign: "center" };

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 8
};

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: "6px 4px", borderBottom: "1px solid #ddd" };
const td = { textAlign: "left", padding: "6px 4px", borderBottom: "1px solid #f1f1f1" };

const actions = { display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 16 };

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

const dangerBtn = {
    padding: "10px 14px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};

const due = { color: "crimson", fontWeight: 600 };

const stateBanner = {
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14
};

const stateStyles = {
    ESTIMATE: { background: "#fef3c7", color: "#92400e" },
    ACTIVE: { background: "#dcfce7", color: "#166534" },
    CLOSED: { background: "#e5e7eb", color: "#374151" },
    CANCELLED: { background: "#fee2e2", color: "#991b1b" }
};

const estimateBanner = {
    background: "#fff3cd",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: 600
};

const closedBanner = {
    background: "#dbeafe",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: 600
};

const cancelledBanner = {
    background: "#fee2e2",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: 600
};

const hint = { padding: 24, opacity: 0.6 };

function Section({ title, children }) {
    return (
        <div style={box}>
            <h3 style={sectionTitle}>{title}</h3>
            {children}
        </div>
    );
}

function Grid({ children }) {
    return <div style={grid}>{children}</div>;
}

function Table({ headers, rows }) {
    return (
        <table style={table}>
            <thead>
                <tr>
                    {headers.map((h, i) => (
                        <th key={i} style={th}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={headers.length} style={td}>
                            No data
                        </td>
                    </tr>
                ) : (
                    rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => (
                                <td key={j} style={td}>{cell}</td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
}
