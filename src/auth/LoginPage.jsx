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
            navigate("/dashboard");
        } catch {
            alert("Invalid username or password");
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <input
                placeholder="Username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
            />

            <br /><br />

            <button onClick={submit}>Login</button>
        </div>
    );
}
