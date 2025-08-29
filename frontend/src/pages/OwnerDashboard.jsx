import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Alert from '../components/Alert'

function OwnerDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    activeMembers: 0,
    booksInCirculation: 0,
    outstandingFines: 0
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view the dashboard')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/owner-dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setStats(data)
        } else {
          setError(data.error || 'Failed to load dashboard data')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchData()
  }, [navigate])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Owner Dashboard</h1>
      <p>Manage your library operations and view key metrics</p>
      {error && <Alert type="danger" message={error} />}
      <div className="row mt-4">
        <div className="col-md-3">
          <Card title="Revenue" value={`₹${stats.revenue ? stats.revenue.toFixed(2) : '0.00'}`} label="This Month" />
        </div>
        <div className="col-md-3">
          <Card title="Active Members" value={stats.activeMembers || 0} label="Total Members" />
        </div>
        <div className="col-md-3">
          <Card title="Books in Circulation" value={stats.booksInCirculation || 0} label="Currently Borrowed" />
        </div>
        <div className="col-md-3">
          <Card title="Outstanding Fines" value={`₹${stats.outstandingFines ? stats.outstandingFines.toFixed(2) : '0.00'}`} label="Total Due" />
        </div>
      </div>
      <div className="mt-4">
        <h3>Quick Actions</h3>
        <div className="d-flex gap-3 flex-wrap">
          <Link to="/add-book" className="btn btn-outline-dark">Add Book</Link>
          <Link to="/financial-reports" className="btn btn-outline-dark">Financial Reports</Link>
          <Link to="/asset-reports" className="btn btn-outline-dark">Asset Reports</Link>
          <Link to="/collection-reports" className="btn btn-outline-dark">Collection Reports</Link>
          <Link to="/user-statistics" className="btn btn-outline-dark">User Statistics</Link>
          <Link to="/subject-wise-inventory" className="btn btn-outline-dark">Subject-Wise Inventory</Link>
          <Link to="/book-wise-copies" className="btn btn-outline-dark">Book-Wise Copies</Link>
          <Link to="/profile" className="btn btn-outline-dark">Manage Profile</Link>
          <Link to="/change-password" className="btn btn-outline-dark">Change Password</Link>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard