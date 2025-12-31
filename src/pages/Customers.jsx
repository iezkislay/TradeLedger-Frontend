import { useEffect, useState } from "react";
import api from "../api/axios";
import CustomerCard from "../components/CustomerCard";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    // 🔍 SEARCH
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);

    const size = 20;

    // ================= PAGED FETCH =================
    useEffect(() => {
        if (!query) {
            fetchCustomers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/customers/paged?page=${page}&size=${size}`
            );
            setCustomers(res.data.data.content || []);
        } finally {
            setLoading(false);
        }
    };

    // ================= SEARCH =================
    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setSearching(false);
            fetchCustomers();
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get("/customers/search", {
                    params: { q: query.trim() }
                });
                setCustomers(res.data || []);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <div style={pageWrap}>
            <h2>👥 Customers</h2>

            {/* 🔍 SEARCH BAR */}
            <input
                type="text"
                placeholder="🔍 Search customer by name or mobile"
                value={query}
                onChange={e => {
                    setQuery(e.target.value);
                    setPage(0);
                }}
                style={searchInput}
            />

            {(loading || searching) && (
                <div style={hint}>Loading customers…</div>
            )}

            {!loading && customers.length === 0 && (
                <div style={hint}>No customers found</div>
            )}

            <div style={grid}>
                {customers.map(c => (
                    <CustomerCard
                        key={c.customerId || c.id}
                        customer={{
                            id: c.customerId || c.id,
                            name: c.name || "Walk-in Customer",
                            customerCode: c.customerCode,
                            mobile: c.mobile,
                            address: c.address || null,
                            balance: c.balance,
                            lastTransactionAt: c.lastTransactionAt
                        }}
                        onStatement={() =>
                            (window.location.href =
                                `/customers/${c.customerId || c.id}/statement`)
                        }
                        onPending={() =>
                            (window.location.href =
                                `/customers/${c.customerId || c.id}/pending-bills`)
                        }
                    />
                ))}
            </div>

            {/* ================= PAGINATION ================= */}
            <div style={pagination}>
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={page === 0 || query}
                >
                    ← Prev
                </button>

                <span style={{ margin: "0 12px" }}>
                    Page {page + 1}
                </span>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={customers.length < size || query}
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = {
    padding: "24px"
};

const searchInput = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginTop: 12
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    marginTop: "16px"
};

const pagination = {
    marginTop: 20,
    display: "flex",
    alignItems: "center"
};

const hint = {
    marginTop: 12,
    opacity: 0.6
};
