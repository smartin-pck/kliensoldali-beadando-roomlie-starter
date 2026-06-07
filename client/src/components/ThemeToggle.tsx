import { useEffect, useState } from "react";

const THEME_KEY = "roomlie_dark_mode";

function ThemeToggle() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem(THEME_KEY) === "true";
    });

    useEffect(() => {
        document.body.classList.toggle("dark-mode", isDarkMode);
        localStorage.setItem(THEME_KEY, String(isDarkMode));
    }, [isDarkMode]);

    return (
        <button
            className="navbar-theme-toggle"
            type="button"
            onClick={() => setIsDarkMode((current) => !current)}
            aria-label={isDarkMode ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
            title={isDarkMode ? "Világos mód" : "Sötét mód"}
        >
            {isDarkMode ? "☀️" : "🌙"}
        </button>
    );
}

export default ThemeToggle;