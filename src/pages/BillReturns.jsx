import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function BillReturns() {
    const { billId } = useParams();
    const navigate = useNavigate();

    const [billItems, setBillItems] = useState([]);
    const [bill, setBill] = useState(null);
    const [returnsData, setReturnsData] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [finalizingId, setFinalizingId] = useState(null);

    useEffect(() => {
        loadAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [billRes, itemsRes, returnsRes] = await Promise.all([
                api.get(`/bills/${billId}`),
                api.get(`/bill-items/${billId}/items`),
                api.get(`/returns?billId=${billId}`)
            ]);

            setBill(billRes.data.data);

            const items = itemsRes.data.data || [];
            setBillItems(items);
            setReturnsData(returnsRes.data.data);

            setRows(
                items.map(i => ({
                    billItemId: i.billItemId,
                    itemCode: i.itemCode,
                    itemName: i.itemName,
                    orderedQty: i.orderedQty,
                    returnedQty: i.returnedQty,
                    netQty: i.netQty,
                    returnMode: "DELIVERED",
                    deliveredQty: "",
                    pendingQty: "",
                    disabled: i.netQty === 0
                }))
            );
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (idx, patch) => {
        setRows(prev =>
            prev.map((r, i) => (i === idx ? { ...r, ...patch } : r))
        );
    };

    /* ================= CREATE RETURN ================= */

    const submit = async () => {
        const items = [];

        rows.forEach(r => {
            if (r.returnMode === "DELIVERED" && Number(r.deliveredQty) > 0) {
                items.push({
                    billItemId: r.billItemId,
                    returnedQuantity: Number(r.deliveredQty),
                    returnSource: "DELIVERED"
                });
            }

            if (r.returnMode === "PENDING" && Number(r.pendingQty) > 0) {
                items.push({
                    billItemId: r.billItemId,
                    returnedQuantity: Number(r.pendingQty),
                    returnSource: "PENDING"
                });
            }

            if (r.returnMode === "BOTH") {
                if (Number(r.deliveredQty) > 0) {
                    items.push({
                        billItemId: r.billItemId,
                        returnedQuantity: Number(r.deliveredQty),
                        returnSource: "DELIVERED"
                    });
                }
                if (Number(r.pendingQty) > 0) {
                    items.push({
                        billItemId: r.billItemId,
                        returnedQuantity: Number(r.pendingQty),
                        returnSource: "PENDING"
                    });
                }
            }
        });

        if (items.length === 0) {
            alert("Enter at least one return quantity");
            return;
        }

        setSaving(true);
        try {
            await api.post("/returns", { items });
            await loadAll();
        } finally {
            setSaving(false);
        }
    };

    /* ================= FINALIZE RETURN ================= */

    const finalizeReturn = async returnNoteId => {
        const ok = window.confirm(
            "Finalizing a return accepts it financially.\nIt does NOT refund money already paid.\n\nThis action is irreversible. Continue?"
        );
        if (!ok) return;

        setFinalizingId(returnNoteId);
        try {
            await api.post(`/returns/${returnNoteId}/finalize`);
            await loadAll();
        } finally {
            setFinalizingId(null);
        }
    };

    if (loading) return <div style={hint}>Loading returns…</div>;

    if (bill?.state !== "ACTIVE") {
        return (
            <div style={hint}>
                Returns are allowed only for ACTIVE bills.
            </div>
        );
    }

    return (
        <div style={page}>
            <h2 style={{ textAlign: "center" }}>↩ Sales Returns</h2>
            <div style={topActions}>
                <button
                    style={noteBtn}
                    onClick={() => navigate(`/bills/${billId}/returns`)}
                >
                    📄 View Return Notes
                </button>
            </div>

            {/* ================= CREATE RETURN TABLE ================= */}

            <table style={table}>
                <thead>
                    <tr>
                        <th style={th}>Item</th>
                        <th style={th}>Ordered</th>
                        <th style={th}>Already Returned</th>
                        <th style={th}>Net Qty</th>
                        <th style={th}>Return Type</th>
                        <th style={th}>Return Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, idx) => (
                        <tr key={r.billItemId}>
                            <td style={td}>{r.itemCode} • {r.itemName}</td>
                            <td style={td}>{r.orderedQty}</td>
                            <td style={td}>{r.returnedQty}</td>
                            <td style={td}>{r.netQty}</td>

                            <td style={td}>
                                <select
                                    value={r.returnMode}
                                    disabled={r.disabled}
                                    onChange={e =>
                                        updateRow(idx, {
                                            returnMode: e.target.value,
                                            deliveredQty: "",
                                            pendingQty: ""
                                        })
                                    }
                                >
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="BOTH">BOTH</option>
                                </select>
                            </td>

                            <td style={td}>
                                {(r.returnMode === "DELIVERED" || r.returnMode === "BOTH") && (
                                    <input
                                        type="number"
                                        placeholder="Delivered"
                                        value={r.deliveredQty}
                                        disabled={r.disabled}
                                        onChange={e =>
                                            updateRow(idx, { deliveredQty: e.target.value })
                                        }
                                        style={input}
                                    />
                                )}
                                {(r.returnMode === "PENDING" || r.returnMode === "BOTH") && (
                                    <input
                                        type="number"
                                        placeholder="Pending"
                                        value={r.pendingQty}
                                        disabled={r.disabled}
                                        onChange={e =>
                                            updateRow(idx, { pendingQty: e.target.value })
                                        }
                                        style={{ ...input, marginLeft: 6 }}
                                    />
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {returnsData && (
                <div style={summary}>
                    <div><b>Returned Gross:</b> ₹{returnsData.returnedGrossTotal}</div>
                    <div><b>Returned Effective:</b> ₹{returnsData.returnedEffectiveTotal}</div>
                </div>
            )}

            <div style={actions}>
                <button style={secondary} onClick={() => navigate(`/bills/${billId}/view`)}>
                    Back
                </button>
                <button style={primary} onClick={submit} disabled={saving}>
                    {saving ? "Processing…" : "Create Return"}
                </button>
            </div>

            {/* ================= RETURN NOTES ================= */}

            {returnsData?.returnNotes?.length > 0 && (
                <>
                    <h3 style={{ marginTop: 32 }}>📄 Return Notes</h3>

                    {returnsData.returnNotes.map(note => (
                        <div key={note.returnNoteId} style={noteCard}>
                            <div style={noteHeader}>
                                <div>
                                    <b>Return Note:</b> {note.returnNoteId}
                                </div>
                                <div>
                                    <b>Date:</b>{" "}
                                    {new Date(note.createdAt).toLocaleString()}
                                </div>
                            </div>

                            <ul style={{ marginTop: 8 }}>
                                {note.items.map((it, idx) => (
                                    <li key={idx}>
                                        {it.itemCode} • {it.itemName} — {it.quantity} ({it.returnType})
                                    </li>
                                ))}
                            </ul>

                            <div style={noteAmounts}>
                                <div>Gross Amount: ₹{note.grossAmount}</div>
                                <div>Effective Amount: ₹{note.effectiveAmount}</div>
                                <div>Already Refunded: ₹{note.alreadyRefunded}</div>
                                <div>
                                    <b>Refundable Remaining: ₹{note.refundableRemaining}</b>
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <b>Status:</b>{" "}
                                {note.finalized ? "FINALIZED" : "NOT FINALIZED"}
                            </div>

                            {!note.finalized && (
                                <>
                                    <button
                                        style={primary}
                                        onClick={() => finalizeReturn(note.returnNoteId)}
                                        disabled={finalizingId === note.returnNoteId}
                                    >
                                        {finalizingId === note.returnNoteId
                                            ? "Finalizing…"
                                            : "Finalize Return"}
                                    </button>

                                    <div style={helper}>
                                        Finalizing a return accepts it financially.
                                        It does NOT refund money already paid.
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const page = { padding: 24, maxWidth: 1100, margin: "0 auto" };
const table = { width: "100%", borderCollapse: "collapse", marginTop: 16 };
const th = { textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #ddd" };
const td = { padding: "8px 6px", borderBottom: "1px solid #f1f1f1" };
const input = { width: 80, padding: "4px 6px" };

const actions = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 };
const primary = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" };
const secondary = { padding: "8px 16px", background: "#e5e7eb", border: "none", borderRadius: 6 };

const summary = { marginTop: 12, fontSize: 13, display: "flex", justifyContent: "space-between" };
const noteCard = {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    background: "#fafafa"
};

const noteHeader = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 14
};

const noteAmounts = {
    marginTop: 8,
    fontSize: 13,
    display: "grid",
    gap: 4
};

const helper = {
    marginTop: 6,
    fontSize: 12,
    opacity: 0.7
};

const hint = { padding: 24, opacity: 0.6 };

const topActions = {
    display: "flex",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12
};

const noteBtn = {
    padding: "6px 14px",
    background: "#fff",
    border: "1px dashed #2563eb",
    color: "#2563eb",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 13
};

