import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { TableData } from "../types.ts";
import "./ReszletesNezet.css";
import type { RootState } from "../store/store.ts";
import { fetchTableTimeslots, type Timeslot } from "../api/tables";
import { createBooking } from "../api/bookings";
import toast from "react-hot-toast";

interface TableDetailsProps {
  table: TableData | null;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: number) => void;
  onClose: () => void;
}

function ReszletesNezet({
  table,
  onDelete,
  onStatusChange,
  onClose,
}: TableDetailsProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const [date, setDate] = useState("");
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Timeslot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [notes, setNotes] = useState("");
  const [bookingMessage, setBookingMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setDate("");
    setTimeslots([]);
    setSelectedSlot(null);
    setBookingMessage(null);
    setPhone("");
    setHeadcount(1);
    setNotes("");
  }, [table]);

  useEffect(() => {
    if (!table || !date) return;

    const loadTimeslots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const slots = await fetchTableTimeslots(table.id, date);
        setTimeslots(slots);
      } catch (err) {
        console.error("Hiba az időpontok betöltésekor:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadTimeslots();
  }, [date, table]);

  if (!table)
    return (
      <div className="details-placeholder">
        Válassz ki egy asztalt a részletekért!
      </div>
    );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !date) return;

    try {
      await createBooking({
        tableId: table.id,
        date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        name,
        email,
        phone,
        headcount,
        notes,
      });
      setBookingMessage({
        type: "success",
        text: "Sikeres foglalás! Az adminisztrátor jóváhagyására vár.",
      });
      setSelectedSlot(null);
      setDate("");
      setTimeslots([]);
      toast.success("Időpont sikeresen lefoglalva!");
    } catch (err: any) {
      setBookingMessage({
        type: "error",
        text: err.message || "Hiba történt a foglalás során!",
      });
      toast.error("Meghiúsult foglalás!");
    }
  };

  return (
    <div className="table-details">
      <div className="details-header">
        <h3>Asztal Részletei (#{table.id})</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="details-body">
        <p>
          <strong>Típus:</strong> {table.type}
        </p>
        <p>
          <strong>Kategória:</strong> {table.category}
        </p>
        <p>
          <strong>Szín:</strong> {table.color}
        </p>
        <p>
          <strong>Pozíció:</strong> X: {table.position.x}, Y: {table.position.y}
        </p>

        <div className="status-control">
          <label>
            <strong>Állapot (1-10):</strong> {table.status}
          </label>
          {isAdmin && (
            <input
              type="range"
              min="1"
              max="10"
              value={table.status}
              onChange={(e) => onStatusChange(table.id, Number(e.target.value))}
            />
          )}
        </div>

        <p>
          <strong>Státusz:</strong>{" "}
          {table["isLocked"] ? "🔒 Rögzítve" : "🔓 Mozgatható"}
        </p>
      </div>

      {isUser && (
        <div className="booking-section">
          <h4>Asztal foglalása</h4>

          {bookingMessage && (
            <div className={`booking-alert ${bookingMessage.type}`}>
              {bookingMessage.text}
            </div>
          )}

          <label className="booking-label">
            <strong>Válassz napot:</strong>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {loadingSlots && (
            <p className="loading-text">Időpontok betöltése...</p>
          )}

          {date && timeslots.length > 0 && (
            <div className="timeslots-container">
              <strong>Szabad időpontok:</strong>
              <div className="timeslots-grid">
                {timeslots.map((slot, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!slot.isAvailable}
                    className={`timeslot-btn ${!slot.isAvailable ? "taken" : ""} ${selectedSlot === slot ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                ))}
              </div>
            </div>
          )}

          {date && timeslots.length === 0 && !loadingSlots && (
            <p className="no-slots">
              Erre a napra nincsenek elérhető időpontok.
            </p>
          )}

          {selectedSlot && (
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <h5>
                Foglalási adatok a következő időpontra: {selectedSlot.startTime}{" "}
                - {selectedSlot.endTime}
              </h5>

              <label>
                Név:
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Telefon:
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                  required
                />
              </label>

              <label>
                Résztvevők száma:
                <input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  required
                />
              </label>

              <label>
                Megjegyzés (opcionális):
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </label>

              <button type="submit" className="submit-booking-btn">
                Asztal lefoglalása
              </button>
            </form>
          )}
        </div>
      )}

      {isAdmin && (
        <button className="delete-btn" onClick={() => onDelete(table.id)}>
          Asztal törlése
        </button>
      )}
    </div>
  );
}

export default ReszletesNezet;
