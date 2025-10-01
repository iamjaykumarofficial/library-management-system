import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view payment history')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('/api/payment-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setPayments(data)
        } else {
          setError(data.error || 'Failed to load payment history')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [navigate])

  const headers = ['Payment ID', 'Date', 'Amount', 'Description']
  const rows = payments.map(payment => [
    payment.payment_id,
    new Date(payment.payment_date).toLocaleDateString(),
    `₹${payment.amount.toFixed(2)}`,
    payment.description
  ])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading payment history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Payment History</h1>
      <p className="lead text-muted mb-4">View your payment history</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {payments.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-receipt me-2 text-success"></i>
              Payment History ({payments.length} payments)
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      ) : (
        <Alert type="info" message="No payment history available." />
      )}
    </div>
  )
}

export default PaymentHistory