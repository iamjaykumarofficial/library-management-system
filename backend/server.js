import express from 'express'
import mysql from 'mysql2/promise'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Authentication middleware
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

// Email transporter (for production)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.getConnection()
    res.json({ status: 'OK', message: 'Server and database are running' })
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' })
  }
})

// Database fix endpoint
app.post('/api/fix-database', async (req, res) => {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(255) DEFAULT ""')
    res.json({ message: 'Database fixed successfully' })
  } catch (err) {
    console.error('Database fix error:', err)
    res.status(500).json({ error: 'Failed to fix database' })
  }
})

// Register
app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, password, confirmPassword, role } = req.body
  if (!fullName || !email || !password || !confirmPassword || !role) {
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
    res.status(201).json({ message: 'User registered successfully' })
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

// Get Profile - IMPROVED VERSION
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id)
    
    const [users] = await pool.query(
      `SELECT id, full_name, email, phone, COALESCE(address, '') as address, role, membership_expiry 
       FROM users WHERE id = ?`,
      [req.user.id]
    )
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const user = users[0]
    console.log('Profile data:', user)
    
    res.json({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role
    })
  } catch (err) {
    console.error('Profile fetch error:', err)
    
    // Check if it's a missing column error
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Database configuration error. Please contact administrator.' 
      })
    }
    
    res.status(500).json({ error: 'Failed to load profile' })
  }
})

// Update Profile - FIXED VERSION
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    // Accept both field naming conventions from frontend
    const full_name = req.body.full_name || req.body.fullName
    const email = req.body.email
    const phone = req.body.phone
    const address = req.body.address
    
    console.log('Updating profile for user:', req.user.id)
    console.log('Update data:', { full_name, email, phone, address })

    // Validate required fields
    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' })
    }

    // Check if email is already taken by another user
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    )
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    // Update user profile with error handling for missing columns
    try {
      await pool.query(
        'UPDATE users SET full_name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
        [full_name, email, phone || '', address || '', req.user.id]
      )
    } catch (dbError) {
      console.error('Database update error:', dbError)
      
      // If address column doesn't exist, update without address
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        await pool.query(
          'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
          [full_name, email, phone || '', req.user.id]
        )
        console.log('Updated profile without address column')
      } else {
        throw dbError
      }
    }

    // Get updated user data
    const [updatedUsers] = await pool.query(
      `SELECT id, full_name, email, phone, COALESCE(address, '') as address, role 
       FROM users WHERE id = ?`,
      [req.user.id]
    )

    if (updatedUsers.length === 0) {
      return res.status(404).json({ error: 'User not found after update' })
    }

    const updatedUser = updatedUsers[0]
    
    console.log('Profile updated successfully:', updatedUser)
    
    res.json({
      message: 'Profile updated successfully',
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      address: updatedUser.address || '',
      role: updatedUser.role
    })

  } catch (err) {
    console.error('Profile update error:', err)
    
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      res.status(500).json({ 
        error: 'Database configuration issue. Please contact administrator.' 
      })
    } else {
      res.status(500).json({ error: 'Failed to update profile. Please try again.' })
    }
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
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id])
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    const isMatch = await bcrypt.compare(currentPassword, users[0].password)
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

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (users.length === 0) {
      return res.status(400).json({ error: 'Email not found' })
    }
    // Implement email service (e.g., Nodemailer) to send reset link
    res.json({ message: 'Reset instructions sent to your email' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Failed to send reset instructions' })
  }
})

// Add Book
app.post('/api/books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  const { book_id, title, author, subject, isbn, publication_year, total_copies } = req.body
  if (!book_id || !title || !author || !subject || !isbn || !publication_year || !total_copies) {
    return res.status(400).json({ error: 'All fields are required' })
  }
  try {
    const [existingBooks] = await pool.query('SELECT * FROM books WHERE isbn = ? OR book_id = ?', [isbn, book_id])
    if (existingBooks.length > 0) {
      return res.status(400).json({ error: 'Book ID or ISBN already exists' })
    }
    await pool.query(
      'INSERT INTO books (book_id, title, author, subject, isbn, publication_year, total_copies, available_copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [book_id, title, author, subject, isbn, publication_year, total_copies, total_copies]
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
      'SELECT book_id, title, author, subject, isbn, publication_year, available_copies FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?',
      [`%${query}%`, `%${query}%`, `%${query}%`]
    )
    res.json(books)
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: 'Failed to search books' })
  }
})

// Book Details
app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [books] = await pool.query(
      'SELECT book_id, title, author, subject, isbn, publication_year, available_copies FROM books WHERE book_id = ?',
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

// Owner Dashboard
app.get('/api/owner-dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [revenue] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS revenue FROM payments WHERE MONTH(payment_date) = MONTH(CURRENT_DATE()) AND YEAR(payment_date) = YEAR(CURRENT_DATE())'
    )
    const [activeMembers] = await pool.query(
      'SELECT COUNT(*) AS activeMembers FROM users WHERE role = "member" AND (membership_expiry >= CURRENT_DATE() OR membership_expiry IS NULL)'
    )
    const [booksInCirculation] = await pool.query(
      'SELECT COUNT(*) AS booksInCirculation FROM borrowings WHERE return_date IS NULL'
    )
    const [outstandingFines] = await pool.query(
      'SELECT COALESCE(SUM(fine), 0) AS outstandingFines FROM borrowings WHERE fine > 0'
    )
    res.json({
      revenue: Number(revenue[0].revenue) || 0,
      activeMembers: Number(activeMembers[0].activeMembers) || 0,
      booksInCirculation: Number(booksInCirculation[0].booksInCirculation) || 0,
      outstandingFines: Number(outstandingFines[0].outstandingFines) || 0
    })
  } catch (err) {
    console.error('Owner dashboard error:', err)
    res.status(500).json({ error: 'Failed to load dashboard data' })
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
      '"Total Members" AS metric, COUNT(*) AS value FROM users WHERE role = "member" UNION ' +
      'SELECT "Active Members" AS metric, COUNT(*) AS value FROM users WHERE role = "member" AND (membership_expiry >= CURRENT_DATE() OR membership_expiry IS NULL) UNION ' +
      'SELECT "Expired Memberships" AS metric, COUNT(*) AS value FROM users WHERE role = "member" AND membership_expiry < CURRENT_DATE()'
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
      'SELECT subject, ' +
      'COUNT(*) AS total, ' +
      'SUM(available_copies) AS available, ' +
      'SUM(total_copies - available_copies) AS borrowed ' +
      'FROM books GROUP BY subject'
    )
    res.json(rows)
  } catch (err) {
    console.error('Subject-wise inventory error:', err)
    res.status(500).json({ error: 'Failed to load inventory' })
  }
})

// Collection Reports
app.get('/api/collection-reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT subject AS genre, ' +
      'COUNT(*) AS total, ' +
      'SUM(available_copies) AS available, ' +
      'SUM(total_copies - available_copies) AS borrowed ' +
      'FROM books GROUP BY subject'
    )
    res.json(rows)
  } catch (err) {
    console.error('Collection reports error:', err)
    res.status(500).json({ error: 'Failed to load collection reports' })
  }
})

// Book-Wise Copies
app.get('/api/book-wise-copies', authenticateToken, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT book_id, title, total_copies, available_copies FROM books'
    )
    res.json(rows)
  } catch (err) {
    console.error('Book-wise copies error:', err)
    res.status(500).json({ error: 'Failed to load book copies' })
  }
})

// Available Copies
app.get('/api/available-copies', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT book_id, title, author, total_copies, available_copies FROM books WHERE available_copies > 0'
    )
    res.json(rows)
  } catch (err) {
    console.error('Available copies error:', err)
    res.status(500).json({ error: 'Failed to load available copies' })
  }
})

// Borrowed Books
app.get('/api/borrowed-books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      `SELECT b.id AS borrowing_id, b.book_id, bk.title, b.borrow_date, b.due_date 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.book_id 
       WHERE b.user_id = ? AND b.return_date IS NULL 
       ORDER BY b.due_date ASC`,
      [req.user.id]
    )
    console.log(`Borrowed books for user ${req.user.id}:`, rows)
    res.json(rows)
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
    const [rows] = await pool.query(
      `SELECT b.book_id, bk.title, b.borrow_date, b.return_date, COALESCE(b.fine, 0) AS fine_amount 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.book_id 
       WHERE b.user_id = ? 
       ORDER BY b.borrow_date DESC`,
      [req.user.id]
    )
    console.log(`Borrowing history for user ${req.user.id}:`, rows)
    res.json(rows)
  } catch (err) {
    console.error('Borrowing history error:', err)
    res.status(500).json({ error: 'Failed to load borrowing history' })
  }
})

// Outstanding Fines
app.get('/api/outstanding-fines', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.book_id, bk.title, b.due_date, COALESCE(b.fine, 0) AS amount 
       FROM borrowings b 
       JOIN books bk ON b.book_id = bk.book_id 
       WHERE b.user_id = ? AND b.fine > 0 AND b.return_date IS NULL`,
      [req.user.id]
    )
    console.log(`Outstanding fines for user ${req.user.id}:`, rows)
    res.json(rows)
  } catch (err) {
    console.error('Outstanding fines error:', err)
    res.status(500).json({ error: 'Failed to load fines' })
  }
})

// Payment History
app.get('/api/payment-history', authenticateToken, async (req, res) => {
  if (req.user.role !== 'member') {
    return res.status(403).json({ error: 'Access denied' })
  }
  try {
    const [rows] = await pool.query(
      'SELECT payment_id, amount, description, payment_date FROM payments WHERE user_id = ? ORDER BY payment_date DESC',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Payment history error:', err)
    res.status(500).json({ error: 'Failed to load payment history' })
  }
})

// Payment Methods
app.get('/api/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        icon: 'fa-credit-card',
        description: 'Pay with Visa, MasterCard, or American Express'
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        icon: 'fa-credit-card',
        description: 'Pay with your debit card'
      },
      {
        id: 'upi',
        name: 'UPI',
        icon: 'fa-mobile-alt',
        description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm'
      },
      {
        id: 'net_banking',
        name: 'Net Banking',
        icon: 'fa-university',
        description: 'Transfer directly from your bank account'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'fa-paypal',
        description: 'Pay using your PayPal account'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'fa-exchange-alt',
        description: 'Manual bank transfer'
      }
    ]
    
    res.json(paymentMethods)
  } catch (err) {
    console.error('Payment methods error:', err)
    res.status(500).json({ error: 'Failed to load payment methods' })
  }
})

// Process Payment
app.post('/api/process-payment', authenticateToken, async (req, res) => {
  const { amount, description, paymentMethod, email } = req.body
  
  if (!amount || !description || !paymentMethod) {
    return res.status(400).json({ error: 'Amount, description, and payment method are required' })
  }

  try {
    // Generate unique payment ID
    const payment_id = `PAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
    
    // Insert payment record
    await pool.query(
      'INSERT INTO payments (user_id, payment_id, amount, description, payment_method, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, payment_id, amount, description, paymentMethod, new Date(), 'completed']
    )

    // Update fines if this is a fine payment
    if (description.includes('fine') || description.includes('Fine')) {
      await pool.query(
        'UPDATE borrowings SET fine = 0 WHERE user_id = ? AND fine > 0',
        [req.user.id]
      )
    }

    // Send payment confirmation email (simulated)
    console.log('SENDING PAYMENT CONFIRMATION EMAIL:')
    console.log('To:', email || req.user.email)
    console.log('Payment ID:', payment_id)
    console.log('Amount:', amount)
    console.log('Description:', description)

    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      payment_id,
      amount 
    })
    
  } catch (err) {
    console.error('Payment processing error:', err)
    res.status(500).json({ error: 'Payment processing failed' })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  
  // Test database connection and table structure
  pool.getConnection()
    .then((connection) => {
      console.log('Connected to MySQL database')
      
      // Check if address column exists
      return connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'address'
      `, [process.env.DB_NAME])
      .then(([rows]) => {
        if (rows.length === 0) {
          console.log('⚠️  Address column not found in users table. Some features may not work properly.')
          console.log('💡 Visit http://localhost:5000/api/fix-database to automatically add the address column')
        } else {
          console.log('✅ Address column exists in users table')
        }
        connection.release()
      })
    })
    .catch(err => {
      console.error('Database connection error:', err)
    })
})

export default app