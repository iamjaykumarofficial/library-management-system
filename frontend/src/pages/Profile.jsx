import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'

function Profile() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view your profile')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setFormData({
            fullName: data.full_name,
            email: data.email,
            phone: data.phone || '',
            address: data.address || ''
          })
        } else {
          setError(data.error || 'Failed to load profile')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setProfileLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to update your profile')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Profile updated successfully')
      } else {
        setError(data.error || 'Failed to update profile')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Profile Management</h1>
      <p className="lead text-muted mb-4">Update your personal information</p>
      
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="fullName" className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="address" className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile