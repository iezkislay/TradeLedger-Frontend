import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function ReturnPrint() {
    const { returnNoteId } = useParams();
    const [data, setData] = useState(null);
    const [templateSize, setTemplateSize] = useState("A5");

    useEffect(() => {
        axios
            .get(`/returns/${returnNoteId}/print`)
            .then(res => setData(res.data));
    }, [returnNoteId]);

    if (!data) return <p>Loading...</p>;

    /* ================= DATE ================= */
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d)) return "-";
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    /* ================= CURRENCY ================= */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const sizeStyles = {
        A4: { width: "210mm", minHeight: "297mm" },
        A5: { width: "148mm", minHeight: "210mm" },
        A6: { width: "105mm", minHeight: "148mm" }
    };

    const watermarkText = "*** RETURN NOTE ***";

    return (
        <div style={{ textAlign: "center" }}>
            <style>
                {`
                @media print {
                    .no-print { display: none; }
                }
                `}
            </style>

            {/* SIZE SELECTOR */}
            <div className="no-print" style={{ marginBottom: 20 }}>
                <label>Select Size: </label>
                <select
                    value={templateSize}
                    onChange={(e) => setTemplateSize(e.target.value)}
                >
                    <option value="A4">A4</option>
                    <option value="A5">A5 (Default)</option>
                    <option value="A6">A6</option>
                </select>
            </div>

            <div style={{ ...page, ...sizeStyles[templateSize], position: "relative" }}>
                <div style={watermark}>
                    {watermarkText}
                </div>

                {/* HEADER */}
                <h2 style={{ marginBottom: 4 }}>Pooja Hardware</h2>
                <div>C K Road, Arrah</div>
                <div>Mobile: 9304646404</div>

                <div style={{ marginTop: 10 }}>
                    <b>Return No:</b> {data.returnNumber}
                </div>
                <div><b>Date:</b> {formatDate(data.returnDate)}</div>

                <hr style={lightHr} />

                {/* CUSTOMER (OPTIONAL) */}
                {(data.customerName || data.customerMobile || data.customerAddress) && (
                    <>
                        <div><b>Customer:</b> {data.customerName || "-"}</div>
                        <div><b>Mobile:</b> {data.customerMobile || "-"}</div>
                        <div><b>Address:</b> {data.customerAddress || "-"}</div>
                        <hr style={lightHr} />
                    </>
                )}

                {/* ITEMS */}
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={{ ...th, width: 40 }}>S.No</th>
                            <th style={th}>Item</th>
                            <th style={{ ...th, textAlign: "right" }}>Qty</th>
                            <th style={{ ...th, textAlign: "right" }}>Rate</th>
                            <th style={{ ...th, textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td style={tdCenter}>{idx + 1}</td>
                                <td style={tdLeft}>{item.name}</td>
                                <td style={tdRight}>
                                    {item.quantity} {item.unit}
                                </td>
                                <td style={tdRight}>
                                    ₹ {formatCurrency(item.rate)}
                                </td>
                                <td style={tdRight}>
                                    ₹ {formatCurrency(item.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr style={lightHr} />

                {/* SUMMARY */}
                <div style={totalsWrap}>
                    <div>Returned Gross: ₹ {formatCurrency(data.returnedGross)}</div>
                    <div>Discount Clawed Back: ₹ {formatCurrency(data.discountClawedBack)}</div>
                    <div style={{ fontWeight: 700 }}>
                        Net Return: ₹ {formatCurrency(data.netReturn)}
                    </div>
                </div>

                <hr style={lightHr} />

                {/* FOOTER */}
                <div style={footerNote}>
                    This is a system generated return note.
                </div>

                <br />

                <button
                    className="no-print"
                    onClick={() => window.print()}
                    style={printBtn}
                >
                    🖨 Print
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 20,
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    background: "#fff",
    textAlign: "left"
};

const watermark = {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: 35,
    opacity: 0.05,
    fontWeight: 700,
    pointerEvents: "none"
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
};

const lightHr = {
    border: "none",
    borderTop: "1px solid #ddd",
    margin: "10px 0"
};

const th = {
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    padding: "6px 4px"
};

const tdLeft = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "left"
};

const tdRight = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "right"
};

const tdCenter = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "center"
};

const totalsWrap = {
    marginTop: 10,
    textAlign: "right",
    lineHeight: 1.8
};

const footerNote = {
    marginTop: 20,
    fontSize: 11,
    textAlign: "center",
    opacity: 0.8
};

const printBtn = {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};