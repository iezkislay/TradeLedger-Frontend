import { useEffect, useState } from "react";
import { getCustomerBalance } from "../api/customerApi";

export default function CustomerCard({
                                         customer,
                                         onStatement,
                                         onPending,
                                         onAllBills
                                     }) {
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        getCustomerBalance(customer.id)
            .then(res => setBalance(res.data.data));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isDue = (balance ?? 0) > 0;

    return (
        <div style={card(isDue)}>
            {/* HEADER */}
            <div style={header}>
                <div style={nameRow}>
                    <span style={name}>
                        {customer.name || "Walk-in Customer"}
                    </span>

                    {customer.customerCode && (
                        <span style={code}>
                            {customer.customerCode}
                        </span>
                    )}
                </div>

                <div style={balanceStyle(isDue)}>
                    ₹ {balance !== null ? balance.toFixed(2) : "..."}
                </div>
            </div>

            {/* META */}
            <div style={meta}>
                {customer.mobile && (
                    <div>📞 {customer.mobile}</div>
                )}

                {/* ADDRESS — CONDITIONAL (UNCHANGED) */}
                {customer.address && (
                    <div style={address}>
                        📍 {customer.address}
                    </div>
                )}

                {customer.lastTransactionAt && (
                    <div style={lastTxn}>
                        Last txn:{" "}
                        {new Date(
                            customer.lastTransactionAt
                        ).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* ACTIONS */}
            <div style={actions}>
                <button
                    onClick={() => onStatement(customer.id)}
                    style={secondaryBtn}
                >
                    Statement
                </button>

                {/* 🆕 ALL BILLS — ADDITIVE ONLY */}
                {onAllBills && (
                    <button
                        onClick={() => onAllBills(customer.id)}
                        style={secondaryBtn}
                    >
                        All Bills
                    </button>
                )}

                {isDue && (
                    <button
                        onClick={() => onPending(customer.id)}
                        style={primaryBtn}
                    >
                        Pending Bills
                    </button>
                )}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const card = isDue => ({
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    background: isDue ? "#fffafa" : "#ffffff",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 12
});

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
};

const nameRow = {
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const name = {
    fontWeight: 600,
    fontSize: 16
};

const code = {
    fontSize: 12,
    opacity: 0.6
};

const balanceStyle = isDue => ({
    fontSize: 18,
    fontWeight: 700,
    color: isDue ? "crimson" : "green"
});

const meta = {
    fontSize: 13,
    opacity: 0.85,
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const address = {
    opacity: 0.8
};

const lastTxn = {
    fontSize: 12,
    opacity: 0.6
};

const actions = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4
};

const primaryBtn = {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
};

const secondaryBtn = {
    background: "transparent",
    border: "1px solid #ccc",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer"
};
