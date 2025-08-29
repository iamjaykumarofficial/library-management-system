import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function BookDetails() {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${id}`)
        const data = await response.json()
        if (response.ok) {
          setBook(data)
        } else {
          setError(data.error || 'Book not found')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred')
      }
    }
    fetchBook()
  }, [id])

  const handleBorrow = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: id })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Book borrowed successfully')
        setBook({ ...book, available_copies: book.available_copies - 1 })
      } else {
        setError(data.error || 'Borrow failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('An error occurred')
    }
  }

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>
  if (!book) return <div className="container py-5">Loading...</div>

  return (
    <div className="container py-5">
      <h1 className="mb-4">Book Details</h1>
      <div className="card shadow">
        <div className="card-body">
          <h2>{book.title}</h2>
          <p><strong>Author:</strong> {book.author}</p>
          <p><strong>Genre:</strong> {book.genre}</p>
          <p><strong>ISBN:</strong> {book.isbn}</p>
          <p><strong>Publication Year:</strong> {book.publication_year}</p>
          <p><strong>Availability:</strong> {book.available_copies > 0 ? `Available (${book.available_copies} copies)` : 'Not Available'}</p>
          {book.available_copies > 0 && <button className="btn btn-dark" onClick={handleBorrow}>Borrow Book</button>}
        </div>
      </div>
    </div>
  )
}

export default BookDetails