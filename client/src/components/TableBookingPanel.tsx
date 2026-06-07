import { useEffect, useState } from "react";
import type { GameTable } from "../types/types";
import { useAppSelector } from "../store/hooks";
import {getNeptunHeader} from "../utils/headerHelper.ts";

interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

interface TableBookingPanelProps {
    table: GameTable;
}

const API_URL = import.meta.env.VITE_API_URL;

function getTodayString() {
    return new Date().toISOString().slice(0, 10);
}

function TableBookingPanel({ table }: TableBookingPanelProps) {
    const { user, token } = useAppSelector((state) => state.auth);

    const [date, setDate] = useState(getTodayString());
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    const [phone, setPhone] = useState("");
    const [headcount, setHeadcount] = useState(1);
    const [notes, setNotes] = useState("");

    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimeSlots = async () => {
            setLoadingSlots(true);
            setMessage(null);
            setSelectedSlot(null);

            try {
                const response = await fetch(
                    `${API_URL}/tables/${table.id}/timeslots?date=${date}`,
                    {
                        headers: {
                            Accept: "application/json",
                            ...getNeptunHeader(),
                        },
                    }
                );

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(data?.message ?? "Nem sikerült lekérni az időpontokat.");
                }

                setTimeSlots(data);
            } catch (err) {
                const error = err as Error;
                setMessage(error.message);
                setTimeSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchTimeSlots();
    }, [table.id, date]);

    const handleBooking = async () => {
        if (!user || !token) {
            setMessage("Foglaláshoz be kell jelentkezni.");
            return;
        }

        if (!selectedSlot) {
            setMessage("Válassz ki egy szabad időpontot.");
            return;
        }

        setBookingLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    ...getNeptunHeader(),
                },
                body: JSON.stringify({
                    tableId: table.id,
                    date,
                    startTime: selectedSlot.startTime,
                    endTime: selectedSlot.endTime,
                    name: user.name,
                    email: user.email,
                    phone,
                    headcount,
                    notes,
                }),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message ?? "Nem sikerült létrehozni a foglalást.");
            }

            setMessage("Foglalás sikeresen elküldve.");
            setSelectedSlot(null);
            setPhone("");
            setHeadcount(1);
            setNotes("");

            const slotsResponse = await fetch(
                `${API_URL}/tables/${table.id}/timeslots?date=${date}`,
                {
                    headers: {
                        Accept: "application/json",
                        ...getNeptunHeader(),
                    },
                }
            );

            const slotsData = await slotsResponse.json().catch(() => []);
            setTimeSlots(slotsData);
        } catch (err) {
            const error = err as Error;
            setMessage(error.message);
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="booking-panel">
            <h3>Foglalás</h3>

            <label className="form-field">
                <span className="form-label">Dátum</span>
                <input
                    type="date"
                    value={date}
                    min={getTodayString()}
                    onChange={(e) => setDate(e.target.value)}
                />
            </label>

            <div className="timeslot-list">
                {loadingSlots && <p>Időpontok betöltése...</p>}

                {!loadingSlots && timeSlots.length === 0 && (
                    <p>Erre a napra nincs időpont.</p>
                )}

                {!loadingSlots &&
                    timeSlots.map((slot) => (
                        <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            type="button"
                            disabled={!slot.isAvailable}
                            className={`timeslot-button ${
                                selectedSlot?.startTime === slot.startTime &&
                                selectedSlot?.endTime === slot.endTime
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() => setSelectedSlot(slot)}
                        >
                            {slot.startTime} - {slot.endTime}
                            {!slot.isAvailable && " foglalt"}
                        </button>
                    ))}
            </div>

            {selectedSlot && (
                <div className="booking-form">
                    <p className="selected-slot-text">
                        Kiválasztva: {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>

                    <label className="form-field">
                        <span className="form-label">Telefonszám</span>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+36..."
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">Létszám</span>
                        <input
                            type="number"
                            min={1}
                            value={headcount}
                            onChange={(e) => setHeadcount(Number(e.target.value))}
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">Megjegyzés</span>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Opcionális megjegyzés"
                        />
                    </label>

                    <button
                        className="booking-submit-button"
                        type="button"
                        disabled={bookingLoading}
                        onClick={handleBooking}
                    >
                        {bookingLoading ? "Foglalás..." : "Foglalás elküldése"}
                    </button>
                </div>
            )}

            {message && <p className="booking-message">{message}</p>}
        </div>
    );
}

export default TableBookingPanel;