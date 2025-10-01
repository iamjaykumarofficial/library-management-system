import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to change your password')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      const response = await fetch('/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Password changed successfully')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setError(data.error || 'Failed to change password')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Change Password</h1>
      <p className="lead text-muted mb-4">Update your account password</p>
      
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label">Current Password *</label>
              <input
                type="password"
                className="form-control"
                id="currentPassword"
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password *</label>
              <input
                type="password"
                className="form-control"
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Changing Password...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword