import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function BorrowedBooks() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view borrowed books')
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        const response = await fetch('/api/borrowed-books', {
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
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [navigate])

  const handleReturn = async (borrowingId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/return/${borrowingId}`, {
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
      setError('Network error. Please try again.')
    }
  }

  const headers = ['Book ID', 'Title', 'Borrow Date', 'Due Date', 'Action']
  const rows = books.map(book => [
    book.book_id,
    book.title,
    new Date(book.borrow_date).toLocaleDateString(),
    new Date(book.due_date).toLocaleDateString(),
    <button 
      className="btn btn-primary btn-sm" 
      onClick={() => handleReturn(book.borrowing_id)}
    >
      Return Book
    </button>
  ])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading borrowed books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Borrowed Books</h1>
      <p className="lead text-muted mb-4">Manage your currently borrowed books</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {books.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-book me-2 text-warning"></i>
              Currently Borrowed ({books.length})
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      ) : (
        <Alert type="info" message="You have no borrowed books." />
      )}
    </div>
  )
}

export default BorrowedBooks