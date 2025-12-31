import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./auth/LoginPage";
import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import BillPrint from "./pages/BillPrint";
import PrivateRoute from "./routes/PrivateRoute";
import { useAuth } from "./context/useAuth";
import Customers from "./pages/Customers.jsx";
import CustomerStatement from "./pages/CustomerStatement.jsx";
import PendingBills from "./pages/PendingBills.jsx";
import BillSettlement from "./pages/BillSettlement.jsx";
import Items from "./pages/Items";
import ItemForm from "./pages/ItemForm";
import StockView from "./pages/StockView.jsx";

/* 🆕 RETURNS & REFUNDS */
import BillReturns from "./pages/BillReturns.jsx";
import PartialReturn from "./pages/PartialReturn.jsx";
import Refund from "./pages/Refund.jsx";

function App() {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    return (
        <BrowserRouter>
            <Routes>

                {/* ROOT */}
                <Route
                    path="/"
                    element={<Navigate to={user ? "/home" : "/login"} />}
                />

                {/* PUBLIC */}
                <Route path="/login" element={<LoginPage />} />

                {/* PROTECTED */}
                <Route
                    path="/home"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/billing"
                    element={
                        <PrivateRoute>
                            <Billing />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/billing/print/:billId"
                    element={
                        <PrivateRoute>
                            <BillPrint />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/customers/:customerId/pending-bills"
                    element={
                        <PrivateRoute>
                            <PendingBills />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/bills/:billId/settle"
                    element={
                        <PrivateRoute>
                            <BillSettlement />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/customers"
                    element={
                        <PrivateRoute>
                            <Customers />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/customers/:customerId/statement"
                    element={
                        <PrivateRoute>
                            <CustomerStatement />
                        </PrivateRoute>
                    }
                />

                {/* ================= ITEM MASTER ================= */}

                <Route
                    path="/items"
                    element={
                        <PrivateRoute roles={["OWNER"]}>
                            <Items />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/items/new"
                    element={
                        <PrivateRoute roles={["OWNER"]}>
                            <ItemForm />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/items/:itemId/edit"
                    element={
                        <PrivateRoute roles={["OWNER"]}>
                            <ItemForm />
                        </PrivateRoute>
                    }
                />

                {/* ================= STOCK ================= */}

                <Route
                    path="/stock/summary"
                    element={
                        <PrivateRoute>
                            <StockView />
                        </PrivateRoute>
                    }
                />

                {/* ================= RETURNS & REFUNDS ================= */}

                <Route
                    path="/bills/:billId/returns"
                    element={
                        <PrivateRoute>
                            <BillReturns />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/returns/item/:billItemId"
                    element={
                        <PrivateRoute>
                            <PartialReturn />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/bills/:billId/refund"
                    element={
                        <PrivateRoute>
                            <Refund />
                        </PrivateRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
