import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div>
      <section className="text-center py-5 bg-white">
        <div className="container">
          <h1 className="display-4">Welcome to Our Library</h1>
          <p className="lead">A comprehensive digital solution for managing library operations, book circulation, and member services with ease and efficiency.</p>
          <Link to="/register" className="btn btn-dark btn-lg">Get Started</Link>
        </div>
      </section>
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">System Features</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">For Members</h3>
                  <p className="card-text">Search and discover books, check availability, manage borrowed items, and track your reading history.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">For Librarians</h3>
                  <p className="card-text">Complete library operations including book management, member services, payment collection, and circulation control.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">For Owners</h3>
                  <p className="card-text">Business oversight with financial reports, asset tracking, and comprehensive analytics for informed decision making.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="text-center py-5 bg-dark text-white">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join our library community and experience seamless book management</p>
          <Link to="/register" className="btn btn-light btn-lg">Create Account</Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage