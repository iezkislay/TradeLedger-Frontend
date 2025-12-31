import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";

export default function Refund() {
    const { billId } = useParams();

    const [amount, setAmount] = useState("");
    const [mode, setMode] = useState("CREDIT");
    const [reason, setReason] = useState("");

    const submit = async () => {
        await api.post("/refunds", {
            billId,
            amount: Number(amount),
            refundMode: mode,
            reason
        });
        window.history.back();
    };

    return (
        <div style={page}>
            <h2>💸 Refund</h2>

            <div style={form}>
                <input
                    type="number"
                    placeholder="Refund amount"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />

                <select
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                >
                    <option value="CREDIT">Ledger Credit</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                </select>

                <input
                    placeholder="Reason"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                />

                <button onClick={submit}>
                    Process Refund
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
