import { useEffect, useState } from "react";
import axios from "../api/axios";
import { searchCustomers } from "../api/customerApi";

export default function GstBilling() {

    const [billingInput, setBillingInput] = useState({
        customer: {
            mode: "WALK_IN",
            customerId: null,
            name: "",
            mobile: "",
            address: "",
            gstin: ""
        },
        items: []
    });

    const [errors, setErrors] = useState({});

    /* ================= ITEM SEARCH ================= */
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (searchTerm.length < 2) return setSearchResults([]);

        axios.get(`/items/search?q=${searchTerm}`)
            .then(res => setSearchResults(res.data));
    }, [searchTerm]);

    /* ================= CUSTOMER SEARCH ================= */
    const [customerQuery, setCustomerQuery] = useState("");
    const [customerResults, setCustomerResults] = useState([]);

    useEffect(() => {
        if (customerQuery.length < 2) return setCustomerResults([]);

        searchCustomers(customerQuery)
            .then(res => setCustomerResults(res.data));
    }, [customerQuery]);

    /* ================= ITEM ACTIONS ================= */
    const addItem = (item) => {
        setBillingInput(prev => {
            const idx = prev.items.findIndex(i => i.itemId === item.id);

            if (idx !== -1) {
                const items = [...prev.items];
                items[idx].quantity += 1;
                return { ...prev, items };
            }

            return {
                ...prev,
                items: [
                    ...prev.items,
                    {
                        itemId: item.id,
                        name: item.name,
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

    /* ================= VALIDATION ================= */
    const validate = () => {
        const e = {};

        if (billingInput.items.length === 0) {
            e.items = "At least one item is required";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ================= SUBMIT ================= */
    const submitBill = async () => {
        if (!validate()) return;

        const customer = billingInput.customer;

        const payload = {
            paymentType: "CASH",

            // ✅ EXISTING CUSTOMER
            customerId:
                customer.mode === "REGISTERED"
                    ? customer.customerId
                    : null,

            // ✅ WALK-IN CUSTOMER
            customerName:
                customer.mode === "WALK_IN"
                    ? customer.name || null
                    : null,

            customerMobile:
                customer.mode === "WALK_IN"
                    ? customer.mobile || null
                    : null,

            customerAddress:
                customer.mode === "WALK_IN"
                    ? customer.address || null
                    : null,

            customerGstin:
                customer.mode === "WALK_IN"
                    ? customer.gstin || null
                    : null,

            items: billingInput.items.map(i => ({
                itemId: i.itemId,
                quantity: i.quantity,
                price: i.price
            }))
        };

        const res = await axios.post("/bills/gst/bills", payload);

        const billId = res.data?.data?.id;

        if (billId) {
            window.location.href = `/gst/bills/print/${billId}`;
        }
    };

    return (
        <div style={page}>
            <h2 style={title}>🧾 GST Billing</h2>

            {/* CUSTOMER */}
            <section style={box}>
                <h3>👤 Customer</h3>

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
                                    address: c.address || "",
                                    gstin: c.gstin || ""
                                }
                            });
                            setCustomerQuery("");
                            setCustomerResults([]);
                            setErrors({});
                        }}
                    >
                        {c.name} ({c.mobile})
                    </div>
                ))}

                {/* NAME */}
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

                {/* MOBILE */}
                <input
                    style={input}
                    placeholder="Mobile"
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

                {/* ADDRESS ✅ FIXED */}
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

                {/* GSTIN */}
                <input
                    style={input}
                    placeholder="GSTIN (optional)"
                    disabled={billingInput.customer.mode === "REGISTERED"}   // ✅ ADD THIS
                    value={billingInput.customer.gstin}
                    onChange={e =>
                        setBillingInput({
                            ...billingInput,
                            customer: {
                                ...billingInput.customer,
                                mode: "WALK_IN",   // ✅ ensure switch if user edits
                                gstin: e.target.value.toUpperCase()
                            }
                        })
                    }
                />
            </section>

            {/* ITEMS */}
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
                        {item.name}
                    </div>
                ))}
            </section>

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

            <button style={primaryBtn} onClick={submitBill}>
                Generate GST Bill
            </button>
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
