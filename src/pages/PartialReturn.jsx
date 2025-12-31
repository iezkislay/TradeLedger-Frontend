import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

export default function PartialReturn() {
    const { billItemId } = useParams();

    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [returnType, setReturnType] = useState("DELIVERED");

    const submit = async () => {
        await api.post("/returns/partial", {
            billItemId,
            quantity: Number(quantity),
            returnType,
            reason
        });
        window.history.back();
    };

    return (
        <div style={page}>
            <h2>↩️ Partial Return</h2>

            <div style={form}>
                <input
                    type="number"
                    placeholder="Quantity to return"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                />

                <select
                    value={returnType}
                    onChange={e => setReturnType(e.target.value)}
                >
                    <option value="DELIVERED">
                        Delivered & Returned
                    </option>
                    <option value="NOT_DELIVERED">
                        Never Delivered
                    </option>
                </select>

                <input
                    placeholder="Reason"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />

                <button onClick={submit}>
                    Confirm Return
                </button>
            </div>
        </div>
    );
}

const page = { padding: 24 };
const form = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 400
};
