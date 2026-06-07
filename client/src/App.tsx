//A korábbi verziómban, rengeteg logikám itt volt, ezt innen kiszerveztem a RoomPage.tsx-be
//így csak ott van összehényva a kód és nem itt.
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar";
import RoomPage from "./pages/RoomPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookingPage from "./pages/MyBookingPage";
import AdminBookingPage from "./pages/AdminBookingPage";

import "./App.css";
import "./style/styles.css";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<RoomPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/my-bookings" element={<MyBookingPage />} />
                <Route path="/admin-bookings" element={<AdminBookingPage />} />
            </Routes>
        </>
    );
}

export default App;