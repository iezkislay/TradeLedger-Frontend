import { useEffect, useState } from "react";
import api from "../api/axios";

export default function SearchBillModal({ onClose }) {
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (q.length < 2) {
            setResults([]);
            return;
        }

        api.get("/bills", { params: { search: q } })
            .then(res => setResults(res.data.data || []));
    }, [q]);

    return (
        <div style={overlay}>
            <div style={modal}>
                <h3>🔎 Search Bill</h3>

                <input
                    style={input}
                    placeholder="Bill No / Bill Code"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />

                {results.map(b => (
                    <div
                        key={b.billId}
                        style={row}
                        onClick={() =>
                            (window.location.href =
                                `/bills/${b.billId}/view`)
                        }
                    >
                        {b.billCode} — ₹{b.totalAmount}
                    </div>
                ))}

                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

const overlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const modal = {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    width: 400
};

const input = {
    width: "100%",
    padding: 8,
    marginBottom: 12
};

const row = {
    padding: 8,
    cursor: "pointer",
    borderBottom: "1px solid #eee"
};
