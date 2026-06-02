import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

/* ===============================
   TRADELEDGER
   CONSOLIDATED CUSTOMER STATEMENT
   =============================== */

export default function BillPrint() {

    const { billId } = useParams();

    const [bill, setBill] = useState(null);
    const [templateSize, setTemplateSize] = useState("A5");

    useEffect(() => {

        axios
            .get(`/bills/${billId}/customer-print`)
            .then(res => setBill(res.data));

    }, [billId]);

    if (!bill) return <p>Loading...</p>;
    const displayPaidAmount =
        bill.paymentType === "CASH" ||
        bill.paymentType === "UPI"
            ? bill.effectiveTotal
            : bill.paidAmount;

    const hasReturns = bill.items.some(
        item => Number(item.returnedQty || 0) > 0
    );

    /* ===============================
       DATE FORMAT
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
       NUMBER TO WORDS
       =============================== */

    const numberToWords = (num) => {

        if (!num) return "Zero Rupees Only";

        const ones = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine"
        ];

        const teens = [
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen"
        ];

        const tens = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety"
        ];

        const convert = (n) => {

            if (n < 10) return ones[n];

            if (n < 20) return teens[n - 10];

            if (n < 100) {
                return (
                    tens[Math.floor(n / 10)] +
                    (n % 10 ? " " + ones[n % 10] : "")
                );
            }

            if (n < 1000) {
                return (
                    ones[Math.floor(n / 100)] +
                    " Hundred " +
                    (n % 100 ? convert(n % 100) : "")
                );
            }

            if (n < 100000) {
                return (
                    convert(Math.floor(n / 1000)) +
                    " Thousand " +
                    (n % 1000 ? convert(n % 1000) : "")
                );
            }

            if (n < 10000000) {
                return (
                    convert(Math.floor(n / 100000)) +
                    " Lakh " +
                    (n % 100000 ? convert(n % 100000) : "")
                );
            }

            return (
                convert(Math.floor(n / 10000000)) +
                " Crore " +
                (n % 10000000
                    ? convert(n % 10000000)
                    : "")
            );
        };

        return (
            convert(Math.floor(num)) +
            " Rupees Only"
        );
    };

    /* ===============================
       PAPER SIZES
       =============================== */

    const sizeStyles = {

        A4: {
            width: "210mm",
            minHeight: "297mm"
        },

        A5: {
            width: "148mm",
            minHeight: "210mm"
        },

        A6: {
            width: "105mm",
            minHeight: "148mm"
        }
    };

    /* ===============================
       WATERMARK
       =============================== */

    const watermarkText = (() => {

        switch (bill.state) {

            case "ESTIMATE":
                return "*** ESTIMATE ***";

            case "ACTIVE":
                return "*** ESTIMATE ***";

            case "CLOSED":
                return "*** ESTIMATE ***";

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
                        .no-print {
                            display: none;
                        }
                    }
                `}
            </style>

            {/* ===============================
               PRINT CONTROLS
               =============================== */}

            <div
                className="no-print"
                style={{ marginBottom: 20 }}
            >

                <label>Select Size: </label>

                <select
                    value={templateSize}
                    onChange={(e) =>
                        setTemplateSize(e.target.value)
                    }
                >
                    <option value="A4">A4</option>
                    <option value="A5">A5 (Default)</option>
                    <option value="A6">A6</option>
                </select>
            </div>

            {/* ===============================
               PAGE
               =============================== */}

            <div
                style={{
                    ...page,
                    ...sizeStyles[templateSize],
                    position: "relative"
                }}
            >

                {/* WATERMARK */}

                <div style={watermark}>
                    {watermarkText}
                </div>

                {/* ===============================
                   TOP COMPACT HEADER
                   =============================== */}

                <div style={compactTopGrid}>

                    {/* LEFT */}

                    <div>

                        <h2 style={shopTitle}>
                            Pooja Hardware
                        </h2>

                        <div>C K Road, Arrah</div>

                        <div>
                            Mobile: 9304646404
                        </div>

                        <div style={{ marginTop: 8 }}>
                            <b>Customer:</b>{" "}
                            {bill.customerName || "Walk-in"}
                        </div>

                        <div>
                            <b>Mobile:</b>{" "}
                            {bill.customerMobile || "-"}
                        </div>

                    </div>

                    {/* RIGHT */}

                    <div style={{ textAlign: "right" }}>

                        <div>
                            <b>Bill No:</b>
                        </div>

                        <div>
                            {bill.billNumber}
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <b>Date:</b>
                        </div>

                        <div>
                            {formatDate(bill.billDate)}
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <b>Address:</b>
                        </div>

                        <div>
                            {bill.customerAddress || "-"}
                        </div>

                    </div>

                </div>

                <hr style={lightHr} />

                {/* ===============================
                   ITEMS TABLE
                   =============================== */}

                <table style={table}>

                    <thead>

                        <tr>

                            <th
                                style={{
                                    ...th,
                                    width: 40
                                }}
                            >
                                S.No
                            </th>

                            <th style={th}>
                                Description
                            </th>

                            <th
                                style={{
                                    ...th,
                                    width: hasReturns ? 55 : 90,
                                    textAlign: "center"
                                }}
                            >
                                Ordered
                            </th>

                            {hasReturns && (
                                <th
                                    style={{
                                        ...th,
                                        width: 55,
                                        textAlign: "center"
                                    }}
                                >
                                    Returned
                                </th>
                            )}

                            {hasReturns && (
                                <th
                                    style={{
                                        ...th,
                                        width: 55,
                                        textAlign: "center"
                                    }}
                                >
                                    Net
                                </th>
                            )}

                            <th
                                style={{
                                    ...th,
                                    width: 80,
                                    textAlign: "right"
                                }}
                            >
                                Rate
                            </th>

                            <th
                                style={{
                                    ...th,
                                    width: 100,
                                    textAlign: "right"
                                }}
                            >
                                Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {bill.items.map((item, idx) => (

                            <tr key={idx}>

                                <td style={tdCenter}>
                                    {idx + 1}
                                </td>

                                <td style={tdLeft}>

                                    <div>
                                        {item.itemName}
                                    </div>

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

                                <td style={tdCenter}>
                                    {item.orderedQty}
                                    {item.unit ? ` ${item.unit}` : ""}
                                </td>

                                {hasReturns && (
                                    <td style={tdCenter}>
                                        {item.returnedQty > 0
                                            ? `${item.returnedQty} ${item.unit || ""}`
                                            : "-"}
                                    </td>
                                )}

                                {hasReturns && (
                                    <td style={tdCenter}>
                                        <b>
                                            {item.netQty}
                                            {item.unit ? ` ${item.unit}` : ""}
                                        </b>
                                    </td>
                                )}

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

                {/* ===============================
                   FINANCIAL SUMMARY
                   =============================== */}

                <div style={bottomSummaryContainer}>

                    <div style={compactSummaryBox}>

                        <div style={summaryTitle}>
                            FINANCIAL SUMMARY
                        </div>

                        <div style={summaryRow}>
                            <span>Original</span>
                            <span>
                                ₹ {formatCurrency(bill.subtotal)}
                            </span>
                        </div>

                        {bill.discount > 0 && (
                            <div style={summaryRow}>
                                <span>Discount</span>
                                <span>
                                    - ₹ {formatCurrency(bill.discount)}
                                </span>
                            </div>
                        )}

                        {bill.returnedAmount > 0 && (
                            <div style={summaryRow}>
                                <span>Returned</span>
                                <span>
                                    - ₹ {formatCurrency(bill.returnedAmount)}
                                </span>
                            </div>
                        )}

                        <hr style={summaryHr} />

                        <div style={summaryRowBold}>
                            <span>Net Total</span>
                            <span>
                                ₹ {formatCurrency(bill.effectiveTotal)}
                            </span>
                        </div>

                        <hr style={summaryHr} />

                        <div style={summaryRow}>
                            <span>Paid</span>
                            <span>
                                ₹ {formatCurrency(displayPaidAmount)}
                            </span>
                        </div>

                        {bill.refundedAmount > 0 && (
                            <div style={summaryRow}>
                                <span>Refund</span>
                                <span>
                                    ₹ {formatCurrency(bill.refundedAmount)}
                                </span>
                            </div>
                        )}

                        {bill.adjustment > 0 && (
                            <div style={summaryRow}>
                                <span>Adjustment</span>
                                <span>
                                    ₹ {formatCurrency(bill.adjustment)}
                                </span>
                            </div>
                        )}

                        <div style={summaryRowFinal}>
                            <span>Due</span>
                            <span>
                                ₹ {formatCurrency(bill.dueAmount)}
                            </span>
                        </div>

                    </div>

                </div>

                {/* ===============================
                   AMOUNT IN WORDS
                   =============================== */}

                <div style={{ marginTop: 18 }}>

                    <b>Amount in Words:</b>{" "}

                    {numberToWords(
                        bill.effectiveTotal
                    )}

                </div>

                {/* ===============================
                   FOOTER
                   =============================== */}

                <div style={footerNote}>

                    Thank you for your business!

                    <br />

                    Goods once sold will not be taken back without bill.

                </div>

                {/* ===============================
                   PRINT BUTTON
                   =============================== */}

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

/* =====================================================
   STYLES
   ===================================================== */

const page = {
    padding: 12,
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    background: "#fff",
    textAlign: "left"
};

const watermark = {
    position: "absolute",
    top: "35%",
    left: "50%",
    transform: "translate(-50%, -50%) rotate(-30deg)",
    fontSize: 34,
    opacity: 0.05,
    fontWeight: 700,
    pointerEvents: "none"
};

const headerGrid = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10
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

const summaryHr = {
    border: "none",
    borderTop: "1px dashed #ccc",
    margin: "10px 0"
};

const th = {
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    padding: "6px 4px",
    fontSize: 12
};

const tdLeft = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "left",
    verticalAlign: "top"
};

const tdRight = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "right",
    verticalAlign: "top"
};

const tdCenter = {
    borderBottom: "1px solid #eee",
    padding: "6px 4px",
    textAlign: "center",
    verticalAlign: "top"
};

const summaryBox = {
    width: 320,
    marginLeft: "auto",
    marginTop: 15,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 12
};

const summaryTitle = {
    fontWeight: 700,
    marginBottom: 12,
    fontSize: 14
};

const summaryRow = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 13
};

const summaryRowBold = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
    fontWeight: 700,
    fontSize: 14
};

const summaryRowFinal = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    fontWeight: 700,
    fontSize: 15
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

const bottomSummaryContainer = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 12
};

const compactSummaryBox = {
    width: 320,
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 12
};

const compactTopGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 180px",
    gap: 20,
    alignItems: "start"
};

const shopTitle = {
    margin: 0,
    marginBottom: 6,
    fontSize: 28
};