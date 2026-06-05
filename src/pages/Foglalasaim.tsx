import { useEffect, useState } from 'react';
import { fetchMyBookings, type BookingData } from '../api/bookings';
import './Foglalasaim.css';

function Foglalasaim() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await fetchMyBookings()
        setBookings(data);
      } catch (err) {
        console.error("Nem sikerült betölteni a foglalásokat:", err)
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [])

  const getStatusBadge = (status: BookingData['status']) => {
    switch (status) {
      case 'accepted': return <span className="badge status-accepted">✅ Elfogadva</span>
      case 'declined': return <span className="badge status-declined">❌ Elutasítva</span>
      default: return <span className="badge status-pending">⏳ Függőben</span>
    }
  }

  if (loading) return <div className="loading-page">Foglalások betöltése...</div>

  return (
    <div className="bookings-page-container">
      <h2>Saját foglalásaim</h2>
      
      {bookings.length === 0 ? (
        <p className="no-bookings">Még nincs egyetlen foglalásod sem.</p>
      ) : (
        <div className="bookings-layout">
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className={`booking-card ${selectedBooking?.id === booking.id ? 'active' : ''}`}
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="card-header">
                  <h3>{booking.tableName}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                <p><strong>Dátum:</strong> {booking.date}</p>
                <p><strong>Időpont:</strong> {booking.startTime} - {booking.endTime}</p>
              </div>
            ))}
          </div>

          <div className="booking-details-panel">
            {selectedBooking ? (
              <div className="b-details-card">
                <h3>Foglalás Részletei (#{selectedBooking.id})</h3>
                <hr />
                <p><strong>Asztal:</strong> {selectedBooking.tableName}</p>
                <p><strong>Időpont:</strong> {selectedBooking.date} | {selectedBooking.startTime} - {selectedBooking.endTime}</p>
                <p><strong>Foglaló neve:</strong> {selectedBooking.name}</p>
                <p><strong>Email:</strong> {selectedBooking.email}</p>
                <p><strong>Telefon:</strong> {selectedBooking.phone}</p>
                <p><strong>Létszám:</strong> {selectedBooking.headcount} fő</p>
                {selectedBooking.notes && (
                  <p><strong>Megjegyzés:</strong> {selectedBooking.notes}</p>
                )}
                <p><strong>Státusz:</strong> {getStatusBadge(selectedBooking.status)}</p>
              </div>
            ) : (
              <div className="details-placeholder">Válassz ki egy foglalást a listából a részletek megtekintéséhez!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Foglalasaim