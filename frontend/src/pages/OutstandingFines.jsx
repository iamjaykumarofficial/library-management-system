import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function OutstandingFines() {
  const [fines, setFines] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFines = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view outstanding fines')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('/api/outstanding-fines', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setFines(data)
        } else {
          setError(data.error || 'Failed to load fines')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchFines()
  }, [navigate])

  // In the handlePay function, replace the current implementation with:
const handlePay = async (fineId, amount, description) => {
  // Navigate to payment page with fine details
  navigate('/payment', {
    state: {
      payment: {
        amount: amount,
        description: description,
        type: 'fine'
      }
    }
  })
}

// Update the rows mapping to pass fine details:
const rows = fines.map(fine => [
  fine.book_id,
  fine.title,
  new Date(fine.due_date).toLocaleDateString(),
  `₹${fine.amount.toFixed(2)}`,
  <button 
    className="btn btn-success btn-sm" 
    onClick={() => handlePay(fine.id, fine.amount, `Fine for ${fine.title}`)}
  >
    <i className="fas fa-credit-card me-1"></i>
    Pay Now
  </button>
])

  const headers = ['Book ID', 'Title', 'Due Date', 'Fine Amount', 'Action']
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading outstanding fines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Outstanding Fines</h1>
      <p className="lead text-muted mb-4">View and pay any outstanding fines</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {fines.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-money-bill-wave me-2 text-warning"></i>
              Outstanding Fines ({fines.length})
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      ) : (
        <Alert type="success" message="No outstanding fines. Great job!" />
      )}
    </div>
  )
}

export default OutstandingFines