const express = require('express')
const mysql = require('mysql2/promise')
const router = express.Router()
const authenticateToken = require('../middleware/auth')

// Process payment
router.post('/process-payment', authenticateToken, async (req, res) => {
  const { amount, description, paymentMethod, email } = req.body
  
  if (!amount || !description || !paymentMethod) {
    return res.status(400).json({ error: 'Amount, description, and payment method are required' })
  }

  try {
    const pool = req.app.get('pool')
    
    // Generate unique payment ID
    const payment_id = `PAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
    
    // Insert payment record
    await pool.query(
      'INSERT INTO payments (user_id, payment_id, amount, description, payment_method, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, payment_id, amount, description, paymentMethod, new Date(), 'completed']
    )

    // Update fines if this is a fine payment
    if (description.includes('fine') || description.includes('Fine')) {
      await pool.query(
        'UPDATE borrowings SET fine = 0 WHERE user_id = ? AND fine > 0',
        [req.user.id]
      )
    }

    // Send payment confirmation email
    try {
      await sendPaymentConfirmationEmail(req.user.email, {
        payment_id,
        amount,
        description,
        paymentMethod,
        date: new Date().toLocaleDateString()
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue even if email fails
    }

    res.json({ 
      success: true, 
      message: 'Payment processed successfully',
      payment_id,
      amount 
    })
    
  } catch (err) {
    console.error('Payment processing error:', err)
    res.status(500).json({ error: 'Payment processing failed' })
  }
})

// Get payment methods
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        icon: 'fa-credit-card',
        description: 'Pay with Visa, MasterCard, or American Express'
      },
      {
        id: 'debit_card',
        name: 'Debit Card',
        icon: 'fa-credit-card',
        description: 'Pay with your debit card'
      },
      {
        id: 'upi',
        name: 'UPI',
        icon: 'fa-mobile-alt',
        description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm'
      },
      {
        id: 'net_banking',
        name: 'Net Banking',
        icon: 'fa-university',
        description: 'Transfer directly from your bank account'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'fa-paypal',
        description: 'Pay using your PayPal account'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'fa-exchange-alt',
        description: 'Manual bank transfer'
      }
    ]
    
    res.json(paymentMethods)
  } catch (err) {
    console.error('Payment methods error:', err)
    res.status(500).json({ error: 'Failed to load payment methods' })
  }
})

// Email service function
async function sendPaymentConfirmationEmail(userEmail, paymentDetails) {
  // This is a simulation - in production, you would use a service like:
  // Nodemailer, SendGrid, Mailgun, etc.
  
  const emailContent = `
    LIBRARY MANAGEMENT SYSTEM - PAYMENT CONFIRMATION
    
    Dear Member,
    
    Your payment has been processed successfully.
    
    Payment Details:
    - Payment ID: ${paymentDetails.payment_id}
    - Amount: ₹${paymentDetails.amount}
    - Description: ${paymentDetails.description}
    - Payment Method: ${paymentDetails.paymentMethod}
    - Date: ${paymentDetails.date}
    
    Thank you for your payment!
    
    Best regards,
    Library Management System
  `

  console.log('SENDING PAYMENT CONFIRMATION EMAIL:')
  console.log('To:', userEmail)
  console.log('Subject: Payment Confirmation - Library Management System')
  console.log('Content:', emailContent)
  
  // In a real application, you would implement actual email sending here
  // For example with Nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Payment Confirmation - Library Management System',
    text: emailContent
  });
  */
  
  return true
}

module.exports = router