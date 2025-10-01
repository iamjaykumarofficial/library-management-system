import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'

function BookDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books/${id}`)
        const data = await response.json()
        
        if (response.ok) {
          setBook(data)
        } else {
          setError(data.error || 'Book not found')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Network error. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [id])

  const handleBorrow = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please log in to borrow books')
      navigate('/login')
      return
    }

    setBorrowing(true)
    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book_id: id })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert('Book borrowed successfully! Due date: ' + new Date(data.due_date).toLocaleDateString())
        setBook({ ...book, available_copies: book.available_copies - 1 })
      } else {
        alert(data.error || 'Borrow failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setBorrowing(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading book details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <Alert type="danger" message={error} />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container py-5">
        <Alert type="warning" message="Book not found" />
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title fw-bold mb-3">{book.title}</h1>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>Subject:</strong> {book.subject}</p>
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Publication Year:</strong> {book.publication_year}</p>
                  <p><strong>Book ID:</strong> {book.book_id}</p>
                  <p>
                    <strong>Availability:</strong> 
                    <span className={`badge ms-2 ${book.available_copies > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {book.available_copies > 0 ? `Available (${book.available_copies} copies)` : 'Not Available'}
                    </span>
                  </p>
                </div>
              </div>

              {book.available_copies > 0 && (
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleBorrow}
                  disabled={borrowing}
                >
                  {borrowing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Borrowing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-book me-2"></i>
                      Borrow This Book
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Book Information
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <i className="fas fa-book-open display-1 text-primary"></i>
              </div>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary">
                  <i className="fas fa-search me-2"></i>
                  Similar Books
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="fas fa-heart me-2"></i>
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetails