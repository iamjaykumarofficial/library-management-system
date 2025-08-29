import { useState, useEffect } from 'react'
import Table from '../components/Table'
import Alert from '../components/Alert'

function BookWiseCopies() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/book-wise-copies', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setBooks(data)
        } else {
          setError(data.error || 'Failed to load book copies')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchBooks()
  }, [])

  const headers = ['Book ID', 'Title', 'Total Copies', 'Available Copies']
  const rows = books.map(book => [
    book.book_id,
    book.title,
    book.total_copies,
    book.available_copies
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Book-Wise Copies</h1>
      <p>View copy details for each book</p>
      {error && <Alert type="danger" message={error} />}
      <Table headers={headers} rows={rows} />
    </div>
  )
}

export default BookWiseCopies