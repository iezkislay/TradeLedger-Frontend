import api from "./axios";

/* =========================
   🔍 SEARCH / LIST
   ========================= */

// Autocomplete search (OLD – keep)
export const searchCustomers = (q) =>
    api.get("/customers/search", { params: { q } });

// Get all customers (NEW)
export const getCustomers = () =>
    api.get("/customers");

/* =========================
   💳 CUSTOMER FINANCIALS
   ========================= */

// Get customer balance (NEW – ledger truth)
export const getCustomerBalance = (id) =>
    api.get(`/customers/${id}/balance`);

// Get customer statement (NEW – timeline)
export const getCustomerStatement = (id) =>
    api.get(`/customers/${id}/statement`);

/* =========================
   📒 CUSTOMER DETAILS
   ========================= */

// Get customer by ID (optional but useful)
export const getCustomerById = (id) =>
    api.get(`/customers/${id}`);

// Get pending bills for customer
export const getCustomerPendingBills = (id) =>
    api.get(`/customers/${id}/pending-bills`);
