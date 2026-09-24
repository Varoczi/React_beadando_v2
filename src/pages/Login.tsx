import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginSuccess } from '../store/authSlice'
import { loginUser } from '../api/auth'
import toast from 'react-hot-toast'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const response = await loginUser(email, password)
      
      dispatch(loginSuccess({
        token: response.token,
        user: response.user || { name: 'Admin', email: email, role: email === 'admin@example.com' ? 'admin' : 'user' }
      }))

      toast.success('Sikeres bejelentkezés!')
      navigate('/')
      
    } catch (err: unknown) {
      toast.error('Hibás adatok!')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Váratlan hiba történt bejelentkezés közben.')
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Bejelentkezés</h2>
      
      {error && <div className="auth-message error">{error}</div>}

      <form onSubmit={handleSubmit}>
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
          />
        </div>

        <button type="submit" className="auth-submit-btn">
          Bejelentkezés
        </button>
      </form>
    </div>
  )
}

export default Login