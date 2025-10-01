import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Alert from '../components/Alert'

function Payment() {
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Get payment details from navigation state or default
  const defaultPayment = {
    amount: 0,
    description: 'Library Payment',
    type: 'general'
  }

  const paymentInfo = location.state?.payment || defaultPayment

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch('/api/payments/payment-methods', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setPaymentMethods(data)
        } else {
          setError(data.error || 'Failed to load payment methods')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Failed to load payment methods')
      }
    }

    fetchPaymentMethods()
  }, [navigate])

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payments/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: paymentInfo.amount,
          description: paymentInfo.description,
          paymentMethod: selectedMethod,
          email: localStorage.getItem('userEmail') // You might want to store user email
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Payment successful! Confirmation email sent. Payment ID: ${data.payment_id}`)
        
        // Redirect after successful payment
        setTimeout(() => {
          if (paymentInfo.type === 'fine') {
            navigate('/outstanding-fines')
          } else {
            navigate('/member-dashboard')
          }
        }, 3000)
      } else {
        setError(data.error || 'Payment failed')
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailReceipt = () => {
    const email = prompt('Enter email address for receipt:')
    if (email) {
      // Here you would typically send the receipt via your backend
      alert(`Receipt will be sent to: ${email}`)
      // Implement actual email sending in backend
    }
  }

  return (
    <div className="container py-5 fade-in">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="fas fa-credit-card me-2"></i>
                Make Payment
              </h3>
            </div>
            <div className="card-body">
              {/* Payment Summary */}
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Payment Summary</h5>
                  <div className="row">
                    <div className="col-6">
                      <strong>Amount:</strong>
                    </div>
                    <div className="col-6 text-end">
                      <span className="fw-bold text-primary">₹{paymentInfo.amount}</span>
                    </div>
                  </div>
                  <div className="row mt-2">
                    <div className="col-6">
                      <strong>Description:</strong>
                    </div>
                    <div className="col-6 text-end">
                      {paymentInfo.description}
                    </div>
                  </div>
                </div>
              </div>

              {error && <Alert type="danger" message={error} />}
              {success && <Alert type="success" message={success} />}

              {/* Payment Methods */}
              <form onSubmit={handlePayment}>
                <h5 className="mb-3">Select Payment Method</h5>
                
                <div className="row g-3">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="col-md-6">
                      <div 
                        className={`card payment-method-card ${selectedMethod === method.id ? 'border-primary' : ''}`}
                        onClick={() => setSelectedMethod(method.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id={method.id}
                              checked={selectedMethod === method.id}
                              onChange={() => setSelectedMethod(method.id)}
                            />
                            <label className="form-check-label w-100" htmlFor={method.id}>
                              <div className="d-flex align-items-center">
                                <i className={`fas ${method.icon} fa-2x me-3 text-primary`}></i>
                                <div>
                                  <h6 className="mb-1">{method.name}</h6>
                                  <small className="text-muted">{method.description}</small>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Action Buttons */}
                <div className="mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading || !selectedMethod}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock me-2"></i>
                        Pay ₹{paymentInfo.amount}
                      </>
                    )}
                  </button>
                  
                  <div className="mt-3 text-center">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary me-2"
                      onClick={handleEmailReceipt}
                    >
                      <i className="fas fa-envelope me-2"></i>
                      Email Receipt
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => navigate(-1)}
                    >
                      <i className="fas fa-times me-2"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <i className="fas fa-shield-alt text-success me-3 fa-2x"></i>
                  <div>
                    <h6 className="mb-1">Secure Payment</h6>
                    <small className="text-muted">
                      Your payment information is encrypted and secure. We do not store your card details.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payment