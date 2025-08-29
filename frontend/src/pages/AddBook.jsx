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
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in as an owner to add a book')
        setTimeout(() => navigate('/login'), 2000)
        return
      }
      const response = await fetch('http://localhost:5000/api/books', {
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
      setError('An error occurred while adding the book')
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Add Book</h1>
      <p>Add a new book to the library</p>
      {error && <Alert type="danger" message={error} />}
      {success && <Alert type="success" message={success} />}
      <div className="card shadow">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="book_id" className="form-label">Book ID</label>
              <input
                type="text"
                className="form-control"
                id="book_id"
                name="book_id"
                value={formData.book_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="author" className="form-label">Author</label>
              <input
                type="text"
                className="form-control"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Subject</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="isbn" className="form-label">ISBN</label>
              <input
                type="text"
                className="form-control"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="publication_year" className="form-label">Publication Year</label>
              <input
                type="number"
                className="form-control"
                id="publication_year"
                name="publication_year"
                value={formData.publication_year}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="total_copies" className="form-label">Total Copies</label>
              <input
                type="number"
                className="form-control"
                id="total_copies"
                name="total_copies"
                value={formData.total_copies}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-dark">Add Book</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddBook