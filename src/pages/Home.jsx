import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {

    const { user } = useContext(AuthContext);

    const isOwner = user?.role?.name === "OWNER";

    const quickStats = [
        {
            label: "Role",
            value: user?.role?.name || "-"
        },
        {
            label: "System",
            value: "TradeLedger"
        },
        {
            label: "Mode",
            value: "Production"
        }
    ];

    return (

        <div style={page}>

            {/* ======================================
               HEADER
               ====================================== */}

            <div style={heroSection}>

                <div>

                    <div style={badge}>
                        🏪 Hardware & Billing ERP
                    </div>

                    <h1 style={title}>
                        Welcome to TradeLedger
                    </h1>

                    <p style={subtitle}>
                        Billing, GST, Inventory, Returns, Customer Ledger,
                        Refunds & Business Operations — all in one place.
                    </p>

                </div>

                <div style={heroCard}>

                    <div style={heroCardTitle}>
                        👋 Logged in as
                    </div>

                    <div style={heroUser}>
                        {user?.username || "User"}
                    </div>

                    <div style={heroRole}>
                        {typeof user?.role?.name === "object"
                            ? user?.role?.name
                            : user?.role?.name || "-"}
                    </div>

                </div>

            </div>

            {/* ======================================
               QUICK STATS
               ====================================== */}

            <div style={statsGrid}>

                {quickStats.map((s, idx) => (

                    <div key={idx} style={statCard}>

                        <div style={statLabel}>
                            {s.label}
                        </div>

                        <div style={statValue}>
                            {s.value}
                        </div>

                    </div>

                ))}

            </div>

            {/* ======================================
               MAIN MODULES
               ====================================== */}

            <SectionTitle title="🧾 Billing & Sales" />

            <div style={grid}>

                <Card
                    title="🧾 Billing"
                    desc="Create bills, collect payments, handle credit sales and print customer statements"
                    link="/billing"
                    color="#2563eb"
                />

                <Card
                    title="🧾 GST Billing"
                    desc="Create GST invoices with tax breakdown and compliance"
                    link="/gst/billing"
                    color="#7c3aed"
                />

                <Card
                    title="📄 Pending Bills"
                    desc="Track unpaid, partially settled and pending customer bills"
                    link="/pending-bills"
                    color="#dc2626"
                />

                <Card
                    title="📦 Fulfilments"
                    desc="Manage pending fulfilments and completed deliveries"
                    link="/fulfilments"
                    color="#0891b2"
                />

            </div>

            {/* ======================================
               CUSTOMER & RETURNS
               ====================================== */}

            <SectionTitle title="👥 Customers & Returns" />

            <div style={grid}>

                <Card
                    title="👥 Customers"
                    desc="View customer balances, statements, settlements and ledger history"
                    link="/customers"
                    color="#16a34a"
                />

                <Card
                    title="↩️ Returns & Refunds"
                    desc="Handle bill-linked returns, refunds and reconciled adjustments"
                    link="/returns"
                    color="#ea580c"
                />

                <Card
                    title="🧾 Return Notes"
                    desc="View finalized return notes and return history"
                    link="/return-notes"
                    color="#ca8a04"
                />

            </div>

            {/* ======================================
               INVENTORY
               ====================================== */}

            <SectionTitle title="📦 Inventory & Stock" />

            <div style={grid}>

                <Card
                    title="📦 Items & Stock"
                    desc="Manage items, brands, pricing, stock levels and low-stock alerts"
                    link="/items"
                    color="#0f766e"
                />

                <Card
                    title="⚖️ Stock Adjustment"
                    desc="Adjust stock quantities and maintain inventory accuracy"
                    link="/stock-adjust"
                    color="#475569"
                />

            </div>

            {/* ======================================
               OWNER MODULES
               ====================================== */}

            {isOwner && (
                <>
                    <SectionTitle title="📊 Management & Reports" />

                    <div style={grid}>

                        <Card
                            title="📈 Dashboard"
                            desc="Business KPIs, billing analytics, revenue and operational insights"
                            link="/dashboard"
                            color="#9333ea"
                        />

                    </div>
                </>
            )}

            {/* ======================================
               FOOTER
               ====================================== */}

            <div style={footer}>

                TradeLedger ERP • Hardware Billing &
                Inventory Management System

            </div>

        </div>
    );
}

/* ======================================
   CARD
   ====================================== */

function Card({
    title,
    desc,
    link,
    color = "#2563eb"
}) {

    return (

        <div
            style={{
                ...card,
                borderTop: `4px solid ${color}`
            }}
            onClick={() => (
                window.location.href = link
            )}
        >

            <div style={cardTitle}>
                {title}
            </div>

            <div style={cardDesc}>
                {desc}
            </div>

            <div style={cardAction}>
                Open →
            </div>

        </div>

    );
}

/* ======================================
   SECTION TITLE
   ====================================== */

function SectionTitle({ title }) {

    return (
        <div style={sectionTitle}>
            {title}
        </div>
    );
}

/* ======================================
   STYLES
   ====================================== */

const page = {
    padding: 32,
    background: "#f8fafc",
    minHeight: "100vh"
};

const heroSection = {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    flexWrap: "wrap",
    marginBottom: 24
};

const badge = {
    display: "inline-block",
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 14
};

const title = {
    fontSize: 38,
    fontWeight: 700,
    margin: 0,
    marginBottom: 10,
    color: "#0f172a"
};

const subtitle = {
    fontSize: 16,
    color: "#475569",
    maxWidth: 700,
    lineHeight: 1.6
};

const heroCard = {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    minWidth: 240,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0"
};

const heroCardTitle = {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 10
};

const heroUser = {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4
};

const heroRole = {
    color: "#2563eb",
    fontWeight: 600
};

const statsGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 30
};

const statCard = {
    background: "#fff",
    borderRadius: 14,
    padding: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
};

const statLabel = {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8
};

const statValue = {
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a"
};

const sectionTitle = {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 30,
    marginBottom: 18,
    color: "#0f172a"
};

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 20
};

const card = {
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    cursor: "pointer",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.15s ease",
    minHeight: 150,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
};

const cardTitle = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
    color: "#0f172a"
};

const cardDesc = {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569"
};

const cardAction = {
    marginTop: 18,
    fontSize: 13,
    fontWeight: 600,
    color: "#2563eb"
};

const footer = {
    marginTop: 50,
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    paddingBottom: 20
};