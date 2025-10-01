import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Alert from '../components/Alert'

function MemberDashboard() {
  const [stats, setStats] = useState({
    booksBorrowed: 0,
    booksRead: 0,
    fines: 0,
    nextReturnDays: null
  })
  const [error, setError] = useState('')
  const [membershipExpiry, setMembershipExpiry] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view your dashboard')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        // Fetch all data sequentially to avoid overwhelming the server
        const borrowedRes = await fetch('http://localhost:5000/api/borrowed-books', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const historyRes = await fetch('http://localhost:5000/api/borrowing-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const finesRes = await fetch('http://localhost:5000/api/outstanding-fines', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const profileRes = await fetch('http://localhost:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        // Check if responses are ok
        if (!borrowedRes.ok) throw new Error('Failed to fetch borrowed books')
        if (!historyRes.ok) throw new Error('Failed to fetch borrowing history')
        if (!finesRes.ok) throw new Error('Failed to fetch fines')
        if (!profileRes.ok) throw new Error('Failed to fetch profile')

        const borrowed = await borrowedRes.json()
        const history = await historyRes.json()
        const fines = await finesRes.json()
        const profile = await profileRes.json()

        console.log('Dashboard Data:', { borrowed, history, fines, profile })

        // Calculate statistics
        const totalFines = Array.isArray(fines) ? 
          fines.reduce((sum, fine) => sum + (Number(fine.amount) || 0), 0) : 0
        
        let nextReturnDays = null
        if (Array.isArray(borrowed) && borrowed.length > 0) {
          const nextDueDate = new Date(borrowed[0].due_date)
          const today = new Date()
          const diffTime = nextDueDate - today
          nextReturnDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
        }

        setStats({
          booksBorrowed: Array.isArray(borrowed) ? borrowed.length : 0,
          booksRead: Array.isArray(history) ? history.length : 0,
          fines: totalFines,
          nextReturnDays
        })
        
        if (profile.membership_expiry) {
          setMembershipExpiry(new Date(profile.membership_expiry).toLocaleDateString())
        } else {
          setMembershipExpiry('Not set')
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError(err.message || 'Failed to load dashboard data. Please try again.')
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
          <p className="mt-3">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row align-items-center mb-4">
        <div className="col">
          <h1 className="fw-bold">Member Dashboard</h1>
          <p className="lead text-muted mb-0">
            Welcome back! Your membership is active until <strong>{membershipExpiry}</strong>
          </p>
        </div>
        <div className="col-auto">
          <div className="badge bg-success fs-6 p-2">
            <i className="fas fa-check-circle me-2"></i>
            Active Member
          </div>
        </div>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <Card 
            title="Books Borrowed" 
            value={stats.booksBorrowed} 
            label="Currently Borrowed"
            icon="fas fa-book"
            color="primary"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Books Read" 
            value={stats.booksRead} 
            label="Total Books Read"
            icon="fas fa-book-reader"
            color="success"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Outstanding Fines" 
            value={`₹${stats.fines.toFixed(2)}`} 
            label="Total Due"
            icon="fas fa-money-bill-wave"
            color="warning"
          />
        </div>
        <div className="col-md-3">
          <Card 
            title="Next Return" 
            value={stats.nextReturnDays !== null ? `${stats.nextReturnDays} days` : 'N/A'} 
            label="Days Until Next Return"
            icon="fas fa-calendar-day"
            color="info"
          />
        </div>
      </div>

      {/* Quick Actions */}
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
              <Link to="/book-search" className="btn btn-outline-primary w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-search fa-2x mb-2"></i>
                <span>Search Books</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/borrowed-books" className="btn btn-outline-success w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-book fa-2x mb-2"></i>
                <span>Borrowed Books</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/borrowing-history" className="btn btn-outline-info w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-history fa-2x mb-2"></i>
                <span>Borrowing History</span>
              </Link>
            </div>
            <div className="col-md-3 col-6">
              <Link to="/outstanding-fines" className="btn btn-outline-warning w-100 h-100 p-3 d-flex flex-column align-items-center">
                <i className="fas fa-money-bill-wave fa-2x mb-2"></i>
                <span>Outstanding Fines</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboard