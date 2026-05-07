import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import axios from "../api/axios";
import { searchCustomers } from "../api/customerApi";

/* =====================================================
   BILLING PAGE — ERP GRADE (ACTIVE + ESTIMATE)
   ===================================================== */

export default function Billing() {
    const { user } = useAuth();

    /* ======================
       STATE
       ====================== */
    const [billMode, setBillMode] = useState("ACTIVE"); // ACTIVE | ESTIMATE

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
        discountAmount: "",
        amountPaid: ""
    });

    const [errors, setErrors] = useState({});
    const [sendWhatsapp, setSendWhatsapp] = useState(true);

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
       CUSTOMER BALANCES
       ====================== */
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
                            balances[c.id] = Number(res.data?.data || 0);
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

    /* ======================
       DERIVED TOTALS
       ====================== */
    const derivedTotals = useMemo(() => {
        const subtotal = billingInput.items.reduce(
            (sum, i) => sum + i.quantity * i.price,
            0
        );

        const discount = Number(billingInput.discountAmount) || 0;
        const finalAmount = Math.max(subtotal - discount, 0);

        const paid =
            billingInput.paymentType === "CREDIT"
                ? Number(billingInput.amountPaid) || 0
                : finalAmount;

        const dueAmount =
            billingInput.paymentType === "CREDIT"
                ? Math.max(finalAmount - paid, 0)
                : 0;

        return { subtotal, finalAmount, paid, dueAmount };
    }, [billingInput]);

    /* ======================
       ITEM ACTIONS
       ====================== */
    const addItem = (item) => {
        setBillingInput(prev => {
            const idx = prev.items.findIndex(
                i => i.itemId === item.id
            );

            if (idx !== -1) {
                const items = [...prev.items];
                items[idx].quantity = Number(items[idx].quantity) + 1;
                return { ...prev, items };
            }

            return {
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
            };
        });

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
       VALIDATION
       ====================== */
    const validate = () => {
        const e = {};

        if (billingInput.items.length === 0) {
            e.items = "At least one item is required";
        }

        if (billMode === "ACTIVE" && billingInput.paymentType === "CREDIT") {
            if (
                billingInput.customer.mode === "WALK_IN" &&
                !billingInput.customer.customerId
            ) {
                if (!billingInput.customer.name.trim()) {
                    e.name = "Customer name is required for credit bill";
                }
                if (!billingInput.customer.mobile.trim()) {
                    e.mobile = "Mobile number is required for credit bill";
                }
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ======================
       SUBMIT BILL / ESTIMATE
       ====================== */
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

            discountAmount: Number(billingInput.discountAmount) || 0,

            items: billingInput.items.map(i => ({
                itemId: i.itemId,
                quantity: i.quantity,
                price: i.price
            }))
        };

        let res;

        if (billMode === "ESTIMATE") {
            res = await axios.post("/bills/estimate", basePayload);
            alert("Estimate created successfully.\nNo stock or payment recorded.");
        } else {
            res = await axios.post("/bills", {
                ...basePayload,
                paymentType: billingInput.paymentType,
                amountPaid:
                    billingInput.paymentType === "CREDIT"
                        ? Number(billingInput.amountPaid) || 0
                        : derivedTotals.finalAmount,

                sendWhatsapp: sendWhatsapp   // 🔥 THIS LINE
            });

            const billId = res.data?.data?.id;
            const shouldPrint = window.confirm(
                "Bill created successfully.\nDo you want to print the bill?"
            );

            if (shouldPrint && billId) {
                window.location.href = `/billing/print/${billId}`;
                return;
            }
        }

        resetForm();
    };

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
            paymentType: "CASH",
            items: [],
            discountAmount: "",
            amountPaid: ""
        });
        setCustomerQuery("");
        setCustomerResults([]);
        setErrors({});
    };

    /* ======================
       UI
       ====================== */
    return (
        <div style={page}>
            <h2 style={title}>🧾 Billing</h2>

            {/* BILL MODE */}
            <section style={box}>
                <h3>📄 Bill Mode</h3>
                <select
                    style={input}
                    value={billMode}
                    onChange={e => setBillMode(e.target.value)}
                >
                    <option value="ACTIVE">Bill (ACTIVE)</option>
                    <option value="ESTIMATE">Estimate</option>
                </select>

                {billMode === "ESTIMATE" && (
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                        Estimate only — no stock or payment recorded.
                    </div>
                )}
            </section>

            {/* CUSTOMER */}
            <section style={box}>
                <h3>👤 Customer</h3>

                {billMode === "ACTIVE" && (
                    <select
                        style={input}
                        value={billingInput.paymentType}
                        onChange={e =>
                            setBillingInput({
                                ...billingInput,
                                paymentType: e.target.value,
                                amountPaid: ""
                            })
                        }
                    >
                        <option value="CASH">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="CREDIT">Credit</option>
                    </select>
                )}

                <input
                    style={input}
                    placeholder="Search customer"
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
                            setErrors({});
                        }}
                    >
                        {c.customerCode} — {c.name} ({c.mobile})
                        {customerBalances[c.id] > 0 && (
                            <span> — Due ₹{customerBalances[c.id]}</span>
                        )}
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
                {errors.name && <div style={error}>{errors.name}</div>}

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
                {errors.mobile && <div style={error}>{errors.mobile}</div>}

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

            {/* ADD ITEM */}
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

            {errors.items && <div style={error}>{errors.items}</div>}

            {/* SUMMARY */}
            <section style={box}>
                <h3>💰 Summary</h3>
                <div>Subtotal: ₹ {derivedTotals.subtotal}</div>
                <div>
                    Discount:
                    <input
                        style={smallInput}
                        type="number"
                        placeholder="0"
                        value={billingInput.discountAmount}
                        onChange={e =>
                            setBillingInput({
                                ...billingInput,
                                discountAmount: e.target.value
                            })
                        }
                    />
                </div>
                <strong>Final: ₹ {derivedTotals.finalAmount}</strong>
            </section>

            {/* PAYMENT */}
            {billMode === "ACTIVE" && billingInput.paymentType === "CREDIT" && (
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
                                amountPaid: e.target.value
                            })
                        }
                    />

                    <div>Due: ₹ {derivedTotals.dueAmount}</div>
                </section>
            )}

            {/* ACTIONS */}
            <section style={box}>
                <label style={{ cursor: "pointer", fontWeight: 500 }}>
                    <input
                        type="checkbox"
                        checked={sendWhatsapp}
                        onChange={(e) => setSendWhatsapp(e.target.checked)}
                        style={{ marginRight: "8px" }}
                    />
                    Send bill on WhatsApp
                </label>
            </section>
            <section style={{ display: "flex", gap: 12 }}>
                <button style={primaryBtn} onClick={submitBill}>
                    {billMode === "ESTIMATE" ? "Create Estimate" : "Generate Bill"}
                </button>
                <button style={secondaryBtn} onClick={resetForm}>
                    Reset
                </button>
            </section>
        </div>
    );
}

/* ================= STYLES ================= */

const error = {
    color: "crimson",
    fontSize: 13,
    marginBottom: 6
};

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
    width: 80,
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ddd",
    marginLeft: 6
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
