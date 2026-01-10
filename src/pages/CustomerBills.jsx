import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function CustomerBills() {
    const { customerId } = useParams();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/customers/${customerId}/bills`)
            .then(res => {
                setBills(res.data.data || []);
            })
            .finally(() => setLoading(false));
    }, [customerId]);

    return (
        <div style={wrap}>
            <h2>🧾 All Bills</h2>

            {loading && <div>Loading bills…</div>}

            {!loading && bills.length === 0 && (
                <div>No bills found</div>
            )}

            {!loading &&
                bills.map(b => (
                    <div key={b.billId} style={row}>
                        <span
                            style={link}
                            onClick={() =>
                                (window.location.href =
                                    `/bills/${b.billId}/view`)
                            }
                        >
                            {b.billCode}
                        </span>

                        <span>
                            {b.billDate
                                ? new Date(b.billDate).toLocaleDateString()
                                : ""}
                        </span>

                        <span>
                            ₹ {b.totalAmount?.toFixed(2)}
                        </span>

                        <span style={{ color: "green" }}>
                            Paid: ₹ {b.paidAmount?.toFixed(2)}
                        </span>

                        <span style={{ color: "crimson" }}>
                            Due: ₹ {b.dueAmount?.toFixed(2)}
                        </span>
                    </div>
                ))}
        </div>
    );
}

/* ================= STYLES ================= */

const wrap = { padding: 24 };

const row = {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderBottom: "1px solid #eee"
};

const link = {
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: 600
};
