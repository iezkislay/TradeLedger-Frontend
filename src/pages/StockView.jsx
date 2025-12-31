import { useEffect, useState } from "react";
import api from "../api/axios";
import StockCard from "../components/StockCard";

export default function StockView() {
    const [stocks, setStocks] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/stock/summary").then(res => {
            setStocks(res.data.data || []);
        });
    }, []);

    // 🔍 Client-side search (name + itemCode)
    const filteredStocks = stocks.filter(s =>
        `${s.name} ${s.itemCode}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // 🗂 Group by category
    const grouped = filteredStocks.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // 💰 Total inventory value
    const totalValue = filteredStocks.reduce(
        (sum, i) => sum + i.stockValue,
        0
    );

    return (
        <div style={{ padding: 24 }}>
            <h2>📊 Stock View</h2>

            <input
                placeholder="Search item / code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    padding: 10,
                    width: 300,
                    marginBottom: 20
                }}
            />

            {Object.entries(grouped).map(([category, items]) => (
                <div key={category} style={{ marginBottom: 32 }}>
                    <h3>{category}</h3>

                    <div style={grid}>
                        {items.map(i => (
                            <StockCard
                                key={i.itemId}
                                item={i}
                            />
                        ))}
                    </div>
                </div>
            ))}

            <h3 style={{ marginTop: 40 }}>
                Total Inventory Value: ₹{totalValue.toFixed(2)}
            </h3>
        </div>
    );
}

const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    marginTop: 16
};
