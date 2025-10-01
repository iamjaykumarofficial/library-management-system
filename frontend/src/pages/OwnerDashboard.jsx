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
  const [loading, setLoading] = useState(true)
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
          // Ensure all values are numbers
          setStats({
            revenue: Number(data.revenue) || 0,
            activeMembers: Number(data.activeMembers) || 0,
            booksInCirculation: Number(data.booksInCirculation) || 0,
            outstandingFines: Number(data.outstandingFines) || 0
          })
        } else {
          setError(data.error || 'Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        setError('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Owner Dashboard</h1>
      <p className="lead text-muted mb-4">Manage your library operations and view key metrics</p>
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <Card 
            title="Revenue" 
            value={`₹${stats.revenue.toFixed(2)}`} 
            label="This Month"
            icon="fas fa-money-bill-wave"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Active Members" 
            value={stats.activeMembers} 
            label="Total Members"
            icon="fas fa-users"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Books in Circulation" 
            value={stats.booksInCirculation} 
            label="Currently Borrowed"
            icon="fas fa-book"
            color="info"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Outstanding Fines" 
            value={`₹${stats.outstandingFines.toFixed(2)}`} 
            label="Total Due"
            icon="fas fa-exclamation-triangle"
            color="warning"
          />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="card-title mb-0">
            <i className="fas fa-bolt me-2 text-warning"></i>
            Quick Actions
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <Link to="/add-book" className="btn btn-outline-primary w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-plus-circle fa-2x mb-2"></i>
                <span>Add Book</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/financial-reports" className="btn btn-outline-success w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-chart-line fa-2x mb-2"></i>
                <span>Financial Reports</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/asset-reports" className="btn btn-outline-info w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-chart-bar fa-2x mb-2"></i>
                <span>Asset Reports</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/collection-reports" className="btn btn-outline-warning w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-book fa-2x mb-2"></i>
                <span>Collection Reports</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/user-statistics" className="btn btn-outline-secondary w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-user-chart fa-2x mb-2"></i>
                <span>User Statistics</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/subject-wise-inventory" className="btn btn-outline-dark w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-list fa-2x mb-2"></i>
                <span>Subject Inventory</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/book-wise-copies" className="btn btn-outline-primary w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-copy fa-2x mb-2"></i>
                <span>Book Copies</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/profile" className="btn btn-outline-success w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-user fa-2x mb-2"></i>
                <span>Manage Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard