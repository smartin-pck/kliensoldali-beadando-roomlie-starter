import { useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import {getNeptunHeader} from "../utils/headerHelper.ts";

interface Booking {
    id: number;
    tableId: number;
    date: string;
    startTime: string;
    endTime: string;
    name: string;
    email: string;
    phone: string;
    headcount: number;
    notes?: string;
    status: string;
    table?: {
        id: number;
        type: string;
        category: string;
        color: string;
    };
}

const API_URL = import.meta.env.VITE_API_URL;

function AdminBookingPage() {
    const { token, user } = useAppSelector((state) => state.auth);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    const isAdmin = user?.role?.toLowerCase() === "admin";

    const fetchBookings = async () => {
        if (!token || !isAdmin) {
            setMessage("Ehhez az oldalhoz admin jogosultság szükséges.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/bookings`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    ...getNeptunHeader(),
                },
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message ?? "Nem sikerült lekérni a foglalásokat.");
            }

            setBookings(data);
            setMessage(null);
        } catch (err) {
            const error = err as Error;
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [token, isAdmin]);

    const updateBookingStatus = async (id: number, status: "accepted" | "declined") => {
        if (!token) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    ...getNeptunHeader(),
                },
                body: JSON.stringify({ status }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message ?? "Nem sikerült módosítani a foglalást.");
            }

            setMessage("Foglalás státusza módosítva.");
            await fetchBookings();
        } catch (err) {
            const error = err as Error;
            setMessage(error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-card">
                <h1>Beérkezett foglalások</h1>
                <p>Betöltés...</p>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <div className="page-card bookings-card">
                <h1>Beérkezett foglalások</h1>

                {message && <p className="booking-message">{message}</p>}

                {bookings.length === 0 && (
                    <p>Nincs beérkezett foglalás.</p>
                )}

                <div className="booking-list">
                    {bookings.map((booking) => (
                        <div className="booking-item" key={booking.id}>
                            <div className="booking-item-header">
                                <strong>
                                    {booking.date} | {booking.startTime} - {booking.endTime}
                                </strong>

                                <span className={`booking-status ${booking.status?.toLowerCase()}`}>
                                    {booking.status}
                                </span>
                            </div>

                            <div className="booking-item-grid">
                                <span>Foglalás ID</span>
                                <strong>{booking.id}</strong>

                                <span>Asztal ID</span>
                                <strong>{booking.tableId}</strong>

                                <span>Név</span>
                                <strong>{booking.name}</strong>

                                <span>Email</span>
                                <strong>{booking.email}</strong>

                                <span>Telefon</span>
                                <strong>{booking.phone}</strong>

                                <span>Létszám</span>
                                <strong>{booking.headcount} fő</strong>

                                {booking.notes && (
                                    <>
                                        <span>Megjegyzés</span>
                                        <strong>{booking.notes}</strong>
                                    </>
                                )}
                            </div>

                            <div className="booking-admin-actions">
                                <button
                                    type="button"
                                    className="booking-approve-button"
                                    onClick={() => updateBookingStatus(booking.id, "accepted")}
                                >
                                    Elfogadás
                                </button>

                                <button
                                    type="button"
                                    className="booking-reject-button"
                                    onClick={() => updateBookingStatus(booking.id, "declined")}
                                >
                                    Elutasítás
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminBookingPage;