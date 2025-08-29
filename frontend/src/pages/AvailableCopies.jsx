import { useState, useEffect } from 'react'
import Table from '../components/Table'

function AvailableCopies() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/available-copies')
        const data = await response.json()
        if (response.ok) {
          setBooks(data)
        } else {
          setError(data.error || 'Failed to load books')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred')
      }
    }
    fetchBooks()
  }, [])

  const headers = ['Book ID', 'Title', 'Author', 'Total Copies', 'Available Copies']
  const rows = books.map(book => [book.book_id, book.title, book.author, book.total_copies, book.available_copies])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Available Copies</h1>
      <p>View the availability status of books in our collection</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {books.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default AvailableCopies