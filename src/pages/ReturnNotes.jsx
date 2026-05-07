import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ReturnNotes() {
    const { billId } = useParams();
    const navigate = useNavigate();

    const [returnsData, setReturnsData] = useState(null);
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [finalizingId, setFinalizingId] = useState(null);

    useEffect(() => {
        loadReturns();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billId]);

    const loadReturns = async () => {
        setLoading(true);
        try {
            const [billRes, returnsRes] = await Promise.all([
                api.get(`/bills/${billId}`),
                api.get(`/returns?billId=${billId}`)
            ]);

            setBill(billRes.data.data);
            setReturnsData(returnsRes.data.data);

        } finally {
            setLoading(false);
        }
    };

    const finalizeReturn = async (returnId) => {
        if (!window.confirm("Finalizing a return accepts it financially.\nThis does NOT refund money.\n\nProceed?")) {
            return;
        }

        setFinalizingId(returnId);
        try {
            await api.post(`/returns/${returnId}/finalize`);
            await loadReturns();
        } finally {
            setFinalizingId(null);
        }
    };

    if (loading) return <div style={hint}>Loading return notes…</div>;

    const isActive = bill?.state === "ACTIVE";

    return (
        <div style={page}>
            <h2 style={{ textAlign: "center" }}>↩ Return Notes</h2>

            {(returnsData?.returns || []).length === 0 && (
                <div style={hint}>No return notes found.</div>
            )}

            {(returnsData?.returns || []).map(r => (
                <div key={r.returnId} style={card}>
                    {/* HEADER */}
                    <div style={cardHeader}>
                        <div>
                            <b>Return ID:</b>{" "}
                            {r.returnId.slice(0, 8)}…
                        </div>
                        <div>
                            <StatusBadge finalized={r.finalized} />
                        </div>
                    </div>

                    {/* ITEMS */}
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>Item</th>
                                <th style={th}>Qty</th>
                                <th style={th}>Type</th>
                                <th style={th}>Gross</th>
                                <th style={th}>Effective</th>
                                <th style={th}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {r.items.map((i, idx) => (
                                <tr key={idx}>
                                    <td style={td}>{i.itemCode} • {i.itemName}</td>
                                    <td style={td}>{i.quantity}</td>
                                    <td style={td}>{i.returnType}</td>
                                    <td style={td}>₹{i.grossAmount}</td>
                                    <td style={td}>₹{i.effectiveAmount}</td>
                                    <td style={td}>
                                        {new Date(i.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* SUMMARY */}
                    <div style={summary}>
                        <div><b>Returned Gross:</b> ₹{r.grossTotal}</div>
                        <div><b>Returned Effective:</b> ₹{r.effectiveTotal}</div>
                        <div><b>Already Refunded:</b> ₹{r.alreadyRefunded}</div>
                        <div>
                            <b>Refundable Remaining:</b>{" "}
                            ₹{r.refundableRemaining}
                        </div>
                        <button
                            style={tertiary}
                            onClick={() => navigate(`/returns/print/${r.returnId}`)}
                        >
                            Print Return
                        </button>
                    </div>

                    {/* FINALIZE */}
                    {isActive && !r.finalized && (
                        <div style={finalizeBox}>
                            <button
                                style={primary}
                                disabled={finalizingId === r.returnId}
                                onClick={() => finalizeReturn(r.returnId)}
                            >
                                {finalizingId === r.returnId
                                    ? "Finalizing…"
                                    : "Finalize Return"}
                            </button>
                            <div style={helperText}>
                                Finalizing a return accepts it financially.
                                It does NOT refund money already paid.
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* FOOTER TOTALS */}
            {returnsData && (
                <div style={footerTotals}>
                    <div>
                        <b>Total Returned Gross:</b>{" "}
                        ₹{returnsData.returnedGrossTotal}
                    </div>
                    <div>
                        <b>Total Returned Effective:</b>{" "}
                        ₹{returnsData.returnedEffectiveTotal}
                    </div>
                </div>
            )}

            <div style={actions}>
                <button
                    style={secondary}
                    onClick={() => navigate(`/bills/${billId}/view`)}
                >
                    Back to Bill
                </button>
            </div>
        </div>
    );
}

/* ================= SMALL COMPONENTS ================= */

function StatusBadge({ finalized }) {
    return (
        <span
            style={{
                padding: "4px 10px",
                borderRadius: 12,
                fontSize: 12,
                background: finalized ? "#dcfce7" : "#fef3c7",
                color: finalized ? "#166534" : "#92400e"
            }}
        >
            {finalized ? "FINALIZED" : "NOT FINALIZED"}
        </span>
    );
}

/* ================= STYLES ================= */

const page = { padding: 24, maxWidth: 1100, margin: "0 auto" };

const card = {
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    background: "#fff"
};

const cardHeader = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8
};

const th = {
    textAlign: "left",
    padding: "6px 4px",
    borderBottom: "1px solid #ddd"
};

const td = {
    padding: "6px 4px",
    borderBottom: "1px solid #f1f1f1"
};

const summary = {
    marginTop: 12,
    fontSize: 13,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 6
};

const finalizeBox = {
    marginTop: 14
};

const helperText = {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4
};

const footerTotals = {
    marginTop: 16,
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between"
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20
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

const tertiary = {
    padding: "4px 10px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    fontSize: 11,
    cursor: "pointer"
};

const hint = {
    padding: 24,
    opacity: 0.6
};
