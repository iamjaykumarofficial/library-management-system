import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function BorrowingHistory() {
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view borrowing history')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('/api/borrowing-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setHistory(data)
        } else {
          setError(data.error || 'Failed to load history')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [navigate])

  const headers = ['Book ID', 'Title', 'Borrow Date', 'Return Date', 'Fine']
  const rows = history.map(item => [
    item.book_id,
    item.title,
    new Date(item.borrow_date).toLocaleDateString(),
    item.return_date ? new Date(item.return_date).toLocaleDateString() : 'Not Returned',
    `₹${item.fine_amount || 0}`
  ])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading borrowing history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Borrowing History</h1>
      <p className="lead text-muted mb-4">View your complete borrowing history</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {history.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-history me-2 text-info"></i>
              Borrowing History ({history.length} records)
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      ) : (
        <Alert type="info" message="No borrowing history available." />
      )}
    </div>
  )
}

export default BorrowingHistory