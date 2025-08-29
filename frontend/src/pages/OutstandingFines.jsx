import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function OutstandingFines() {
  const [fines, setFines] = useState([])
  const [error, setError] = useState('')
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
        const response = await fetch('http://localhost:5000/api/outstanding-fines', {
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
        setError('An error occurred')
      }
    }
    fetchFines()
  }, [navigate])

  const handlePay = async (fineId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/pay-fine/${fineId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        alert('Fine paid successfully')
        setFines(fines.filter(fine => fine.id !== fineId))
      } else {
        setError(data.error || 'Payment failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('An error occurred')
    }
  }

  const headers = ['Book ID', 'Title', 'Due Date', 'Fine Amount', 'Action']
  const rows = fines.map(fine => [
    fine.book_id,
    fine.title,
    new Date(fine.due_date).toLocaleDateString(),
    `₹${fine.amount.toFixed(2)}`,
    <button className="btn btn-sm btn-dark" onClick={() => handlePay(fine.id)}>Pay Now</button>
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Outstanding Fines</h1>
      <p>View and pay any outstanding fines</p>
      {error && <Alert type="danger" message={error} />}
      {fines.length === 0 && !error && (
        <Alert type="info" message="No outstanding fines." />
      )}
      {fines.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default OutstandingFines