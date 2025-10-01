import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import MemberDashboard from './pages/MemberDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import BookSearch from './pages/BookSearch'
import BookDetails from './pages/BookDetails'
import AvailableCopies from './pages/AvailableCopies'
import BorrowedBooks from './pages/BorrowedBooks'
import BorrowingHistory from './pages/BorrowingHistory'
import OutstandingFines from './pages/OutstandingFines'
import PaymentHistory from './pages/PaymentHistory'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import AddBook from './pages/AddBook'
import FinancialReports from './pages/FinancialReports'
import AssetReports from './pages/AssetReports'
import CollectionReports from './pages/CollectionReports'
import UserStatistics from './pages/UserStatistics'
import SubjectWiseInventory from './pages/SubjectWiseInventory'
import BookWiseCopies from './pages/BookWiseCopies'
import Payment from './pages/payment'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 className="ms-3">Library Management System</h4>
      </div>
    )
  }

  return (
    <Router>
      <div className="app-container">
        <Header />
        <ErrorBoundary>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/member-dashboard" element={<MemberDashboard />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/book-search" element={<BookSearch />} />
              <Route path="/book-details/:id" element={<BookDetails />} />
              <Route path="/available-copies" element={<AvailableCopies />} />
              <Route path="/borrowed-books" element={<BorrowedBooks />} />
              <Route path="/borrowing-history" element={<BorrowingHistory />} />
              <Route path="/outstanding-fines" element={<OutstandingFines />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/financial-reports" element={<FinancialReports />} />
              <Route path="/asset-reports" element={<AssetReports />} />
              <Route path="/collection-reports" element={<CollectionReports />} />
              <Route path="/user-statistics" element={<UserStatistics />} />
              <Route path="/subject-wise-inventory" element={<SubjectWiseInventory />} />
              <Route path="/book-wise-copies" element={<BookWiseCopies />} />
              <Route path="/payment" element={<Payment/>}/>
            </Routes>
          </main>
        </ErrorBoundary>
        <Footer />
      </div>
    </Router>
  )
}

export default App