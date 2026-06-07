import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

function RegisterPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading, error } = useAppSelector((state) => state.auth);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            alert("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
            return;
        }

        const result = await dispatch(register({ name, email, password }));

        if (register.fulfilled.match(result)) {
            navigate("/login");
        }
    };

    return (
        <div className="page-card">
            <h1>Regisztráció</h1>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label>
                    Név
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>

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
                        minLength={6}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Regisztráció..." : "Regisztráció"}
                </button>
            </form>
        </div>
    );
}

export default RegisterPage;