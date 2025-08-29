import { useState, useEffect } from 'react'
import Table from '../components/Table'

function BorrowedBooks() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5000/api/borrowed-books', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setBooks(data)
        } else {
          setError(data.error || 'Failed to load borrowed books')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred')
      }
    }
    fetchBooks()
  }, [])

  const handleReturn = async (borrowingId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/return/${borrowingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        alert('Book returned successfully')
        setBooks(books.filter(book => book.borrowing_id !== borrowingId))
      } else {
        setError(data.error || 'Return failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('An error occurred')
    }
  }

  const headers = ['Book ID', 'Title', 'Borrow Date', 'Due Date', 'Action']
  const rows = books.map(book => [
    book.book_id,
    book.title,
    book.borrow_date,
    book.due_date,
    <button className="btn btn-sm btn-dark" onClick={() => handleReturn(book.borrowing_id)}>Return</button>
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Borrowed Books</h1>
      <p>Manage your currently borrowed books</p>
      {error && <div className="alert alert-danger">{error}</div>}
      {books.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default BorrowedBooks