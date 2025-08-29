import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view your payment history')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/payment-history', {
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
        setError('An error occurred. Please try again.')
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

  return (
    <div className="container py-5">
      <h1 className="mb-4">Payment History</h1>
      <p>View your payment history</p>
      {error && <Alert type="danger" message={error} />}
      {payments.length === 0 && !error && (
        <Alert type="info" message="No payment history available." />
      )}
      {payments.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default PaymentHistory