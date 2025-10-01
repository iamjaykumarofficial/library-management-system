import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function LandingPage() {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className={`slide-up ${animate ? 'animate' : ''}`}>
                <h1 className="display-4 fw-bold mb-4">
                  Welcome to Our Digital Library
                </h1>
                <p className="lead mb-4">
                  A comprehensive digital solution for managing library operations, 
                  book circulation, and member services with ease and efficiency.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/register" className="btn btn-light btn-lg px-4 py-2">
                    Get Started
                  </Link>
                  <Link to="/book-search" className="btn btn-outline-light btn-lg px-4 py-2">
                    Browse Books
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className={`slide-up ${animate ? 'animate' : ''}`} style={{animationDelay: '0.2s'}}>
                <i className="fas fa-book-open display-1 text-white-50"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">System Features</h2>
            <p className="lead text-muted">
              Discover how our library management system can transform your reading experience
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h4 className="fw-bold mb-3">For Members</h4>
                <p className="text-muted">
                  Search and discover books, check availability, manage borrowed items, 
                  and track your reading history with our intuitive member portal.
                </p>
                <ul className="list-unstyled mt-3">
                  <li><i className="fas fa-check text-success me-2"></i> Easy book search</li>
                  <li><i className="fas fa-check text-success me-2"></i> Borrowing management</li>
                  <li><i className="fas fa-check text-success me-2"></i> Reading history</li>
                </ul>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h4 className="fw-bold mb-3">For Librarians</h4>
                <p className="text-muted">
                  Complete library operations including book management, member services, 
                  payment collection, and circulation control.
                </p>
                <ul className="list-unstyled mt-3">
                  <li><i className="fas fa-check text-success me-2"></i> Inventory management</li>
                  <li><i className="fas fa-check text-success me-2"></i> Member services</li>
                  <li><i className="fas fa-check text-success me-2"></i> Circulation control</li>
                </ul>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4 className="fw-bold mb-3">For Owners</h4>
                <p className="text-muted">
                  Business oversight with financial reports, asset tracking, and 
                  comprehensive analytics for informed decision making.
                </p>
                <ul className="list-unstyled mt-3">
                  <li><i className="fas fa-check text-success me-2"></i> Financial reports</li>
                  <li><i className="fas fa-check text-success me-2"></i> Asset tracking</li>
                  <li><i className="fas fa-check text-success me-2"></i> Analytics dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3">
              <div className="stat-item">
                <h2 className="fw-bold text-primary">10,000+</h2>
                <p className="text-muted">Books Available</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <h2 className="fw-bold text-primary">5,000+</h2>
                <p className="text-muted">Active Members</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <h2 className="fw-bold text-primary">50+</h2>
                <p className="text-muted">Categories</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-item">
                <h2 className="fw-bold text-primary">24/7</h2>
                <p className="text-muted">Digital Access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join our library community and experience seamless book management
          </p>
          <Link to="/register" className="btn btn-light btn-lg px-5 py-2">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage