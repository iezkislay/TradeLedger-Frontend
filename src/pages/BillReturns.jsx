import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function BillReturns() {
    const { billId } = useParams();
    const [items, setItems] = useState([]);

    useEffect(() => {
        api.get(`/bills/${billId}`)
            .then(res => setItems(res.data.data.items || []));
    }, [billId]);

    return (
        <div style={page}>
            <h2>↩️ Return Items</h2>

            {items.map(i => (
                <div key={i.id} style={row}>
                    <div>
                        <strong>{i.itemName}</strong>
                        <div style={meta}>
                            Sold: {i.quantity} {i.unit}
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            (window.location.href =
                                `/returns/item/${i.id}`)
                        }
                    >
                        Return
                    </button>
                </div>
            ))}
        </div>
    );
}

const page = { padding: 24 };
const row = {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderBottom: "1px solid #eee"
};
const meta = { fontSize: 12, opacity: 0.7 };
