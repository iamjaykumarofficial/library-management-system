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
  const [initialLoading, setInitialLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view your profile')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('http://localhost:5000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setFormData({
            fullName: data.full_name || data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || ''
          })
          setError('')
        } else {
          setError(data.error || 'Failed to load profile data')
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        setError('Unable to connect to server. Please try again later.')
      } finally {
        setInitialLoading(false)
      }
    }
    
    fetchProfile()
  }, [navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    // Clear errors when user starts typing
    if (error) setError('')
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
        setLoading(false)
        return
      }

      // Validate required fields
      if (!formData.fullName.trim()) {
        setError('Full name is required')
        setLoading(false)
        return
      }

      if (!formData.email.trim()) {
        setError('Email address is required')
        setLoading(false)
        return
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Send data in the format backend expects
      const updateData = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      }

      console.log('Sending update data:', updateData)

      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Profile updated successfully!')
        // Update form data with any changes from server
        setFormData(prev => ({
          ...prev,
          fullName: data.full_name || data.fullName || prev.fullName,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          address: data.address || prev.address
        }))
      } else {
        setError(data.error || 'Failed to update profile. Please try again.')
      }
    } catch (err) {
      console.error('Update error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h1 className="mb-4 text-center">Profile Management</h1>
          <p className="text-muted text-center mb-4">Update your personal information</p>
          
          {error && (
            <Alert 
              type="danger" 
              message={error}
              onClose={() => setError('')}
            />
          )}
          
          {success && (
            <Alert 
              type="success" 
              message={success}
              onClose={() => setSuccess('')}
            />
          )}
          
          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label fw-semibold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label fw-semibold">
                    Phone Number
                  </label>
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
                
                <div className="mb-4">
                  <label htmlFor="address" className="form-label fw-semibold">
                    Address
                  </label>
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
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating Profile...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile