import { Link, useNavigate } from 'react-router-dom'

  function Header() {
    const navigate = useNavigate()
    const isLoggedIn = !!localStorage.getItem('token')

    const handleSignOut = () => {
      localStorage.removeItem('token')
      navigate('/login')
    }

    return (
      <header className="bg-white border-bottom py-3 shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="logo fs-4 fw-bold">Library Management System</div>
          <div>
            {isLoggedIn ? (
              <>
                <Link to="/member-dashboard" className="btn btn-outline-dark me-2">Dashboard</Link>
                <button onClick={handleSignOut} className="btn btn-dark">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark me-2">Sign In</Link>
                <Link to="/register" className="btn btn-dark">Join Library</Link>
              </>
            )}
          </div>
        </div>
      </header>
    )
  }

  export default Header