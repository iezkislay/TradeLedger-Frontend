import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function BillPrint() {
    const { billId } = useParams();
    const [bill, setBill] = useState(null);

    useEffect(() => {
        axios.get(`/bills/${billId}/print`)
            .then(res => setBill(res.data));
    }, [billId]);

    if (!bill) return <p>Loading...</p>;

    return (
        <div style={{ padding: 24 }}>
            <h2>Puja Hardware</h2>
            <p>Bill No: {bill.billNumber}</p>
            <p>Date: {new Date(bill.createdAt).toLocaleString()}</p>

            <hr />

            <p><b>Customer:</b> {bill.customerName || "Walk-in"}</p>
            <p>Mobile: {bill.customerMobile || "-"}</p>
            <p>Address: {bill.customerAddress || "-"}</p>

            <hr />

            <table width="100%" border="1" cellPadding="6">
                <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
                </thead>
                <tbody>
                {bill.items.map((i, idx) => (
                    <tr key={idx}>
                        <td>{i.name}</td>
                        <td>{i.quantity} {i.unit}</td>
                        <td>₹{i.price}</td>
                        <td>₹{i.amount}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <hr />

            <p>Subtotal: ₹{bill.subtotal}</p>
            <p>Discount: ₹{bill.discount}</p>
            <p><b>Total: ₹{bill.totalAmount}</b></p>
            <p>Paid: ₹{bill.amountPaid}</p>
            <p><b>Due: ₹{bill.dueAmount}</b></p>

            <hr />

            <button onClick={() => window.print()}>
                🖨 Print
            </button>
        </div>
    );
}
