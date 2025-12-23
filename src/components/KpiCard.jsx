export default function KpiCard({ title, value, subtitle, alert = false }) {
    return (
        <div
            style={{
                border: `2px solid ${alert ? "#ff5252" : "#ddd"}`,
                borderRadius: "8px",
                padding: "16px",
                minWidth: "200px",
                background: alert ? "#fff5f5" : "#fafafa",
            }}
        >
            <h4 style={{ margin: 0 }}>{title}</h4>
            <h2 style={{ margin: "8px 0" }}>{value}</h2>
            {subtitle && <small>{subtitle}</small>}
        </div>
    );
}
