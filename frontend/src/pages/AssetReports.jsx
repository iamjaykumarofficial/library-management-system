import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function AssetReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
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
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
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

  return (
    <div className="container py-5">
      <h1 className="mb-4">Asset Reports</h1>
      <p>View library asset details</p>
      {error && <Alert type="danger" message={error} />}
      {reports.length === 0 && !error && (
        <Alert type="info" message="No assets found. Add books to view asset reports." />
      )}
      {reports.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default AssetReports