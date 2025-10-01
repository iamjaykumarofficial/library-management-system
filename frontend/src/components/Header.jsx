import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('.')[1]))
        setUserRole(userData.role)
        localStorage.setItem('userRole', userData.role)
      } catch (error) {
        console.error('Error decoding token:', error)
      }
    }
  }, [location])

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setIsLoggedIn(false)
    setUserRole('')
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-bottom">
      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-3">
            <i className="fas fa-book-reader me-2"></i>
            Library Management
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleMenu}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active fw-bold' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/book-search" 
                  className={`nav-link ${location.pathname === '/book-search' ? 'active fw-bold' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Search Books
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/available-copies" 
                  className={`nav-link ${location.pathname === '/available-copies' ? 'active fw-bold' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Available Books
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              {isLoggedIn ? (
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-primary dropdown-toggle" 
                    type="button" 
                    id="userMenu" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-2"></i>
                    My Account
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="userMenu">
                    <li>
                      <Link 
                        to={userRole === 'owner' ? '/owner-dashboard' : '/member-dashboard'} 
                        className="dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <i className="fas fa-user me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleSignOut}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn btn-outline-primary me-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Library
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header