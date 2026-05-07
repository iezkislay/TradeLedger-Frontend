import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function GstBillPrint() {
    const { billId } = useParams();
    const [bill, setBill] = useState(null);
    const [templateSize, setTemplateSize] = useState("A5");

    useEffect(() => {
        axios.get(`/bills/gst/bills/${billId}/print`)
            .then(res => setBill(res.data.data));
    }, [billId]);

    if (!bill) return <p>Loading...</p>;

    const formatDate = (d) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    const formatCurrency = (amt) =>
        new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amt || 0);

    /* ================= NUMBER TO WORDS ================= */
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

    return (
        <div style={{ textAlign: "center" }}>
            <style>
                {`@media print { .no-print { display: none; } }`}
            </style>

            <div className="no-print" style={{ marginBottom: 20 }}>
                <select
                    value={templateSize}
                    onChange={(e) => setTemplateSize(e.target.value)}
                >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="A6">A6</option>
                </select>
            </div>

            <div style={{ ...page, ...sizeStyles[templateSize], position: "relative" }}>

                <div style={watermark}>*** TAX INVOICE ***</div>

                <h2 style={{ marginBottom: 4 }}>Pooja Hardware</h2>
                <div>C K Road, Arrah</div>
                <div>GSTIN: 10ABCDE1234F1Z5</div>

                {/* 🔥 NEW: TAX INVOICE */}
                <div style={{ textAlign: "center", fontWeight: 700, marginTop: 10 }}>
                    TAX INVOICE
                </div>

                <div style={{ marginTop: 10 }}>
                    Bill No: {bill.billNumber}
                </div>
                <div>Date: {formatDate(bill.billDate)}</div>

                <hr />

                {/* 🔥 UPDATED CUSTOMER */}
                <div>
                    <b>Billed To:</b> {bill.customerName || "Cash"}
                </div>

                <div>
                    <b>Mobile:</b> {bill.customerMobile || "-"}
                </div>

                {/* ✅ NEW: GSTIN */}
                {bill.customerGstin && (
                    <div>
                        <b>GSTIN:</b> {bill.customerGstin}
                    </div>
                )}

                {/* ✅ NEW: ADDRESS */}
                {bill.customerAddress && (
                    <div>
                        <b>Address:</b> {bill.customerAddress}
                    </div>
                )}

                {/* PLACE OF SUPPLY */}
                <div>
                    <b>Place of Supply:</b> {bill.placeOfSupply || "Bihar (10)"}
                </div>

                <hr />

                {/* ITEMS */}
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={{ ...th, width: 40, textAlign: "center" }}>S.No</th>
                            <th style={{ ...th }}>Item</th>
                            <th style={{ ...th, width: 90, textAlign: "center" }}>HSN</th>
                            <th style={{ ...th, width: 90, textAlign: "right" }}>Qty</th>
                            <th style={{ ...th, width: 100, textAlign: "right" }}>Rate</th>
                            <th style={{ ...th, width: 110, textAlign: "right" }}>Taxable</th>
                            <th style={{ ...th, width: 100, textAlign: "right" }}>CGST</th>
                            <th style={{ ...th, width: 100, textAlign: "right" }}>SGST</th>
                            <th style={{ ...th, width: 110, textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        {bill.items.map((i, idx) => (
                            <tr key={idx}>
                                <td style={tdCenter}>{idx + 1}</td>

                                <td style={tdLeft}>{i.name}</td>

                                <td style={tdCenter}>{i.hsn}</td>

                                <td style={tdRight}>
                                    {i.qty} {i.baseUnit || ""}
                                </td>

                                <td style={tdRight}>₹ {formatCurrency(i.rate)}</td>

                                <td style={tdRight}>₹ {formatCurrency(i.taxable)}</td>

                                <td style={tdRight}>₹ {formatCurrency(i.cgst)}</td>

                                <td style={tdRight}>₹ {formatCurrency(i.sgst)}</td>

                                <td style={tdRight}>
                                    <b>₹ {formatCurrency(i.amount)}</b>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr />

                {/* GST SUMMARY */}
                <table style={table}>
                    <thead>
                        <tr>
                            <th style={{ ...th, textAlign: "center", width: 80 }}>GST %</th>
                            <th style={{ ...th, textAlign: "right" }}>Taxable</th>
                            <th style={{ ...th, textAlign: "right" }}>CGST</th>
                            <th style={{ ...th, textAlign: "right" }}>SGST</th>
                            <th style={{ ...th, textAlign: "right" }}>Total Tax</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.gstSummary.map((g, idx) => (
                            <tr key={idx}>
                                <td style={tdCenter}>{g.gstRate}%</td>
                                <td style={tdRight}>₹ {formatCurrency(g.taxable)}</td>
                                <td style={tdRight}>₹ {formatCurrency(g.cgst)}</td>
                                <td style={tdRight}>₹ {formatCurrency(g.sgst)}</td>
                                <td style={tdRight}>₹ {formatCurrency((g.cgst || 0) + (g.sgst || 0))}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr />

                {/* TOTALS */}
                <div style={totalsWrap}>
                    <div>Taxable: ₹ {formatCurrency(bill.taxableAmount)}</div>
                    <div>CGST: ₹ {formatCurrency(bill.cgstAmount)}</div>
                    <div>SGST: ₹ {formatCurrency(bill.sgstAmount)}</div>
                    <div style={{ fontWeight: 700 }}>
                        Total: ₹ {formatCurrency(bill.totalAmount)}
                    </div>
                </div>

                <hr />

                {/* 🔥 IMPROVED WORDS */}
                <div>
                    <b>Amount in Words:</b> {numberToWords(bill.totalAmount)}
                </div>

                <hr />

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>

                    <div style={{ fontSize: 12 }}>
                        This is a computer-generated invoice and does not require a physical signature.
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <div style={{ marginTop: 30, fontWeight: 600 }}>
                            Authorized Signatory
                        </div>
                    </div>

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
    fontSize: 13,
    fontFamily: "Arial, sans-serif",
    textAlign: "left"
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10
};

const th = {
    borderBottom: "1px solid #ddd",
    padding: "6px 4px",
    textAlign: "left"
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

const watermark = {
    position: "absolute",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: 35,
    opacity: 0.05,
    fontWeight: 700
};

const printBtn = {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};