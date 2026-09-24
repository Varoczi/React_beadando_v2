import { useEffect, useState } from "react";
import {
  fetchAllBookings,
  updateBookingStatus,
  type BookingData,
} from "../api/bookings";
import "./Foglalasaim.css";
import toast from "react-hot-toast";

function AdminFoglalasok() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllBookings();
  }, []);

  const loadAllBookings = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBookings();
      const sortedData = data.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return 0;
      });
      setBookings(sortedData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Váratlan hiba történt a foglalások betöltésekor.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "accepted" | "declined",
  ) => {
    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)),
      );
      toast.success(
        `Foglalás státusza frissítve: ${newStatus === "accepted" ? "Elfogadva" : "Elutasítva"}`,
      );
    } catch (err: unknown) {
      console.error(err);
      toast.error("Hiba történt a státusz módosításakor!");
    }
  };

  const getStatusBadge = (status: BookingData["status"]) => {
    switch (status) {
      case "accepted":
        return <span className="badge status-accepted">✅ Elfogadva</span>;
      case "declined":
        return <span className="badge status-declined">❌ Elutasítva</span>;
      default:
        return <span className="badge status-pending">⏳ Függőben</span>;
    }
  };

  if (loading)
    return <div className="loading-page">Összes foglalás betöltése...</div>;

  if (error) {
    return (
      <div className="bookings-page-container">
        <div className="auth-message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="bookings-page-container">
      <h2>Foglalások Kezelése (Admin)</h2>

      {bookings.length === 0 ? (
        <p className="no-bookings">
          Jelenleg nincs egyetlen foglalás sem a rendszerben.
        </p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`admin-booking-card ${booking.status === "pending" ? "pending" : ""}`}
            >
              <div className="admin-card-header">
                <h3 style={{ margin: 0 }}>
                  {booking.tableName} - {booking.date} ({booking.startTime} -{" "}
                  {booking.endTime})
                </h3>
                {getStatusBadge(booking.status)}
              </div>

              <div className="admin-card-details">
                <div>
                  <strong>Név:</strong> {booking.name}
                </div>
                <div>
                  <strong>Email:</strong> {booking.email}
                </div>
                <div>
                  <strong>Telefon:</strong> {booking.phone}
                </div>
                <div>
                  <strong>Létszám:</strong> {booking.headcount} fő
                </div>
                {booking.notes && (
                  <div style={{ gridColumn: "span 2" }}>
                    <strong>Megjegyzés:</strong> {booking.notes}
                  </div>
                )}
              </div>

              {booking.status === "pending" && (
                <div className="admin-card-actions">
                  <button
                    onClick={() => handleStatusChange(booking.id, "accepted")}
                    className="btn-accept"
                  >
                    Elfogadás
                  </button>
                  <button
                    onClick={() => handleStatusChange(booking.id, "declined")}
                    className="btn-decline"
                  >
                    Elutasítás
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFoglalasok;
