import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function AssetReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in as an owner to view asset reports')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        
        const response = await fetch('http://localhost:5000/api/asset-reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setReports(data)
        } else {
          setError(data.error || 'Failed to load asset reports')
        }
      } catch (err) {
        console.error('Asset reports error:', err)
        setError('An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [navigate])

  const headers = ['Asset Type', 'Quantity', 'Total Value', 'Condition']
  const rows = reports.map(report => [
    report.asset_type,
    report.quantity,
    `₹${parseFloat(report.total_value || 0).toFixed(2)}`,
    report.asset_condition
  ])

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading asset reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-5 fade-in">
      <h1 className="fw-bold mb-4">Asset Reports</h1>
      <p className="lead text-muted mb-4">View library asset details</p>
      
      {error && <Alert type="danger" message={error} />}
      
      {reports.length === 0 && !error ? (
        <Alert type="info" message="No assets found. Add books to view asset reports." />
      ) : (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h5 className="card-title mb-0">
              <i className="fas fa-chart-bar me-2 text-primary"></i>
              Asset Reports
            </h5>
          </div>
          <div className="card-body">
            <Table headers={headers} rows={rows} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetReports