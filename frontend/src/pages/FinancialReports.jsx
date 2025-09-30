import { useState, useEffect } from 'react'
import { Table } from 'react-bootstrap'
import { Bar } from 'react-chartjs-2'
import Alert from '../components/Alert'

function FinancialReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Token:', token)
        if (!token) {
          setError('Please log in to view financial reports')
          setLoading(false)
          return
        }
        console.log('Fetching with Authorization: Bearer', token)
        const response = await fetch('http://localhost:5000/api/financial-reports', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        console.log('Response status:', response.status)
        const data = await response.json()
        console.log('Response data:', data)
        if (response.ok) {
          setReports(data)
        } else {
          setError(data.error || `Failed to load financial reports (Status: ${response.status})`)
        }
      } catch (err) {
        console.error('Financial reports fetch error:', err)
        setError('An error occurred while fetching reports. Please check if the server is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  const chartData = {
    labels: reports.map(report => report.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: reports.map(report => report.revenue),
        backgroundColor: '#007bff',
        stack: 'Stack 0'
      },
      {
        label: 'Fines Collected (₹)',
        data: reports.map(report => report.fines),
        backgroundColor: '#dc3545',
        stack: 'Stack 0'
      },
      {
        label: 'Membership Fees (₹)',
        data: reports.map(report => report.membership),
        backgroundColor: '#28a745',
        stack: 'Stack 0'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Amount (₹)'
        },
        beginAtZero: true,
        ticks: {
          callback: value => `₹${value.toLocaleString('en-IN')}`
        }
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Revenue Breakdown by Month'
      }
    }
  }

  return (
    <div className="container py-5">
      <h1>Financial Reports</h1>
      <p className="text-muted mb-4">View detailed financial performance</p>

      {error && <Alert type="danger" message={error} />}
      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 && !error ? (
        <p>No financial data available</p>
      ) : (
        <>
          <h2 className="mt-4">Financial Performance</h2>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue (₹)</th>
                <th>Fines Collected (₹)</th>
                <th>Membership Fees (₹)</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td>{report.month}</td>
                  <td>₹{report.revenue.toLocaleString('en-IN')}</td>
                  <td>₹{report.fines.toLocaleString('en-IN')}</td>
                  <td>₹{report.membership.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h2 className="mt-5">Revenue Breakdown</h2>
          <div style={{ height: '400px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  )
}

export default FinancialReports