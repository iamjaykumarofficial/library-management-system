import { useState } from 'react'
import { Link } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function BookSearch() {
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!search.trim()) {
      setError('Please enter a search query')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/books/search?query=${encodeURIComponent(search)}`)
      const data = await response.json()
      
      if (response.ok) {
        setBooks(data)
        if (data.length === 0) {
          setError('No books found matching your search')
        }
      } else {
        setError(data.error || 'Search failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const headers = ['Book ID', 'Title', 'Author', 'Subject', 'Available Copies', 'Action']
  const rows = books.map(book => [
    book.book_id,
    book.title,
    book.author,
    book.subject,
    book.available_copies,
    <Link to={`/book-details/${book.book_id}`} className="btn btn-primary btn-sm">
      View Details
    </Link>
  ])

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Search Books</h1>
      <p className="lead text-muted mb-4">Find books by title, author, or ISBN</p>
      
      {error && <Alert type={books.length === 0 ? 'warning' : 'danger'} message={error} />}
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="input-group input-group-lg">
          <input
            type="text"
            className="form-control"
            placeholder="Enter book title, author, or ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Searching...
              </>
            ) : (
              <>
                <i className="fas fa-search me-2"></i>
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {books.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-search me-2 text-primary"></i>
              Search Results ({books.length} books found)
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      )}
    </div>
  )
}

export default BookSearch