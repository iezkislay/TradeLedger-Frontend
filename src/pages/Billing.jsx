import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import { searchCustomers } from "../api/customerApi";

/* =====================================================
   TRADELEDGER — MODERN BILLING PAGE
   MOBILE + TABLET FRIENDLY
   ===================================================== */

export default function Billing() {

    const { user } = useAuth();

    /* =====================================================
       STATE
       ===================================================== */

    const [billMode, setBillMode] = useState("ACTIVE");

    const [billingInput, setBillingInput] = useState({
        customer: {
            mode: "WALK_IN",
            customerId: null,
            name: "",
            mobile: "",
            address: ""
        },

        // 🔥 DEFAULT CREDIT
        paymentType: "CREDIT",

        items: [],
        discountAmount: "",
        amountPaid: ""
    });

    /* 🔥 UNCHECKED BY DEFAULT */
    const [sendWhatsapp, setSendWhatsapp] = useState(false);

    const [errors, setErrors] = useState({});

    /* =====================================================
       ITEM SEARCH
       ===================================================== */

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {

        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }

        axios
            .get(`/items/search?q=${searchTerm}`)
            .then(res => setSearchResults(res.data));

    }, [searchTerm]);

    /* =====================================================
       CUSTOMER SEARCH
       ===================================================== */

    const [customerQuery, setCustomerQuery] = useState("");
    const [customerResults, setCustomerResults] = useState([]);

    useEffect(() => {

        if (customerQuery.length < 2) {
            setCustomerResults([]);
            return;
        }

        searchCustomers(customerQuery)
            .then(res => setCustomerResults(res.data));

    }, [customerQuery]);

    /* =====================================================
       CUSTOMER BALANCES
       ===================================================== */

    const [customerBalances, setCustomerBalances] = useState({});

    useEffect(() => {

        const fetchBalances = async () => {

            const balances = { ...customerBalances };

            await Promise.all(
                customerResults.map(async (c) => {

                    if (balances[c.id] === undefined) {

                        try {

                            const res = await axios.get(
                                `/customers/${c.id}/balance`
                            );

                            balances[c.id] =
                                Number(res.data?.data || 0);

                        } catch {

                            balances[c.id] = 0;
                        }
                    }
                })
            );

            setCustomerBalances(balances);
        };

        if (customerResults.length > 0) {
            fetchBalances();
        }

    }, [customerResults]);

    /* =====================================================
       DERIVED TOTALS
       ===================================================== */

    const derivedTotals = useMemo(() => {

        const subtotal = billingInput.items.reduce(
            (sum, i) => sum + i.quantity * i.price,
            0
        );

        const discount =
            Number(billingInput.discountAmount) || 0;

        const finalAmount =
            Math.max(subtotal - discount, 0);

        const paid =
            billingInput.paymentType === "CREDIT"
                ? Number(billingInput.amountPaid) || 0
                : finalAmount;

        const dueAmount =
            billingInput.paymentType === "CREDIT"
                ? Math.max(finalAmount - paid, 0)
                : 0;

        return {
            subtotal,
            finalAmount,
            paid,
            dueAmount
        };

    }, [billingInput]);

    /* =====================================================
       ITEM ACTIONS
       ===================================================== */

    const addItem = (item) => {

        setBillingInput(prev => {

            const idx = prev.items.findIndex(
                i => i.itemId === item.id
            );

            if (idx !== -1) {

                const items = [...prev.items];

                items[idx].quantity =
                    Number(items[idx].quantity) + 1;

                return { ...prev, items };
            }

            return {
                ...prev,

                items: [
                    ...prev.items,
                    {
                        itemId: item.id,

                        name: item.name,
                        brand: item.brand,
                        itemCode: item.itemCode,

                        baseUnit: item.baseUnit,
                        availableStock: item.availableStock,

                        quantity: 1,
                        price: item.sellingPrice || 0
                    }
                ]
            };
        });

        setSearchTerm("");
        setSearchResults([]);
    };

    const updateItem = (
        index,
        field,
        value
    ) => {

        const items = [...billingInput.items];

        items[index][field] = value;

        setBillingInput({
            ...billingInput,
            items
        });
    };

    const removeItem = (index) => {

        setBillingInput({
            ...billingInput,
            items: billingInput.items.filter(
                (_, i) => i !== index
            )
        });
    };

    /* =====================================================
       VALIDATION
       ===================================================== */

    const validate = () => {

        const e = {};

        if (billingInput.items.length === 0) {
            e.items = "At least one item is required";
        }

        if (
            billMode === "ACTIVE" &&
            billingInput.paymentType === "CREDIT"
        ) {

            if (
                billingInput.customer.mode === "WALK_IN" &&
                !billingInput.customer.customerId
            ) {

                if (!billingInput.customer.name.trim()) {
                    e.name =
                        "Customer name is required for credit bill";
                }

                if (!billingInput.customer.mobile.trim()) {
                    e.mobile =
                        "Mobile number is required for credit bill";
                }
            }
        }

        setErrors(e);

        return Object.keys(e).length === 0;
    };

    /* =====================================================
       SUBMIT
       ===================================================== */

    const submitBill = async () => {

        if (!validate()) return;

        const basePayload = {

            customerId:
                billingInput.customer.mode === "REGISTERED"
                    ? billingInput.customer.customerId
                    : null,

            customerName:
                billingInput.customer.mode === "WALK_IN"
                    ? billingInput.customer.name
                    : null,

            customerMobile:
                billingInput.customer.mode === "WALK_IN"
                    ? billingInput.customer.mobile
                    : null,

            customerAddress:
                billingInput.customer.mode === "WALK_IN"
                    ? billingInput.customer.address
                    : null,

            discountAmount:
                Number(billingInput.discountAmount) || 0,

            items: billingInput.items.map(i => ({
                itemId: i.itemId,
                quantity: i.quantity,
                price: i.price
            }))
        };

        let res;

        if (billMode === "ESTIMATE") {

            res = await axios.post(
                "/bills/estimate",
                basePayload
            );

            alert(
                "Estimate created successfully.\nNo stock or payment recorded."
            );

        } else {

            res = await axios.post("/bills", {

                ...basePayload,

                paymentType:
                    billingInput.paymentType,

                amountPaid:
                    billingInput.paymentType === "CREDIT"
                        ? Number(billingInput.amountPaid) || 0
                        : derivedTotals.finalAmount,

                sendWhatsapp
            });

            const billId =
                res.data?.data?.id;

            const shouldPrint = window.confirm(
                "Bill created successfully.\nDo you want to print the bill?"
            );

            if (shouldPrint && billId) {

                window.location.href =
                    `/billing/print/${billId}`;

                return;
            }
        }

        resetForm();
    };

    /* =====================================================
       RESET
       ===================================================== */

    const resetForm = () => {

        setBillMode("ACTIVE");

        setBillingInput({
            customer: {
                mode: "WALK_IN",
                customerId: null,
                name: "",
                mobile: "",
                address: ""
            },

            paymentType: "CREDIT",

            items: [],
            discountAmount: "",
            amountPaid: ""
        });

        setCustomerQuery("");
        setCustomerResults([]);
        setErrors({});

        setSendWhatsapp(false);
    };

    /* =====================================================
       UI
       ===================================================== */

    return (

        <div style={page}>

            {/* =====================================================
               HEADER
               ===================================================== */}

            <div style={hero}>

                <div>

                    <div style={heroBadge}>
                        🧾 ERP Billing
                    </div>

                    <h1 style={heroTitle}>
                        Create Bill
                    </h1>

                    <div style={heroSub}>
                        Fast billing, customer management,
                        inventory tracking and WhatsApp invoicing.
                    </div>

                </div>

                <div style={heroRight}>

                    <div style={heroCard}>

                        <div style={heroLabel}>
                            Logged in as
                        </div>

                        <div style={heroUser}>
                            {user?.username || "User"}
                        </div>

                        <div style={heroRole}>
                            {user?.role?.name || "-"}
                        </div>

                    </div>

                </div>

            </div>

            {/* =====================================================
               TOP GRID
               ===================================================== */}

            <div style={topGrid}>

                {/* =====================================================
                   BILL MODE
                   ===================================================== */}

                <section style={box}>

                    <div style={sectionTitle}>
                        📄 Bill Mode
                    </div>

                    <select
                        style={input}
                        value={billMode}
                        onChange={(e) =>
                            setBillMode(e.target.value)
                        }
                    >
                        <option value="ACTIVE">
                            Bill (ACTIVE)
                        </option>

                        <option value="ESTIMATE">
                            Estimate
                        </option>

                    </select>

                    {billMode === "ESTIMATE" && (

                        <div style={infoBox}>
                            Estimate only — no stock,
                            payment or ledger entry.
                        </div>

                    )}

                </section>

                {/* =====================================================
                   SUMMARY CARD
                   ===================================================== */}

                <section style={summaryCard}>

                    <div style={summaryHeader}>
                        💰 Bill Summary
                    </div>

                    <div style={summaryRow}>
                        <span>Subtotal</span>

                        <b>
                            ₹ {derivedTotals.subtotal}
                        </b>
                    </div>

                    <div style={summaryRow}>
                        <span>Discount</span>

                        <b>
                            ₹ {billingInput.discountAmount || 0}
                        </b>
                    </div>

                    <div style={summaryDivider} />

                    <div style={summaryFinal}>
                        <span>Final Amount</span>

                        <span>
                            ₹ {derivedTotals.finalAmount}
                        </span>
                    </div>

                    {billingInput.paymentType === "CREDIT" && (

                        <>
                            <div style={summaryRow}>
                                <span>Paid</span>

                                <b>
                                    ₹ {derivedTotals.paid}
                                </b>
                            </div>

                            <div style={summaryDue}>
                                Due:
                                ₹ {derivedTotals.dueAmount}
                            </div>
                        </>

                    )}

                </section>

            </div>

            {/* =====================================================
               CUSTOMER
               ===================================================== */}

            <section style={box}>

                <div style={sectionTitle}>
                    👤 Customer Details
                </div>

                {billMode === "ACTIVE" && (

                    <select
                        style={input}
                        value={billingInput.paymentType}
                        onChange={(e) =>
                            setBillingInput({
                                ...billingInput,
                                paymentType: e.target.value,
                                amountPaid: ""
                            })
                        }
                    >
                        <option value="CREDIT">
                            Credit Bill
                        </option>

                        <option value="CASH">
                            Cash Bill
                        </option>

                        <option value="UPI">
                            UPI Bill
                        </option>

                    </select>

                )}

                <input
                    style={input}
                    placeholder="Search customer..."
                    value={customerQuery}
                    onChange={(e) =>
                        setCustomerQuery(e.target.value)
                    }
                />

                {customerResults.map(c => (

                    <div
                        key={c.id}
                        style={searchRow}
                        onClick={() => {

                            setBillingInput({
                                ...billingInput,

                                customer: {
                                    mode: "REGISTERED",

                                    customerId: c.id,

                                    name: c.name,
                                    mobile: c.mobile,

                                    address:
                                        c.address || ""
                                }
                            });

                            setCustomerQuery("");
                            setCustomerResults([]);

                            setErrors({});
                        }}
                    >

                        <div style={{ fontWeight: 600 }}>
                            {c.customerCode} — {c.name}
                        </div>

                        <div
                            style={{
                                fontSize: 13,
                                color: "#666"
                            }}
                        >
                            {c.mobile}

                            {customerBalances[c.id] > 0 && (
                                <>
                                    {" "}• Due ₹
                                    {customerBalances[c.id]}
                                </>
                            )}
                        </div>

                    </div>

                ))}

                <div style={responsiveGrid}>

                    <div>

                        <input
                            style={input}
                            placeholder="Customer Name"
                            disabled={
                                billingInput.customer.mode ===
                                "REGISTERED"
                            }
                            value={billingInput.customer.name}
                            onChange={(e) =>
                                setBillingInput({
                                    ...billingInput,

                                    customer: {
                                        ...billingInput.customer,

                                        name: e.target.value
                                    }
                                })
                            }
                        />

                        {errors.name && (
                            <div style={error}>
                                {errors.name}
                            </div>
                        )}

                    </div>

                    <div>

                        <input
                            style={input}
                            placeholder="Mobile Number"
                            disabled={
                                billingInput.customer.mode ===
                                "REGISTERED"
                            }
                            value={billingInput.customer.mobile}
                            onChange={(e) =>
                                setBillingInput({
                                    ...billingInput,

                                    customer: {
                                        ...billingInput.customer,

                                        mobile: e.target.value
                                    }
                                })
                            }
                        />

                        {errors.mobile && (
                            <div style={error}>
                                {errors.mobile}
                            </div>
                        )}

                    </div>

                </div>

                <input
                    style={input}
                    placeholder="Address"
                    disabled={
                        billingInput.customer.mode ===
                        "REGISTERED"
                    }
                    value={billingInput.customer.address}
                    onChange={(e) =>
                        setBillingInput({
                            ...billingInput,

                            customer: {
                                ...billingInput.customer,

                                address: e.target.value
                            }
                        })
                    }
                />

            </section>

            {/* =====================================================
               ITEM SEARCH
               ===================================================== */}

            <section style={box}>

                <div style={sectionTitle}>
                    📦 Add Items
                </div>

                <input
                    style={input}
                    placeholder="Search item / brand / code..."
                    value={searchTerm}
                    onChange={(e) =>
                        setSearchTerm(e.target.value)
                    }
                />

                {searchResults.map(item => (

                    <div
                        key={item.id}
                        style={searchRow}
                        onClick={() => addItem(item)}
                    >

                        <div style={{ fontWeight: 700 }}>
                            {item.name}
                        </div>

                        <div
                            style={{
                                fontSize: 13,
                                color: "#666"
                            }}
                        >
                            Brand:
                            {" "}
                            {item.brand || "Generic"}

                            {" "}• Code:
                            {" "}
                            {item.itemCode}

                            {" "}• Stock:
                            {" "}
                            {item.availableStock}
                        </div>

                    </div>

                ))}

            </section>

            {/* =====================================================
               ITEMS
               ===================================================== */}

            <section style={box}>

                <div style={sectionTitle}>
                    🧾 Bill Items
                </div>

                {billingInput.items.length === 0 && (

                    <div style={emptyState}>
                        No items added yet.
                    </div>

                )}

                {billingInput.items.map((item, idx) => (

                    <div
                        key={idx}
                        style={itemCard}
                    >

                        <div style={itemTop}>

                            <div>

                                <div style={itemName}>
                                    {item.name}
                                </div>

                                <div style={itemMeta}>
                                    {item.brand}
                                    {" "}• {item.itemCode}
                                    {" "}• Stock:
                                    {" "}
                                    {item.availableStock}
                                </div>

                            </div>

                            <button
                                style={deleteBtn}
                                onClick={() =>
                                    removeItem(idx)
                                }
                            >
                                ✕
                            </button>

                        </div>

                        <div style={itemControls}>

                            <div style={field}>
                                <label style={fieldLabel}>
                                    Qty
                                </label>

                                <input
                                    style={smallInput}
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) =>
                                        updateItem(
                                            idx,
                                            "quantity",
                                            Number(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>

                            <div style={field}>
                                <label style={fieldLabel}>
                                    Price
                                </label>

                                <input
                                    style={smallInput}
                                    type="number"
                                    value={item.price}
                                    onChange={(e) =>
                                        updateItem(
                                            idx,
                                            "price",
                                            Number(e.target.value) || 0
                                        )
                                    }
                                />
                            </div>

                            <div style={amountBox}>

                                <div style={fieldLabel}>
                                    Amount
                                </div>

                                <div style={amountValue}>
                                    ₹ {item.quantity * item.price}
                                </div>

                            </div>

                        </div>

                    </div>

                ))}

                {errors.items && (
                    <div style={error}>
                        {errors.items}
                    </div>
                )}

            </section>

            {/* =====================================================
               PAYMENT
               ===================================================== */}

            {billMode === "ACTIVE" &&
                billingInput.paymentType === "CREDIT" && (

                    <section style={box}>

                        <div style={sectionTitle}>
                            💳 Payment
                        </div>

                        <input
                            style={input}
                            type="number"
                            placeholder="Amount Paid"
                            value={billingInput.amountPaid}
                            onChange={(e) =>
                                setBillingInput({
                                    ...billingInput,

                                    amountPaid:
                                        e.target.value
                                })
                            }
                        />

                        <div style={dueBox}>
                            Due Amount:
                            ₹ {derivedTotals.dueAmount}
                        </div>

                    </section>

                )}

            {/* =====================================================
               DISCOUNT
               ===================================================== */}

            <section style={box}>

                <div style={sectionTitle}>
                    🏷️ Discount
                </div>

                <input
                    style={input}
                    type="number"
                    placeholder="Discount Amount"
                    value={billingInput.discountAmount}
                    onChange={(e) =>
                        setBillingInput({
                            ...billingInput,
                            discountAmount: e.target.value
                        })
                    }
                />

                <div
                    style={{
                        fontSize: 13,
                        color: "#64748b"
                    }}
                >
                    This amount will be deducted from subtotal.
                </div>

            </section>

            {/* =====================================================
               SETTINGS
               ===================================================== */}

            <section style={box}>

                <div style={sectionTitle}>
                    ⚙️ Options
                </div>

                <label style={checkboxLabel}>

                    <input
                        type="checkbox"
                        checked={sendWhatsapp}
                        onChange={(e) =>
                            setSendWhatsapp(
                                e.target.checked
                            )
                        }
                    />

                    Send bill on WhatsApp

                </label>

            </section>

            {/* =====================================================
               ACTIONS
               ===================================================== */}

            <section style={actionBar}>

                <button
                    style={primaryBtn}
                    onClick={submitBill}
                >
                    {billMode === "ESTIMATE"
                        ? "Create Estimate"
                        : "Generate Bill"}
                </button>

                <button
                    style={secondaryBtn}
                    onClick={resetForm}
                >
                    Reset
                </button>

            </section>

        </div>
    );
}

/* =====================================================
   STYLES
   ===================================================== */

const page = {
    padding: 20,
    background: "#f8fafc",
    minHeight: "100vh"
};

const hero = {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 20
};

const heroBadge = {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12
};

const heroTitle = {
    margin: 0,
    fontSize: 36,
    fontWeight: 700,
    color: "#0f172a"
};

const heroSub = {
    marginTop: 10,
    color: "#475569",
    fontSize: 15,
    lineHeight: 1.6,
    maxWidth: 700
};

const heroRight = {
    minWidth: 220
};

const heroCard = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const heroLabel = {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 10
};

const heroUser = {
    fontSize: 22,
    fontWeight: 700
};

const heroRole = {
    marginTop: 6,
    color: "#2563eb",
    fontWeight: 600
};

const topGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    marginBottom: 16
};

const box = {
    background: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const sectionTitle = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    color: "#0f172a"
};

const input = {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box"
};

const smallInput = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    boxSizing: "border-box"
};

const searchRow = {
    padding: 12,
    borderBottom: "1px solid #eee",
    cursor: "pointer"
};

const responsiveGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12
};

const itemCard = {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#fafafa"
};

const itemTop = {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14
};

const itemName = {
    fontWeight: 700,
    fontSize: 16
};

const itemMeta = {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4
};

const itemControls = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 12,
    alignItems: "end"
};

const field = {
    display: "flex",
    flexDirection: "column"
};

const fieldLabel = {
    fontSize: 12,
    marginBottom: 6,
    color: "#64748b",
    fontWeight: 600
};

const amountBox = {
    background: "#eff6ff",
    padding: 10,
    borderRadius: 10
};

const amountValue = {
    fontWeight: 700,
    fontSize: 18,
    color: "#1d4ed8"
};

const deleteBtn = {
    background: "#fee2e2",
    border: "none",
    color: "#dc2626",
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700
};

const summaryCard = {
    background: "#111827",
    color: "#fff",
    borderRadius: 16,
    padding: 20
};

const summaryHeader = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 18
};

const summaryRow = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 15
};

const summaryDivider = {
    height: 1,
    background: "rgba(255,255,255,0.2)",
    margin: "14px 0"
};

const summaryFinal = {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 14
};

const summaryDue = {
    marginTop: 12,
    background: "#dc2626",
    padding: "10px 12px",
    borderRadius: 10,
    fontWeight: 700,
    textAlign: "center"
};

const dueBox = {
    background: "#fef2f2",
    color: "#dc2626",
    padding: 12,
    borderRadius: 10,
    fontWeight: 700
};

const infoBox = {
    background: "#fef3c7",
    color: "#92400e",
    padding: 12,
    borderRadius: 10,
    fontSize: 13
};

const emptyState = {
    textAlign: "center",
    color: "#64748b",
    padding: 20
};

const checkboxLabel = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 500,
    cursor: "pointer"
};

const actionBar = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 40
};

const primaryBtn = {
    padding: "14px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15
};

const secondaryBtn = {
    padding: "14px 18px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15
};

const error = {
    color: "#dc2626",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10
};