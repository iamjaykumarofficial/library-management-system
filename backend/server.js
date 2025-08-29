const express = require('express')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(express.json())
app.use(cors())

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Access token required' })
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Register
app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, role } = req.body
  if (!fullName || !email || !phone || !password || !confirmPassword || !role) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' })
  }
  try {
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (full_name, email, phone, password, role, membership_expiry) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, phone, hashedPassword, role, role === 'member' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null]
    )
    res.status(201).json({ message: 'User registered successfully', role })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const user = users[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
    res.json({ token, role: user.role })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Forgot Password (Placeholder)
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    // TODO: Implement email sending logic here
    res.json({ message: 'Reset instructions sent to your email' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to send reset instructions' })
  }
})

// Change Password
app.put('/api/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New passwords do not match' })
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    const user = users[0]
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id])
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, full_name, email, phone, address, role, membership_expiry FROM users WHERE id = ?', [req.user.id])
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(users[0])
  } catch (err) {
    console.error('Profile error:', err)
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

app.put('/api/profile', authenticateToken, async (req, res) => {
  const { fullName, email, phone, address } = req.body
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required' })
  }
  try {
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, req.user.id])
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [fullName, email, phone, address, req.user.id]
    )
    res.json({ message: 'Profile updated successfully' })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Add Book
app.post('/api/books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  const { book_id, title, author, genre, isbn, publication_year, total_copies } = req.body
  if (!book_id || !title || !author || !genre || !isbn || !publication_year || !total_copies) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  try {
    const [existingBooks] = await pool.query('SELECT * FROM books WHERE isbn = ? OR book_id = ?', [isbn, book_id])
    if (existingBooks.length > 0) {
      return res.status(400).json({ error: 'Book ID or ISBN already exists' })
    }
    await pool.query(
      'INSERT INTO books (book_id, title, author, genre, isbn, publication_year, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [book_id, title, author, genre, isbn, publication_year, total_copies, total_copies]
    )
    res.status(201).json({ message: 'Book added successfully' })
  } catch (err) {
    console.error('Add book error:', err)
    res.status(500).json({ error: 'Failed to add book' })
  }
})

// Book Search
app.get('/api/books/search', async (req, res) => {
  const { query } = req.query
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' })
  }
  try {
    const [books] = await pool.query(
      'SELECT book_id, title, author, genre, available_copies FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    )
    res.json(books)
  } catch (err) {
    console.error('Book search error:', err)
    res.status(500).json({ error: 'Failed to search books' })
  }
})

// Book Details
app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [books] = await pool.query(
      'SELECT book_id, title, author, genre, isbn, publication_year, total_copies, available_copies FROM books WHERE book_id = ?',
      [id]
    )
    if (books.length === 0) {
      return res.status(404).json({ error: 'Book not found' })
    }
    res.json(books[0])
  } catch (err) {
    console.error('Book details error:', err)
    res.status(500).json({ error: 'Failed to load book details' })
  }
})

// Borrow Book
app.post('/api/borrow', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  const { book_id } = req.body
  if (!book_id) {
    return res.status(400).json({ error: 'Book ID is required' })
  }
  try {
    const [books] = await pool.query('SELECT * FROM books WHERE book_id = ? AND available_copies > 0', [book_id])
    if (books.length === 0) {
      return res.status(400).json({ error: 'Book not available' })
    }
    const [existingBorrowings] = await pool.query('SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND return_date IS NULL', [req.user.id, book_id])
    if (existingBorrowings.length > 0) {
      return res.status(400).json({ error: 'You have already borrowed this book' })
    }
    const due_date = new Date()
    due_date.setDate(due_date.getDate() + 14)
    await pool.query(
      'INSERT INTO borrowings (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)',
      [req.user.id, book_id, new Date(), due_date]
    )
    await pool.query('UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?', [book_id])
    res.json({ message: 'Book borrowed successfully', due_date })
  } catch (err) {
    console.error('Borrow error:', err)
    res.status(500).json({ error: 'Failed to borrow book' })
  }
})

// Return Book
app.post('/api/return/:borrowingId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  const { borrowingId } = req.params
  try {
    const [borrowings] = await pool.query('SELECT * FROM borrowings WHERE id = ? AND user_id = ? AND return_date IS NULL', [borrowingId, req.user.id])
    if (borrowings.length === 0) {
      return res.status(400).json({ error: 'No active borrowing found' })
    }
    const borrowing = borrowings[0]
    const return_date = new Date()
    const due_date = new Date(borrowing.due_date)
    let fine = 0
    if (return_date > due_date) {
      const daysLate = Math.ceil((return_date - due_date) / (1000 * 60 * 60 * 24))
      fine = daysLate * 50
    }
    await pool.query('UPDATE borrowings SET return_date = ?, fine = ? WHERE id = ?', [return_date, fine, borrowingId])
    await pool.query('UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?', [borrowing.book_id])
    res.json({ message: 'Book returned successfully', fine })
  } catch (err) {
    console.error('Return error:', err)
    res.status(500).json({ error: 'Failed to return book' })
  }
})

// Pay Fine
app.post('/api/pay-fine/:fineId', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  const { fineId } = req.params
  try {
    const [borrowings] = await pool.query('SELECT * FROM borrowings WHERE id = ? AND user_id = ? AND fine > 0', [fineId, req.user.id])
    if (borrowings.length === 0) {
      return res.status(400).json({ error: 'No fine found' })
    }
    const fine = borrowings[0].fine
    const payment_id = `P${Date.now()}`
    await pool.query(
      'INSERT INTO payments (user_id, payment_id, amount, description, payment_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, payment_id, fine, `Late fine for borrowing ${fineId}`, new Date()]
    )
    await pool.query('UPDATE borrowings SET fine = 0 WHERE id = ?', [fineId])
    res.json({ message: 'Fine paid successfully' })
  } catch (err) {
    console.error('Pay fine error:', err)
    res.status(500).json({ error: 'Failed to pay fine' })
  }
})

// Outstanding Fines
app.get('/api/outstanding-fines', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [fines] = await pool.query(
      'SELECT b.id, b.book_id, b.title, b.due_date, b.fine AS amount ' +
      'FROM borrowings b WHERE b.user_id = ? AND b.fine > 0',
      [req.user.id]
    )
    res.json(fines)
  } catch (err) {
    console.error('Outstanding fines error:', err)
    res.status(500).json({ error: 'Failed to load fines' })
  }
})

// Borrowed Books
app.get('/api/borrowed-books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [books] = await pool.query(
      'SELECT b.id AS borrowing_id, b.book_id, bk.title, b.borrow_date, b.due_date ' +
      'FROM borrowings b JOIN books bk ON b.book_id = bk.book_id ' +
      'WHERE b.user_id = ? AND b.return_date IS NULL',
      [req.user.id]
    )
    res.json(books)
  } catch (err) {
    console.error('Borrowed books error:', err)
    res.status(500).json({ error: 'Failed to load borrowed books' })
  }
})

// Borrowing History
app.get('/api/borrowing-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [history] = await pool.query(
      'SELECT b.book_id, bk.title, b.borrow_date, b.return_date, b.fine AS fine_amount ' +
      'FROM borrowings b JOIN books bk ON b.book_id = bk.book_id ' +
      'WHERE b.user_id = ?',
      [req.user.id]
    )
    res.json(history)
  } catch (err) {
    console.error('Borrowing history error:', err)
    res.status(500).json({ error: 'Failed to load borrowing history' })
  }
})

// Book-Wise Copies
app.get('/api/book-wise-copies', async (req, res) => {
  try {
    const [books] = await pool.query(
      'SELECT book_id, title, total_copies, available_copies FROM books'
    )
    res.json(books)
  } catch (err) {
    console.error('Book-wise copies error:', err)
    res.status(500).json({ error: 'Failed to load book copies' })
  }
})

// Available Copies
app.get('/api/available-copies', async (req, res) => {
  try {
    const [books] = await pool.query(
      'SELECT book_id, title, author, total_copies, available_copies FROM books WHERE available_copies > 0'
    )
    res.json(books)
  } catch (err) {
    console.error('Available copies error:', err)
    res.status(500).json({ error: 'Failed to load available copies' })
  }
})

// Asset Reports
app.get('/api/asset-reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT "Books" AS asset_type, COUNT(*) AS quantity, SUM(total_copies * 500) AS total_value, "Good" AS asset_condition FROM books'
    )
    res.json(rows)
  } catch (err) {
    console.error('Asset reports error:', err)
    res.status(500).json({ error: `Failed to load asset reports: ${err.message}` })
  }
})

// Financial Reports
app.get('/api/financial-reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT CONCAT(MONTHNAME(payment_date), " ", YEAR(payment_date)) AS month, ' +
      'SUM(amount) AS revenue, ' +
      'SUM(CASE WHEN description LIKE "Late fine%" THEN amount ELSE 0 END) AS fines, ' +
      'SUM(CASE WHEN description LIKE "Membership fee%" THEN amount ELSE 0 END) AS membership ' +
      'FROM payments ' +
      'GROUP BY CONCAT(MONTHNAME(payment_date), " ", YEAR(payment_date)), MONTH(payment_date), YEAR(payment_date) ' +
      'ORDER BY YEAR(payment_date) DESC, MONTH(payment_date) DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error('Financial reports error:', err)
    res.status(500).json({ error: `Failed to load financial reports: ${err.message}` })
  }
})

// Collection Reports
app.get('/api/collection-reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT genre, ' +
      'COUNT(*) AS total, ' +
      'SUM(available_copies) AS available, ' +
      'SUM(total_copies - available_copies) AS borrowed ' +
      'FROM books GROUP BY genre'
    )
    res.json(rows)
  } catch (err) {
    console.error('Collection reports error:', err)
    res.status(500).json({ error: 'Failed to load collection reports' })
  }
})

// User Statistics
app.get('/api/user-statistics', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [stats] = await pool.query(
      'SELECT ' +
      '"Total Members" AS metric, COUNT(*) AS value FROM users WHERE role = "member" ' +
      'UNION ' +
      'SELECT "Active Members" AS metric, COUNT(*) AS value FROM users WHERE role = "member" AND membership_expiry >= CURDATE() ' +
      'UNION ' +
      'SELECT "Expired Memberships" AS metric, COUNT(*) AS value FROM users WHERE role = "member" AND membership_expiry < CURDATE()'
    )
    res.json(stats)
  } catch (err) {
    console.error('User statistics error:', err)
    res.status(500).json({ error: 'Failed to load user statistics' })
  }
})

// Subject-Wise Inventory
app.get('/api/subject-wise-inventory', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT genre AS subject, ' +
      'COUNT(*) AS total, ' +
      'SUM(available_copies) AS available, ' +
      'SUM(total_copies - available_copies) AS borrowed ' +
      'FROM books GROUP BY genre'
    )
    res.json(rows)
  } catch (err) {
    console.error('Subject-wise inventory error:', err)
    res.status(500).json({ error: 'Failed to load inventory' })
  }
})

// Owner Dashboard
app.get('/api/owner-dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [stats] = await pool.query(
      'SELECT ' +
      '(SELECT SUM(amount) FROM payments WHERE YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())) AS revenue, ' +
      '(SELECT COUNT(*) FROM users WHERE role = "member" AND membership_expiry >= CURDATE()) AS activeMembers, ' +
      '(SELECT SUM(total_copies - available_copies) FROM books) AS booksInCirculation, ' +
      '(SELECT SUM(fine) FROM borrowings WHERE fine > 0) AS outstandingFines'
    )
    res.json(stats[0] || { revenue: 0, activeMembers: 0, booksInCirculation: 0, outstandingFines: 0 })
  } catch (err) {
    console.error('Owner dashboard error:', err)
    res.status(500).json({ error: 'Failed to load dashboard data' })
  }
})

app.listen(5000, () => {
  console.log('Server running on port 5000')
  pool.query('SELECT 1')
    .then(() => console.log('Connected to MySQL database'))
    .catch(err => console.error('Database connection error:', err))
})

// Payment History
app.get('/api/payment-history', authenticateToken, async (req, res) => {
  try {
    const [payments] = await pool.query(
      'SELECT payment_id, payment_date, amount, description FROM payments WHERE user_id = ?',
      [req.user.id]
    )
    res.json(payments)
  } catch (err) {
    console.error('Payment history error:', err)
    res.status(500).json({ error: 'Failed to load payment history' })
  }
})