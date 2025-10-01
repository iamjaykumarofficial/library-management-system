import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'

function AddBook() {
  const [formData, setFormData] = useState({
    book_id: '',
    title: '',
    author: '',
    subject: '',
    isbn: '',
    publication_year: '',
    total_copies: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in as an owner to add a book')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          publication_year: parseInt(formData.publication_year),
          total_copies: parseInt(formData.total_copies)
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Book added successfully')
        setFormData({
          book_id: '',
          title: '',
          author: '',
          subject: '',
          isbn: '',
          publication_year: '',
          total_copies: ''
        })
      } else {
        setError(data.error || 'Failed to add book')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Add Book</h1>
      <p className="lead text-muted mb-4">Add a new book to the library collection</p>
      
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}
      
      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="book_id" className="form-label">Book ID *</label>
                <input
                  type="text"
                  className="form-control"
                  id="book_id"
                  name="book_id"
                  value={formData.book_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter unique book ID"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="title" className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter book title"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="author" className="form-label">Author *</label>
                <input
                  type="text"
                  className="form-control"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter author name"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="subject" className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter subject/category"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="isbn" className="form-label">ISBN *</label>
                <input
                  type="text"
                  className="form-control"
                  id="isbn"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter ISBN number"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="publication_year" className="form-label">Publication Year *</label>
                <input
                  type="number"
                  className="form-control"
                  id="publication_year"
                  name="publication_year"
                  value={formData.publication_year}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter publication year"
                  min="1000"
                  max="2025"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="total_copies" className="form-label">Total Copies *</label>
              <input
                type="number"
                className="form-control"
                id="total_copies"
                name="total_copies"
                value={formData.total_copies}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter number of copies"
                min="1"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding Book...
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle me-2"></i>
                  Add Book
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBook