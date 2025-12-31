import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function CustomerStatement() {
    const { customerId } = useParams();

    const [entries, setEntries] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStatement();
        fetchCustomer();
        fetchBalance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    const fetchStatement = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/customers/${customerId}/statement`
            );
            setEntries(res.data.data || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomer = async () => {
        const res = await api.get(`/customers/${customerId}`);
        setCustomer(res.data.data);
    };

    const fetchBalance = async () => {
        const res = await api.get(`/customers/${customerId}/balance`);
        setBalance(res.data.data);
    };

    return (
        <div style={pageWrap}>
            <h2>📄 Customer Statement</h2>

            {/* ================= CUSTOMER HEADER ================= */}
            {customer && (
                <div style={header}>
                    <div>
                        <strong>{customer.name}</strong>
                        <div style={muted}>📞 {customer.mobile}</div>
                        {customer.address && (
                            <div style={muted}>📍 {customer.address}</div>
                        )}
                    </div>
                </div>
            )}

            {loading && <div style={hint}>Loading statement…</div>}

            {!loading && entries.length === 0 && (
                <div style={hint}>No transactions found</div>
            )}

            <div style={timeline}>
                {entries.map((e, idx) => (
                    <div key={idx} style={row}>
                        <div style={left}>
                            <div style={date}>{e.date}</div>
                            <div style={reference}>
                                {e.reference || "—"}
                            </div>
                        </div>

                        <div style={center}>
                            <span style={badge(e.entryType)}>
                                {e.entryType}
                            </span>
                        </div>

                        <div style={right}>
                            {e.entryType === "DEBIT" && (
                                <div style={{ color: "crimson" }}>
                                    ₹ {e.debit.toFixed(2)}
                                </div>
                            )}

                            {e.entryType === "CREDIT" && (
                                <div style={{ color: "green" }}>
                                    ₹ {e.credit.toFixed(2)}
                                </div>
                            )}

                            {e.entryType === "ADJUSTMENT" && (
                                <div style={{ color: "#a46a00" }}>
                                    ₹ {e.credit.toFixed(2)}
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>

            {/* ================= BALANCE FOOTER ================= */}
            {balance !== null && (
                <div style={footer}>
                    <span>Balance</span>
                    <strong
                        style={{
                            color: balance > 0 ? "crimson" : "green"
                        }}
                    >
                        ₹ {balance.toFixed(2)}
                    </strong>
                </div>
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = {
    padding: "24px",
    maxWidth: 900,
    margin: "0 auto"
};

const header = {
    marginTop: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #eee",
    marginBottom: 12
};

const muted = {
    fontSize: 13,
    opacity: 0.7
};

const timeline = {
    marginTop: 16,
    borderTop: "1px solid #eee"
};

const row = {
    display: "grid",
    gridTemplateColumns: "160px 140px 1fr",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
    alignItems: "center"
};

const left = {
    display: "flex",
    flexDirection: "column",
    gap: 4
};

const date = {
    fontSize: 13,
    opacity: 0.7
};

const reference = {
    fontWeight: 500
};

const center = {
    textAlign: "center"
};

const right = {
    textAlign: "right",
    fontWeight: 600
};

/* 🔥 FIXED COLORS */
const debit = {
    color: "crimson"   // customer owes
};

const credit = {
    color: "green"     // payment received
};

const hint = {
    marginTop: 12,
    opacity: 0.6
};

const footer = {
    marginTop: 20,
    paddingTop: 12,
    borderTop: "2px solid #000",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 16
};

/* ================= BADGES ================= */

const badge = type => ({
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    background:
        type === "DEBIT"
            ? "#fdecea"
            : type === "CREDIT"
                ? "#e6f4ea"
                : "#fff4e5",
    color:
        type === "DEBIT"
            ? "#c82333"
            : type === "CREDIT"
                ? "#1e7e34"
                : "#a46a00"
});
