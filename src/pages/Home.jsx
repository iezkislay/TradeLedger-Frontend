import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
    const { user } = useContext(AuthContext);

    const isOwner = user?.role === "OWNER";

    return (
        <div style={page}>
            <h1>🏠 TradeLedger</h1>
            <p style={subtitle}>
                Billing, Stock & Ledger Management
            </p>

            <div style={grid}>
                {/* BILLING */}
                <Card
                    title="🧾 Billing"
                    desc="Create bills, collect payments, handle credit sales"
                    link="/billing"
                />

                {/* GST BILLING */}
                <Card
                    title="🧾 GST Billing"
                    desc="Create GST invoices with tax breakdown and compliance"
                    link="/gst/billing"
                />

                {/* CUSTOMERS */}
                <Card
                    title="👥 Customers"
                    desc="View customer balances, statements & settlements"
                    link="/customers"
                />

                {/* RETURNS */}
                <Card
                    title="↩️ Returns & Refunds"
                    desc="Handle bill-linked returns and refunds safely"
                    link="/returns"
                />

                {/* OWNER ONLY */}
                {isOwner && (
                    <>
                        <Card
                            title="📦 Item Master"
                            desc="Create and manage items & pricing"
                            link="/items"
                        />

                        <Card
                            title="📊 Stock View"
                            desc="View stock levels and low-stock alerts"
                            link="/stock"
                        />

                        <Card
                            title="📈 Dashboard"
                            desc="Business KPIs and summaries"
                            link="/dashboard"
                        />
                    </>
                )}
            </div>
        </div>
    );
}

/* ================= CARD COMPONENT ================= */

function Card({ title, desc, link }) {
    return (
        <div
            style={card}
            onClick={() => (window.location.href = link)}
        >
            <div style={cardTitle}>{title}</div>
            <div style={cardDesc}>{desc}</div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    padding: 32
};

const subtitle = {
    opacity: 0.7,
    marginBottom: 24
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20
};

const card = {
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 20,
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "transform 0.1s ease"
};

const cardTitle = {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 6
};

const cardDesc = {
    fontSize: 13,
    opacity: 0.7
};
