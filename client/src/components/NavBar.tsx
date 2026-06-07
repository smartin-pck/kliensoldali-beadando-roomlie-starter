import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../features/auth/authSlice";
import ThemeToggle from "./ThemeToggle";

import "../style/styles.css";

function isAdmin(role?: string) {
    return role?.toLowerCase() === "admin";
}

function Navbar() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate("/");
    };

    return (
        <nav className="navbar">
            <Link className="navbar-brand" to="/">
                Roomlie
            </Link>

            <div className="navbar-links">
                <NavLink to="/">Terem</NavLink>

                {!user && (
                    <>
                        <NavLink to="/login">Bejelentkezés</NavLink>
                        <NavLink to="/register">Regisztráció</NavLink>
                    </>
                )}

                {user && !isAdmin(user.role) && (
                    <NavLink to="/my-bookings">Foglalásaim</NavLink>
                )}

                {user && isAdmin(user.role) && (
                    <>
                        <Link to="/?panel=add">Asztal hozzáadása</Link>
                        <NavLink to="/admin-bookings">Beérkezett foglalások</NavLink>
                    </>
                )}

                {user && (
                    <button className="navbar-button" type="button" onClick={handleLogout}>
                        Kijelentkezés
                    </button>
                )}
            </div>

            {user && (
                <div className="navbar-user">
                    {user.name}
                    {isAdmin(user.role) && <span className="admin-badge">admin</span>}
                </div>
            )}
            <ThemeToggle />
        </nav>
    );
}

export default Navbar;