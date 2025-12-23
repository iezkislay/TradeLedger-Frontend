import { useEffect, useState } from "react";
import { getDashboardKpis } from "../api/dashboardApi";
import KpiCard from "../components/KpiCard";
import { useAuth } from "../context/useAuth";

import SalesTrendChart from "../components/charts/SalesTrendChart";
import PaymentSplitChart from "../components/charts/PaymentSplitChart";

export default function Dashboard() {
    const { user } = useAuth();
    const role = user?.role?.name;

    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = () =>
            getDashboardKpis()
                .then(res => {
                    setKpis(res.data.data);
                })
                .finally(() => {
                    setLoading(false);
                });

        load();
        const interval = setInterval(load, 60000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return <p>Loading dashboard...</p>;

    /* -------------------------
       Chart Data Mapping
       ------------------------- */

    // TEMP: until backend provides trend API
    const salesTrend = [
        { date: "Today", sales: kpis.todaySales },
        { date: "Month Avg", sales: kpis.monthSales / 30 }
    ];

    const paymentSplit = Object.entries(kpis.paymentSplit || {}).map(
        ([name, value]) => ({ name, value })
    );

    return (
        <div style={{ padding: "24px" }}>
            <h2>Dashboard</h2>
            <p>Welcome, {user?.username}</p>

            {kpis && (
                <>
                    {/* ================= KPIs ================= */}

                    {/* SALES */}
                    <h3>Sales</h3>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <KpiCard title="Today Sales" value={`₹${kpis.todaySales}`} />
                        <KpiCard title="Month Sales" value={`₹${kpis.monthSales}`} />
                        <KpiCard title="Avg Bill" value={`₹${kpis.avgBillValue}`} />
                    </div>

                    {/* PAYMENT SPLIT */}
                    <h3 style={{ marginTop: "24px" }}>Payment Split</h3>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        {Object.entries(kpis.paymentSplit || {}).map(
                            ([type, amount]) => (
                                <KpiCard
                                    key={type}
                                    title={type}
                                    value={`₹${amount}`}
                                />
                            )
                        )}
                    </div>

                    {/* OWNER ONLY */}
                    {role === "OWNER" && (
                        <>
                            <h3 style={{ marginTop: "24px" }}>Credit & Inventory</h3>
                            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                                <KpiCard
                                    title="Total Outstanding"
                                    value={`₹${kpis.totalOutstanding}`}
                                />

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

                                <KpiCard
                                    title="Stock Value"
                                    value={`₹${kpis.totalStockValue}`}
                                />
                            </div>
                        </>
                    )}

                    {/* ================= CHARTS ================= */}

                    <h3 style={{ marginTop: "32px" }}>Trends</h3>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: "20px",
                            marginTop: "16px"
                        }}
                    >
                        <SalesTrendChart data={salesTrend} />
                        <PaymentSplitChart data={paymentSplit} />
                    </div>
                </>
            )}
        </div>
    );
}
