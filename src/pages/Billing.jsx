import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import { searchCustomers } from "../api/customerApi";

/* =====================================================
   BILLING PAGE — ERP GRADE (VISUAL POLISH ONLY)
   ===================================================== */

export default function Billing() {
    const { user } = useAuth();

    /* ======================
       1️⃣ USER INPUT STATE
       ====================== */
    const [billingInput, setBillingInput] = useState({
        customer: {
            mode: "WALK_IN",
            customerId: null,
            name: "",
            mobile: "",
            address: ""
        },
        paymentType: "CASH",
        items: [],
        discountAmount: 0,
        amountPaid: 0
    });

    /* ======================
       ITEM SEARCH
       ====================== */
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

    /* ======================
       CUSTOMER SEARCH
       ====================== */
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

    /* ======================
       DERIVED TOTALS
       ====================== */
    const derivedTotals = useMemo(() => {
        const subtotal = billingInput.items.reduce(
            (sum, i) => sum + i.quantity * i.price,
            0
        );

        const finalAmount = Math.max(
            subtotal - billingInput.discountAmount,
            0
        );

        const dueAmount = Math.max(
            finalAmount - billingInput.amountPaid,
            0
        );

        return { subtotal, finalAmount, dueAmount };
    }, [billingInput]);

    /* ======================
       ITEM ACTIONS
       ====================== */
    const addItem = (item) => {
        setBillingInput(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    itemId: item.id,
                    name: item.name,
                    baseUnit: item.baseUnit,
                    availableStock: item.availableStock,
                    quantity: 1,
                    price: item.sellingPrice || 0
                }
            ]
        }));

        setSearchTerm("");
        setSearchResults([]);
    };

    const updateItem = (index, field, value) => {
        const items = [...billingInput.items];
        items[index][field] = value;
        setBillingInput({ ...billingInput, items });
    };

    const removeItem = (index) => {
        setBillingInput({
            ...billingInput,
            items: billingInput.items.filter((_, i) => i !== index)
        });
    };

    /* ======================
       SUBMIT BILL
       ====================== */
    const submitBill = async () => {
        const payload = {
            paymentType: billingInput.paymentType,

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

            discountAmount: billingInput.discountAmount || 0,
            amountPaid: billingInput.amountPaid || 0,

            items: billingInput.items.map(i => ({
                itemId: i.itemId,
                quantity: i.quantity,
                price: i.price
            }))
        };

        await axios.post("/bills", payload);
        alert("Bill created successfully");
        resetForm();
    };

    const resetForm = () => {
        setBillingInput({
            customer: {
                mode: "WALK_IN",
                customerId: null,
                name: "",
                mobile: "",
                address: ""
            },
            paymentType: "CASH",
            items: [],
            discountAmount: 0,
            amountPaid: 0
        });
        setCustomerQuery("");
        setCustomerResults([]);
    };

    /* ======================
       UI
       ====================== */
    return (
        <div style={page}>
            <h2 style={title}>🧾 Billing</h2>

            {/* CUSTOMER */}
            <section style={box}>
                <h3>👤 Customer</h3>

                <select
                    style={input}
                    value={billingInput.paymentType}
                    onChange={e =>
                        setBillingInput({
                            ...billingInput,
                            paymentType: e.target.value
                        })
                    }
                >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CREDIT">Credit</option>
                </select>

                <input
                    style={input}
                    placeholder="Search customer (name / mobile / code)"
                    value={customerQuery}
                    onChange={e => setCustomerQuery(e.target.value)}
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
                                    address: c.address || ""
                                }
                            });
                            setCustomerQuery("");
                            setCustomerResults([]);
                        }}
                    >
                        {c.customerCode} — {c.name} ({c.mobile}) — Due ₹{c.balance}
                    </div>
                ))}

                <input
                    style={input}
                    placeholder="Customer Name"
                    disabled={billingInput.customer.mode === "REGISTERED"}
                    value={billingInput.customer.name}
                    onChange={e =>
                        setBillingInput({
                            ...billingInput,
                            customer: {
                                ...billingInput.customer,
                                name: e.target.value
                            }
                        })
                    }
                />

                <input
                    style={input}
                    placeholder="Mobile Number"
                    disabled={billingInput.customer.mode === "REGISTERED"}
                    value={billingInput.customer.mobile}
                    onChange={e =>
                        setBillingInput({
                            ...billingInput,
                            customer: {
                                ...billingInput.customer,
                                mobile: e.target.value
                            }
                        })
                    }
                />

                <input
                    style={input}
                    placeholder="Address"
                    disabled={billingInput.customer.mode === "REGISTERED"}
                    value={billingInput.customer.address}
                    onChange={e =>
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

            {/* ITEM SEARCH */}
            <section style={box}>
                <h3>📦 Add Item</h3>

                <input
                    style={input}
                    placeholder="Search item..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                {searchResults.map(item => (
                    <div
                        key={item.id}
                        style={searchRow}
                        onClick={() => addItem(item)}
                    >
                        {item.name} — Stock: {item.availableStock}
                    </div>
                ))}
            </section>

            {/* ITEMS */}
            <section style={box}>
                <h3>🧾 Items</h3>

                {billingInput.items.map((item, idx) => (
                    <div key={idx} style={itemRow}>
                        <span style={{ flex: 2 }}>{item.name}</span>

                        <input
                            style={smallInput}
                            type="number"
                            value={item.quantity}
                            onChange={e =>
                                updateItem(idx, "quantity", Number(e.target.value) || 0)
                            }
                        />

                        <input
                            style={smallInput}
                            type="number"
                            value={item.price}
                            onChange={e =>
                                updateItem(idx, "price", Number(e.target.value) || 0)
                            }
                        />

                        <span style={{ width: 90 }}>
                            ₹ {item.quantity * item.price}
                        </span>

                        <button onClick={() => removeItem(idx)}>❌</button>
                    </div>
                ))}
            </section>

            {/* SUMMARY */}
            <section style={box}>
                <h3>💰 Summary</h3>
                <div>Subtotal: ₹ {derivedTotals.subtotal}</div>

                <div>
                    Discount:
                    <input
                        style={smallInput}
                        type="number"
                        value={billingInput.discountAmount}
                        onChange={e =>
                            setBillingInput({
                                ...billingInput,
                                discountAmount: Number(e.target.value) || 0
                            })
                        }
                    />
                </div>

                <strong>Final: ₹ {derivedTotals.finalAmount}</strong>
            </section>

            {/* PAYMENT */}
            <section style={box}>
                <h3>💳 Payment</h3>

                <input
                    style={input}
                    type="number"
                    placeholder="Amount Paid"
                    value={billingInput.amountPaid}
                    onChange={e =>
                        setBillingInput({
                            ...billingInput,
                            amountPaid: Number(e.target.value) || 0
                        })
                    }
                />

                <div>Due: ₹ {derivedTotals.dueAmount}</div>
            </section>

            {/* ACTIONS */}
            <section style={{ display: "flex", gap: 12 }}>
                <button style={primaryBtn} onClick={submitBill}>
                    Generate Bill
                </button>
                <button style={secondaryBtn} onClick={resetForm}>
                    Reset
                </button>
            </section>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 24,
    background: "#f6f7fb"
};

const title = {
    marginBottom: 20
};

const box = {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
};

const input = {
    width: "100%",
    padding: "8px 10px",
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ddd"
};

const smallInput = {
    width: 70,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ddd"
};

const searchRow = {
    padding: 10,
    borderBottom: "1px solid #eee",
    cursor: "pointer"
};

const itemRow = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 8
};

const primaryBtn = {
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer"
};

const secondaryBtn = {
    padding: "10px 14px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
};
