import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Table from '../components/Table'
import Alert from '../components/Alert'

function CollectionReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in to view collection reports')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/collection-reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setReports(data)
        } else {
          setError(data.error || 'Failed to load collection reports')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchReports()
  }, [navigate])

  const headers = ['Genre', 'Total Books', 'Available', 'Borrowed']
  const rows = reports.map(report => [
    report.genre,
    report.total,
    report.available,
    report.borrowed
  ])

  return (
    <div className="container py-5">
      <h1 className="mb-4">Collection Reports</h1>
      <p>View book collection by genre</p>
      {error && <Alert type="danger" message={error} />}
      {reports.length === 0 && !error && (
        <Alert type="info" message="No collection data available." />
      )}
      {reports.length > 0 && <Table headers={headers} rows={rows} />}
    </div>
  )
}

export default CollectionReports