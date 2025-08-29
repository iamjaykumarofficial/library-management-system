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
        setError('An error occurred while loading your profile')
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
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to update your profile')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      const response = await fetch('http://localhost:5000/api/profile', {
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
      setError('An error occurred while updating your profile')
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Profile Management</h1>
      <p>Update your personal information</p>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}
      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="address" className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn btn-dark">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile