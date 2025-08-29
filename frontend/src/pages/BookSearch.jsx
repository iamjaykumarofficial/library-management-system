import { useState } from 'react'
import Table from '../components/Table'

function BookSearch() {
  const [search, setSearch] = useState('')
  const [books, setBooks] = useState([])
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`http://localhost:5000/api/books/search?query=${search}`)
      const data = await response.json()
      if (response.ok) {
        setBooks(data)
        setError('')
      } else {
        setError(data.error || 'Search failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('An error occurred')
    }
  }

  const headers = ['Book ID', 'Title', 'Author', 'Genre', 'Availability']
  const rows = books.map(book => [
    book.book_id,
    <Link to={`/book-details/${book.book_id}`}>{book.title}</Link>,
    book.author,
    book.genre,
    book.available_copies > 0 ? 'Available' : 'Borrowed'
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Search Books</h1>
      <p>Find books by title, author, or ISBN</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter book title, author, or ISBN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-dark">Search</button>
        </div>
      </form>
      {books.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default BookSearch