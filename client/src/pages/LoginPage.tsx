import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState("admin@example.com");
    const [password, setPassword] = useState("admin");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(login({ email, password }));

        if (login.fulfilled.match(result)) {
            navigate("/");
        }
    };

    return (
        <div className="page-card">
            <h1>Bejelentkezés</h1>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label>
                    Jelszó
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Belépés..." : "Belépés"}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;