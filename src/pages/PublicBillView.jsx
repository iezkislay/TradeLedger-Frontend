import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function PublicBillView() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      const res = await api.get(`/public/bills/${billId}`);
      setBill(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!bill) return <div style={{ padding: 20 }}>Bill not found</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>🧾 Bill</h2>

      <div style={box}>
        <b>Bill No:</b> {bill.billNumber}<br />
        <b>Date:</b> {new Date(bill.billDate).toLocaleString()}<br />
        <b>Total:</b> ₹{bill.effectiveTotal}
      </div>

      <div style={box}>
        <h3>Customer</h3>
        <p><b>Name:</b> {bill.customerName || "-"}</p>
        <p><b>Mobile:</b> {bill.customerMobile || "-"}</p>
      </div>

      <div style={box}>
        <h3>Amount Summary</h3>
        <p>Subtotal: ₹{bill.subtotal}</p>
        <p>Discount: ₹{bill.discountAmount}</p>
        <p><b>Total: ₹{bill.effectiveTotal}</b></p>
      </div>
    </div>
  );
}

const box = {
  background: "#fff",
  padding: 16,
  borderRadius: 8,
  marginBottom: 16,
  border: "1px solid #eee"
};