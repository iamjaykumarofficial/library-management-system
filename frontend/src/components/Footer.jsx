function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 className="fw-bold mb-3">
              <i className="fas fa-book-reader me-2"></i>
              Library Management System
            </h5>
            <p className="mb-0">
              A comprehensive digital solution for managing library operations, 
              book circulation, and member services with ease and efficiency.
            </p>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white-50 text-decoration-none">Home</a></li>
              <li><a href="/book-search" className="text-white-50 text-decoration-none">Search Books</a></li>
              <li><a href="/available-copies" className="text-white-50 text-decoration-none">Available Books</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Contact</h6>
            <ul className="list-unstyled">
              <li><i className="fas fa-envelope me-2"></i> info@library.com</li>
              <li><i className="fas fa-phone me-2"></i> +1 234 567 890</li>
              <li><i className="fas fa-map-marker-alt me-2"></i> 123 Library St, Book City</li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">&copy; 2025 Library Management System. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <div className="social-links">
              <a href="#" className="text-white me-3"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-white me-3"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-white me-3"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-white"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer