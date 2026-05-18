import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

/* ===============================
   TRADELEDGER PRINT TEMPLATE
   FINAL PROFESSIONAL VERSION
   =============================== */

export default function BillPrint() {
    const { billId } = useParams();
    const [bill, setBill] = useState(null);
    const [templateSize, setTemplateSize] = useState("A5");

    useEffect(() => {
        axios.get(`/bills/${billId}/print`)
            .then(res => setBill(res.data));
    }, [billId]);

    if (!bill) return <p>Loading...</p>;

    /* ===============================
       DATE FORMAT → 18 Feb 2026
       =============================== */
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d)) return "-";
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    /* ===============================
       CURRENCY FORMAT
       =============================== */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    /* ===============================
       NUMBER TO WORDS (INDIAN)
       =============================== */
    const numberToWords = (num) => {
        if (!num) return "Zero Rupees Only";

        const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
        const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
            "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        const convert = (n) => {
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100)
                return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
            if (n < 1000)
                return ones[Math.floor(n / 100)] + " Hundred " + (n % 100 ? convert(n % 100) : "");
            if (n < 100000)
                return convert(Math.floor(n / 1000)) + " Thousand " + (n % 1000 ? convert(n % 1000) : "");
            if (n < 10000000)
                return convert(Math.floor(n / 100000)) + " Lakh " + (n % 100000 ? convert(n % 100000) : "");
            return convert(Math.floor(n / 10000000)) + " Crore " + (n % 10000000 ? convert(n % 10000000) : "");
        };

        return convert(Math.floor(num)) + " Rupees Only";
    };

    const sizeStyles = {
        A4: { width: "210mm", minHeight: "297mm" },
        A5: { width: "148mm", minHeight: "210mm" },
        A6: { width: "105mm", minHeight: "148mm" }
    };

    const watermarkText = (() => {
        switch (bill.state) {
            case "ESTIMATE":
                return "*** ESTIMATE ***";
            case "ACTIVE":
                return "*** RETAIL INVOICE ***";
            case "CLOSED":
                return "*** RETAIL INVOICE ***";
            case "CANCELLED":
                return "*** CANCELLED ***";
            default:
                return "";
        }
    })();

    return (
        <div style={{ textAlign: "center" }}>

            <style>
                {`
                @media print {
                    .no-print { display: none; }
                }
                `}
            </style>

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

                {/* WATERMARK */}
                <div style={watermark}>
                    {watermarkText}
                </div>

                <h2 style={{ marginBottom: 4 }}>Pooja Hardware</h2>
                <div>C K Road, Arrah</div>
                <div>Mobile: 9304646404</div>

                <div style={{ marginTop: 10 }}>
                    Bill No: {bill.billNumber}
                </div>
                <div>Date: {formatDate(bill.billDate)}</div>

                <hr style={lightHr} />

                <div><b>Customer:</b> {bill.customerName || "Walk-in"}</div>
                <div><b>Mobile:</b> {bill.customerMobile || "-"}</div>
                <div><b>Address:</b> {bill.customerAddress || "-"}</div>

                <hr style={lightHr} />

                <table style={table}>
                    <thead>
                        <tr>
                            <th style={{ ...th, width: 40 }}>S.No</th>
                            <th style={th}>Description of Goods</th>
                            <th style={{ ...th, width: 70, textAlign: "right" }}>Qty</th>
                            <th style={{ ...th, width: 70, textAlign: "right" }}>Rate</th>
                            <th style={{ ...th, width: 90, textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, idx) => (
                            <tr key={idx}>
                                <td style={tdCenter}>{idx + 1}</td>
                                <td style={tdLeft}>
                                    <div>{item.name}</div>

                                    {item.brand && (
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#666",
                                                marginTop: 2
                                            }}
                                        >
                                            ({item.brand})
                                        </div>
                                    )}
                                </td>
                                <td style={tdRight}>{item.quantity} {item.unit}</td>
                                <td style={tdRight}>₹ {formatCurrency(item.price)}</td>
                                <td style={tdRight}>₹ {formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr style={lightHr} />

                <div style={totalsWrap}>
                    <div>Subtotal: ₹ {formatCurrency(bill.subtotal)}</div>
                    <div>Discount: ₹ {formatCurrency(bill.discount)}</div>
                    <div style={{ fontWeight: 700 }}>
                        Final Total: ₹ {formatCurrency(bill.total)}
                    </div>
                    <div>Paid: ₹ {formatCurrency(bill.paid)}</div>
                    <div><b>Due: ₹ {formatCurrency(bill.due)}</b></div>
                </div>

                <hr style={lightHr} />

                <div style={{ marginTop: 10 }}>
                    <b>Amount in Words:</b> {numberToWords(bill.total)}
                </div>

                {/* FOOTER MESSAGE */}
                <div style={footerNote}>
                    Thank you for your business! <br />
                    Goods once sold will not be taken back without bill.
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
