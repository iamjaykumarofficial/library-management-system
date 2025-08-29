import { useState, useEffect } from 'react'
import Table from '../components/Table'

function BorrowingHistory() {
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/borrowing-history', {
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
        setError('An error occurred')
      }
    }
    fetchHistory()
  }, [])

  const headers = ['Book ID', 'Title', 'Borrow Date', 'Return Date', 'Fine']
  const rows = history.map(item => [
    item.book_id,
    item.title,
    item.borrow_date,
    item.return_date || 'Not Returned',
    `₹${item.fine_amount}`
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Borrowing History</h1>
      <p>View your complete borrowing history</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {history.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default BorrowingHistory