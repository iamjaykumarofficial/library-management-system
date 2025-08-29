import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        if (data.role === 'owner') {
          navigate('/owner-dashboard')
        } else {
          navigate('/member-dashboard')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('An error occurred')
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Sign In</h1>
              <p className="text-center mb-4">Access your library account</p>
              {error && <Alert type="danger" message={error} />}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-dark w-100">Sign In</button>
              </form>
              <div className="text-center mt-3">
                <Link to="/forgot-password">Forgot your password?</Link>
              </div>
              <div className="text-center mt-3">
                Don't have an account? <Link to="/register">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login