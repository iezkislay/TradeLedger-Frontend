import api from "./axios";

// 🔹 Get pending bills for a customer
export const getPendingBills = (customerId) =>
    api.get(`/customers/${customerId}/pending-bills`);

// 🔹 Settle bill (partial / full / waiver)
export const settleBill = (billId, payload) =>
    api.post(`/bills/${billId}/settle`, payload);
