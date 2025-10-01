import { useState, useEffect } from 'react'
import Table from '../components/Table'
import Alert from '../components/Alert'

function AvailableCopies() {
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/available-copies')
        const data = await response.json()
        
        if (response.ok) {
          setBooks(data)
        } else {
          setError(data.error || 'Failed to load books')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const headers = ['Book ID', 'Title', 'Author', 'Total Copies', 'Available Copies']
  const rows = books.map(book => [book.book_id, book.title, book.author, book.total_copies, book.available_copies])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading available books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Available Copies</h1>
      <p className="lead text-muted mb-4">View the availability status of books in our collection</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {books.length > 0 ? (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-book me-2 text-success"></i>
              Available Books ({books.length})
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      ) : (
        <Alert type="info" message="No available books found." />
      )}
    </div>
  )
}

export default AvailableCopies