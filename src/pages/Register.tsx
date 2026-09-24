import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import toast from 'react-hot-toast'
import './Auth.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    try {
      await registerUser(name, email, password)
      
      setSuccessMsg('Sikeres regisztráció! Most már bejelentkezhetsz.')
      toast.success("Sikeres regisztráció!")

      setTimeout(() => {
        navigate('/login')
      }, 1500)
      
    } catch (err: unknown) {
      toast.error("Sikertelen regisztráció!")
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Váratlan hiba történt regisztráció közben.')
      }
    }
  }

  return (
    <div className="auth-container">
      <h2>Regisztráció</h2>
      
      {error && <div className="auth-message error">{error}</div>}
      {successMsg && <div className="auth-message success">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label>Név</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="auth-input"
          />
        </div>

        <div className="auth-form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="auth-input"
          />
        </div>

        <div className="auth-form-group">
          <label>Jelszó</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="auth-input"
            minLength={6}
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          Regisztrálok
        </button>
      </form>
    </div>
  )
}

export default Register