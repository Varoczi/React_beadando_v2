import { useEffect, useState } from 'react'
import { fetchAllBookings, updateBookingStatus, type BookingData } from '../api/bookings'
import './Foglalasaim.css'
import toast from 'react-hot-toast'

function AdminFoglalasok() {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllBookings()
  }, [])

  const loadAllBookings = async () => {
    setLoading(true)
    try {
      const data = await fetchAllBookings()
      const sortedData = data.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (a.status !== 'pending' && b.status === 'pending') return 1
        return 0
      })
      setBookings(sortedData)
    } catch (err: any) {
      setError(err.message || "Nem sikerült betölteni a foglalásokat.")
    } finally {
      setLoading(false)
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'accepted' | 'declined') => {
    try {
      await updateBookingStatus(id, newStatus)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
      toast.success(`Foglalás státusza frissítve: ${newStatus}`)
    } catch (err) {
      console.error(err)
      toast.error('Hiba történt a státusz módosításakor!')
    }
  }

  const getStatusBadge = (status: BookingData['status']) => {
    switch (status) {
      case 'accepted': return <span className="badge status-accepted">✅ Elfogadva</span>
      case 'declined': return <span className="badge status-declined">❌ Elutasítva</span>
      default: return <span className="badge status-pending">⏳ Függőben</span>
    }
  };

  if (loading) return <div className="loading-page">Összes foglalás betöltése...</div>
  if (error) return <div className="error-page" style={{color: 'red'}}>{error}</div>

  return (
    <div className="bookings-page-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>Foglalások Kezelése (Admin)</h2>
      
      {bookings.length === 0 ? (
        <p>Jelenleg nincs egyetlen foglalás sem a rendszerben.</p>
      ) : (
        <div className="admin-bookings-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {bookings.map((booking) => (
            <div 
              key={booking.id} 
              className={`admin-booking-card ${booking.status === 'pending' ? 'pending' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{booking.tableName} - {booking.date} ({booking.startTime} - {booking.endTime})</h3>
                {getStatusBadge(booking.status)}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', marginBottom: '15px' }}>
                <div><strong>Név:</strong> {booking.name}</div>
                <div><strong>Email:</strong> {booking.email}</div>
                <div><strong>Telefon:</strong> {booking.phone}</div>
                <div><strong>Létszám:</strong> {booking.headcount} fő</div>
                {booking.notes && <div style={{ gridColumn: 'span 2' }}><strong>Megjegyzés:</strong> {booking.notes}</div>}
              </div>

              {booking.status === 'pending' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleStatusChange(booking.id, 'accepted')}
                    style={{ backgroundColor: '#48bb78', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Elfogadás
                  </button>
                  <button 
                    onClick={() => handleStatusChange(booking.id, 'declined')}
                    style={{ backgroundColor: '#f56565', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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

export default AdminFoglalasok