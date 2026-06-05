import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { type RootState } from '../store/store.ts'
import { logout } from '../store/authSlice'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import './Navbar.css'

function Navbar() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isDark, setIsDark] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.body.classList.add('dark-mode')
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    toast.success('Sikeres kijelentkezés!')
    setIsOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand-section">
        <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
          Roomlie
        </Link>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
        >
          {isDark ? '☀️ Világos' : '🌙 Sötét'}
        </button>
      </div>

      <button className="hamburger-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
        {!isAuthenticated && (
          <>
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Terem</Link>
            <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Bejelentkezés</Link>
            <Link to="/register" className="nav-link" onClick={() => setIsOpen(false)}>Regisztráció</Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <span className="user-greeting">
              {user?.name} {user?.role === 'admin' && '(Admin)'}
            </span>
            
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Terem</Link>
            
            {user?.role === 'admin' && (
              <Link to="/bookings" className="nav-link" onClick={() => setIsOpen(false)}>Beérkezett foglalások</Link>
            )}

            {user?.role === 'user' && (
              <Link to="/bookings/my" className="nav-link" onClick={() => setIsOpen(false)}>Foglalásaim</Link>
            )}

            <button 
              onClick={handleLogout} 
              className="logout-btn"
            >
              Kijelentkezés
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar