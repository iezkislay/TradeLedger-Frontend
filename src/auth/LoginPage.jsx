import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const submit = async () => {
        try {
            await login(form.username, form.password);
            navigate("/home");
        } catch {
            alert("Invalid username or password");
        }
    };

    return (
        <div style={page}>
            <div style={card}>
                <h2 style={title}>🔐 Login</h2>

                <input
                    style={input}
                    placeholder="Username"
                    value={form.username}
                    onChange={e =>
                        setForm({ ...form, username: e.target.value })
                    }
                />

                <input
                    style={input}
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={e =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <button style={button} onClick={submit}>
                    Login
                </button>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const page = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f7fb"
};

const card = {
    width: 360,
    padding: 24,
    borderRadius: 10,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const title = {
    marginBottom: 20,
    textAlign: "center"
};

const input = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 14,
    borderRadius: 6,
    border: "1px solid #ddd",
    fontSize: 14,
    outline: "none"
};

const button = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer"
};
