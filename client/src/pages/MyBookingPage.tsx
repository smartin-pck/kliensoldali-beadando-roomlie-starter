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

function MyBookingPage() {
    const { token } = useAppSelector((state) => state.auth);

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!token) {
                setMessage("A foglalások megtekintéséhez be kell jelentkezni.");
                setLoading(false);
                return;
            }

            try {

                const response = await fetch(`${API_URL}/bookings/my`, {
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
            } catch (err) {
                const error = err as Error;
                setMessage(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [token]);

    if (loading) {
        return (
            <div className="page-card">
                <h1>Foglalásaim</h1>
                <p>Betöltés...</p>
            </div>
        );
    }

    return (
        <div className="bookings-page">
            <div className="page-card bookings-card">
                <h1>Foglalásaim</h1>

                {message && <p className="form-error">{message}</p>}

                {!message && bookings.length === 0 && (
                    <p>Még nincs foglalásod.</p>
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyBookingPage;