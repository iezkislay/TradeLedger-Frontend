import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getDashboardKpis, getDashboardSummary } from "../api/dashboardApi";
import KpiCard from "../components/KpiCard";
import { useAuth } from "../context/useAuth";

import SalesTrendChart from "../components/charts/SalesTrendChart";
import PaymentSplitChart from "../components/charts/PaymentSplitChart";
import TopItemsChart from "../components/charts/TopItemsChart";

/* =========================
   DATE CONSTANTS & PRESETS
   ========================= */
const today = dayjs().format("YYYY-MM-DD");

const defaultRanges = {
    TODAY: {
        from: today,
        to: today
    },
    LAST_7_DAYS: {
        from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
        to: today
    },
    LAST_30_DAYS: {
        from: dayjs().subtract(29, "day").format("YYYY-MM-DD"),
        to: today
    }
};

export default function Dashboard() {
    const { user } = useAuth();
    const role = user?.role?.name;

    /* =========================
       RANGE = SINGLE SOURCE
       ========================= */
    const [range, setRange] = useState(defaultRanges.LAST_7_DAYS);
    const [activePreset, setActivePreset] = useState("LAST_7_DAYS");

    /* =========================
       STATE
       ========================= */
    const [kpis, setKpis] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(true);

    /* =========================
       LIVE KPIs (AUTO REFRESH)
       ========================= */
    useEffect(() => {
        const loadKpis = () =>
            getDashboardKpis()
                .then(res => setKpis(res.data.data))
                .finally(() => setLoadingKpis(false));

        loadKpis();
        const interval = setInterval(loadKpis, 60000);
        return () => clearInterval(interval);
    }, []);

    /* =========================
       SUMMARY (RANGE-DRIVEN)
       ========================= */
    useEffect(() => {
        setLoadingSummary(true);
        getDashboardSummary(range.from, range.to)
            .then(res => setSummary(res.data.data))
            .finally(() => setLoadingSummary(false));
    }, [range]);

    if (loadingKpis || !kpis) return <p>Loading dashboard...</p>;

    return (
        <div style={{ padding: "24px" }}>
            <h2>Dashboard</h2>
            <p>Welcome, {user?.username}</p>

            {/* ================= RANGE CONTROLS ================= */}

            {/* PRESET BUTTONS */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button
                    onClick={() => {
                        setRange(defaultRanges.TODAY);
                        setActivePreset("TODAY");
                    }}
                    disabled={activePreset === "TODAY"}
                >
                    Today
                </button>

                <button
                    onClick={() => {
                        setRange(defaultRanges.LAST_7_DAYS);
                        setActivePreset("LAST_7_DAYS");
                    }}
                    disabled={activePreset === "LAST_7_DAYS"}
                >
                    7 Days
                </button>

                <button
                    onClick={() => {
                        setRange(defaultRanges.LAST_30_DAYS);
                        setActivePreset("LAST_30_DAYS");
                    }}
                    disabled={activePreset === "LAST_30_DAYS"}
                >
                    30 Days
                </button>
            </div>

            {/* DATE PICKER */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <input
                    type="date"
                    value={range.from}
                    max={range.to}
                    onChange={(e) => {
                        setRange({ ...range, from: e.target.value });
                        setActivePreset(null);
                    }}
                />

                <input
                    type="date"
                    value={range.to}
                    min={range.from}
                    max={today}
                    onChange={(e) => {
                        setRange({ ...range, to: e.target.value });
                        setActivePreset(null);
                    }}
                />
            </div>

            {/* ================= KPIs (LIVE) ================= */}

            <h3>Sales</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <KpiCard title="Today Sales" value={`₹${kpis.todaySales}`} />
                <KpiCard title="Month Sales" value={`₹${kpis.monthSales}`} />
                <KpiCard title="Avg Bill" value={`₹${kpis.avgBillValue}`} />
            </div>

            <h3 style={{ marginTop: 24 }}>Payment Split</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {Object.entries(kpis.paymentSplit || {}).map(([type, amount]) => (
                    <KpiCard key={type} title={type} value={`₹${amount}`} />
                ))}
            </div>

            {/* OWNER ONLY */}
            {role === "OWNER" && (
                <>
                    <h3 style={{ marginTop: 24 }}>Credit & Inventory</h3>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <KpiCard title="Total Outstanding" value={`₹${kpis.totalOutstanding}`} />
                        <KpiCard
                            title="Pending Amount"
                            value={`₹${kpis.pendingAmount}`}
                            alert={kpis.pendingAmount > 10000}
                        />
                        <KpiCard
                            title="Low Stock Items"
                            value={kpis.lowStockCount}
                            alert={kpis.lowStockCount > 0}
                        />
                        <KpiCard title="Stock Value" value={`₹${kpis.totalStockValue}`} />
                    </div>
                </>
            )}

            {/* ================= SUMMARY CHARTS ================= */}

            {loadingSummary && <p>Loading charts...</p>}

            {!loadingSummary && summary && (
                <>
                    <h3 style={{ marginTop: 32 }}>Sales Trend</h3>
                    <SalesTrendChart data={summary.salesTrend} />

                    <h3 style={{ marginTop: 24 }}>Payment Split</h3>
                    <PaymentSplitChart data={summary.paymentSplit} />

                    {role === "OWNER" && summary.topItems?.length > 0 && (
                        <>
                            <h3 style={{ marginTop: 24 }}>Top Items</h3>
                            <TopItemsChart data={summary.topItems} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
