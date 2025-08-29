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
        const [borrowedRes, historyRes, finesRes, profileRes] = await Promise.all([
          fetch('http://localhost:5000/api/borrowed-books', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/borrowing-history', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/outstanding-fines', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        const [borrowed, history, fines, profile] = await Promise.all([
          borrowedRes.json(),
          historyRes.json(),
          finesRes.json(),
          profileRes.json()
        ])
        if (!borrowedRes.ok || !historyRes.ok || !finesRes.ok || !profileRes.ok) {
          throw new Error('Failed to load dashboard data')
        }
        setStats({
          booksBorrowed: borrowed.length,
          booksRead: history.length,
          fines: fines.reduce((sum, fine) => sum + fine.amount, 0) || 0,
          nextReturnDays: borrowed.length > 0 ? Math.ceil((new Date(borrowed[0].due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
        })
        setMembershipExpiry(new Date(profile.membership_expiry).toLocaleDateString())
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
      }
    }
    fetchData()
  }, [navigate])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Member Dashboard</h1>
      <p>Your membership is active until <strong>{membershipExpiry || 'N/A'}</strong></p>
      {error && <Alert type="danger" message={error} />}
      <div className="row mt-4">
        <div className="col-md-3">
          <Card title="Books Borrowed" value={stats.booksBorrowed} label="Currently Borrowed" />
        </div>
        <div className="col-md-3">
          <Card title="Books Read" value={stats.booksRead} label="Total Books Read" />
        </div>
        <div className="col-md-3">
          <Card title="Fines" value={`₹${stats.fines.toFixed(2)}`} label="Outstanding Fines" />
        </div>
        <div className="col-md-3">
          <Card title="Next Return" value={stats.nextReturnDays || 'N/A'} label="Days Until Next Return" />
        </div>
      </div>
      <div className="mt-4">
        <h3>Quick Actions</h3>
        <div className="d-flex gap-3">
          <Link to="/book-search" className="btn btn-outline-dark">Search Books</Link>
          <Link to="/borrowed-books" className="btn btn-outline-dark">View Borrowed Books</Link>
          <Link to="/profile" className="btn btn-outline-dark">Manage Profile</Link>
          <Link to="/payment-history" className="btn btn-outline-dark">Payment History</Link>
          <Link to="/outstanding-fines" className="btn btn-outline-dark">Outstanding Fines</Link>
          <Link to="/borrowing-history" className="btn btn-outline-dark">Borrowing History</Link>
        </div>
      </div>
    </div>
  )
}

export default MemberDashboard