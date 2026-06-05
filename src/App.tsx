import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from "./pages/Home"
import Login from './pages/Login'
import Register from './pages/Register'
import Foglalasaim from './pages/Foglalasaim'
import AdminFoglalasok from './pages/AdminFoglalasok'
import { Toaster } from 'react-hot-toast'
import './App.css'

const NotFound = () => <div style={{ padding: '20px' }}><h2>404 - Az oldal nem található</h2></div>

function App() {

  return (
    <BrowserRouter>
        <Navbar />
        <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings/my" element={<Foglalasaim />} />
          <Route path="/bookings" element={<AdminFoglalasok />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App
