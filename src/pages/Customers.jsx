import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CustomerCard from "../components/CustomerCard";
import SearchBillModal from "../components/SearchBillModal";

export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [balances, setBalances] = useState({});
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    // 🔍 SEARCH
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);

    // 🆕 BILL SEARCH MODAL
    const [showBillSearch, setShowBillSearch] = useState(false);

    // FILTER + SORT
    const [pendingOnly, setPendingOnly] = useState(false);
    const [sortBy, setSortBy] = useState("NONE");
    // NONE | NAME | DATE | BALANCE

    const size = 20;

    /* ================= MODE ================= */
    const isServerPaging =
        !query && !pendingOnly && sortBy === "NONE";

    /* ================= BALANCES ================= */
    const fetchBalances = async (list) => {
        const map = {};
        await Promise.all(
            list.map(async c => {
                const id = c.customerId || c.id;
                try {
                    const res = await api.get(`/customers/${id}/balance`);
                    map[id] = res.data.data || 0;
                } catch {
                    map[id] = 0;
                }
            })
        );
        setBalances(map);
    };

    /* ================= SERVER PAGED ================= */
    const fetchPagedCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/customers/paged?page=${page}&size=${size}`
            );
            const list = res.data.data.content || [];
            setCustomers(list);
            fetchBalances(list);
        } finally {
            setLoading(false);
        }
    };

    /* ================= GLOBAL FETCH ================= */
    const fetchAllCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/customers/paged?page=0&size=10000`
            );
            const list = res.data.data.content || [];
            setCustomers(list);
            setPage(0);
            fetchBalances(list);
        } finally {
            setLoading(false);
        }
    };

    /* ================= INITIAL / PAGE CHANGE ================= */
    useEffect(() => {
        if (isServerPaging) {
            fetchPagedCustomers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isServerPaging]);

    /* ================= SEARCH ================= */
    useEffect(() => {
        if (!query || query.trim().length < 2) {
            setSearching(false);
            setPage(0);
            if (isServerPaging) fetchPagedCustomers();
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await api.get("/customers/search", {
                    params: { q: query.trim() }
                });
                const list = res.data || [];
                setCustomers(list);
                setPage(0);
                fetchBalances(list);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    /* ================= MODE SWITCH ================= */
    useEffect(() => {
        if (!isServerPaging) {
            fetchAllCustomers();
        } else {
            setPage(0);
            fetchPagedCustomers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingOnly, sortBy]);

    /* ================= FILTER + SORT ================= */
    const processedCustomers = useMemo(() => {
        let list = [...customers];

        if (pendingOnly) {
            list = list.filter(
                c => (balances[c.customerId || c.id] || 0) > 0
            );
        }

        switch (sortBy) {
            case "NAME":
                list.sort((a, b) =>
                    (a.name || "").localeCompare(b.name || "")
                );
                break;

            case "DATE":
                list.sort(
                    (a, b) =>
                        new Date(a.lastTransactionAt || 0) -
                        new Date(b.lastTransactionAt || 0)
                );
                break;

            case "BALANCE":
                list.sort(
                    (a, b) =>
                        (balances[b.customerId || b.id] || 0) -
                        (balances[a.customerId || a.id] || 0)
                );
                break;

            default:
                break;
        }

        return list;
    }, [customers, balances, pendingOnly, sortBy]);

    /* ================= MANUAL PAGINATION ================= */
    const pagedCustomers = useMemo(() => {
        if (isServerPaging) return customers;
        const start = page * size;
        return processedCustomers.slice(start, start + size);
    }, [processedCustomers, customers, page, isServerPaging]);

    return (
        <div style={pageWrap}>
            <h2>👥 Customers</h2>

            <div style={{ display: "flex", gap: 8 }}>
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

                {/* 🆕 SEARCH BILL */}
                <button
                    style={billSearchBtn}
                    onClick={() => setShowBillSearch(true)}
                >
                    🔎 Search Bill
                </button>
            </div>

            <div style={toolbar}>
                <label style={checkbox}>
                    <input
                        type="checkbox"
                        checked={pendingOnly}
                        onChange={e => {
                            setPendingOnly(e.target.checked);
                            setPage(0);
                        }}
                    />
                    Show Pending Bills Only
                </label>

                <select
                    value={sortBy}
                    onChange={e => {
                        setSortBy(e.target.value);
                        setPage(0);
                    }}
                    style={select}
                >
                    <option value="NONE">Sort: Default</option>
                    <option value="NAME">Sort: Alphabetical</option>
                    <option value="DATE">Sort: New → Old</option>
                    <option value="BALANCE">
                        Sort: Balance (High → Low)
                    </option>
                </select>
            </div>

            {(loading || searching) && (
                <div style={hint}>Loading customers…</div>
            )}

            {!loading && pagedCustomers.length === 0 && (
                <div style={hint}>No customers found</div>
            )}

            <div style={grid}>
                {pagedCustomers.map(c => {
                    const id = c.customerId || c.id;
                    return (
                        <CustomerCard
                            key={id}
                            customer={{
                                id,
                                name: c.name || "Walk-in Customer",
                                customerCode: c.customerCode,
                                mobile: c.mobile,
                                address: c.address || null,
                                lastTransactionAt: c.lastTransactionAt
                            }}
                            onStatement={() =>
                                (window.location.href =
                                    `/customers/${id}/statement`)
                            }
                            onPending={() =>
                                (window.location.href =
                                    `/customers/${id}/pending-bills`)
                            }
                            onAllBills={() =>
                                (window.location.href =
                                    `/customers/${id}/bills`)
                            }
                        />
                    );
                })}
            </div>

            <div style={pagination}>
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 0))}
                    disabled={page === 0}
                >
                    ← Prev
                </button>

                <span style={{ margin: "0 12px" }}>
                    Page {page + 1}
                </span>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={
                        isServerPaging
                            ? customers.length < size
                            : (page + 1) * size >= processedCustomers.length
                    }
                >
                    Next →
                </button>
            </div>

            {/* 🆕 BILL SEARCH MODAL */}
            {showBillSearch && (
                <SearchBillModal
                    onClose={() => setShowBillSearch(false)}
                />
            )}
        </div>
    );
}

/* ================= STYLES ================= */

const pageWrap = { padding: "24px" };

const searchInput = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 14,
    borderRadius: 6,
    border: "1px solid #ccc",
    marginTop: 12
};

const billSearchBtn = {
    padding: "10px 14px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f8f9fa",
    cursor: "pointer"
};

const toolbar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 12
};

const checkbox = {
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 6
};

const select = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc"
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
