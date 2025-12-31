import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    // NEW: prevent redirect flicker while auth is loading
    if (loading) return <p>Loading...</p>;

    // OLD behavior preserved: redirect if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
