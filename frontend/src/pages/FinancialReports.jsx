import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import Alert from '../components/Alert'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function FinancialReports() {
  const [reports, setReports] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Please log in as an owner to view financial reports')
          setTimeout(() => navigate('/login'), 2000)
          return
        }
        const response = await fetch('http://localhost:5000/api/financial-reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setReports(data)
        } else {
          setError(data.error || 'Failed to load financial reports')
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('An error occurred. Please try again.')
      }
    }
    fetchReports()
  }, [navigate])

  const chartData = {
    labels: reports.map(report => report.month),
    datasets: [
      {
        label: 'Fines Collected (₹)',
        data: reports.map(report => report.fines),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Membership Fees (₹)',
        data: reports.map(report => report.membership),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Other Revenue (₹)',
        data: reports.map(report => report.revenue - (report.fines + report.membership)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#333'
        }
      },
      title: {
        display: true,
        text: 'Revenue Breakdown by Month',
        color: '#333',
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.raw.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Month',
          color: '#333'
        },
        ticks: {
          color: '#333'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (₹)',
          color: '#333'
        },
        ticks: {
          color: '#333',
          callback: function(value) {
            return `₹${value.toFixed(2)}`
          }
        }
      }
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Financial Reports</h1>
      <p>View detailed financial performance</p>
      {error && <Alert type="danger" message={error} />}
      {reports.length === 0 && !error && (
        <Alert type="info" message="No financial data available. Process payments to view reports." />
      )}
      {reports.length > 0 && (
        <div className="card shadow">
          <div className="card-body">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  )
}

export default FinancialReports