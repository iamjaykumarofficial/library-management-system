function Footer() {
  return (
    <footer className="theme-footer py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 className="fw-bold mb-3 theme-text">
              <i className="fas fa-book-reader me-2"></i>
              Library Management System
            </h5>
            <p className="mb-0 theme-text-secondary">
              A comprehensive digital solution for managing library operations, 
              book circulation, and member services with ease and efficiency.
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold theme-text">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="footer-link text-decoration-none">Home</a></li>
              <li><a href="/book-search" className="footer-link text-decoration-none">Search Books</a></li>
              <li><a href="/available-copies" className="footer-link text-decoration-none">Available Books</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold theme-text">Contact</h6>
            <ul className="list-unstyled">
              <li className="theme-text-secondary"><i className="fas fa-envelope me-2"></i> jaylibrary.com</li>
              <li className="theme-text-secondary"><i className="fas fa-phone me-2"></i> +91 8770355013</li>
              <li className="theme-text-secondary"><i className="fas fa-map-marker-alt me-2"></i> Pune , Maharastra</li>
            </ul>
          </div>
        </div>
        <hr className="my-4 theme-border" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 theme-text-secondary">&copy; 2025 Library Management System. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="social-links">
              <a href="#" className="social-link me-3"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link me-3"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link me-3"><i className="fab fa-instagram"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer