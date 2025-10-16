// api/process-payment.js
// This goes in your Vercel project

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      phone_number,
      amount,
      order_number,
      customer_name,
      customer_email,
      order_details
    } = req.body;

    // Validate input
    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format phone number (Intasend needs format: 254XXXXXXXXX)
    let formattedPhone = phone_number.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    // Step 1: Initiate STK Push with Intasend
    const intasendResponse = await fetch('https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTASEND_SECRET_KEY}`
      },
      body: JSON.stringify({
        phone_number: formattedPhone,
        email: customer_email,
        amount: amount,
        narrative: `Order #${order_number} - Nasieku Luxury`,
        api_ref: order_number
      })
    });

    const paymentData = await intasendResponse.json();

    if (!intasendResponse.ok) {
      console.error('Intasend error:', paymentData);
      return res.status(400).json({ 
        error: 'Payment initiation failed', 
        details: paymentData 
      });
    }

    // Step 2: Poll for payment status (check every 3 seconds for up to 60 seconds)
    const invoice_id = paymentData.invoice?.invoice_id || paymentData.id;
    let paymentConfirmed = false;
    let attempts = 0;
    const maxAttempts = 20; // 60 seconds total

    while (!paymentConfirmed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      const statusResponse = await fetch(`https://sandbox.intasend.com/api/v1/payment/status/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTASEND_SECRET_KEY}`
        },
        body: JSON.stringify({
          invoice_id: invoice_id
        })
      });

      const statusData = await statusResponse.json();
      
      if (statusData.invoice?.state === 'COMPLETE') {
        paymentConfirmed = true;
        
        // Step 3: Send order email via Web3Forms
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_KEY,
            subject: `✅ PAID - Order #${order_number} from Nasieku Website`,
            from_name: 'Nasieku Orders - PAID',
            ...order_details,
            payment_status: '✅ PAID via M-Pesa',
            mpesa_phone: formattedPhone,
            transaction_ref: statusData.invoice?.mpesa_reference || 'N/A'
          })
        });

        return res.status(200).json({
          success: true,
          message: 'Payment successful',
          transaction_ref: statusData.invoice?.mpesa_reference,
          order_number: order_number
        });
      } else if (statusData.invoice?.state === 'FAILED') {
        return res.status(400).json({
          success: false,
          error: 'Payment failed or was cancelled'
        });
      }
      
      attempts++;
    }

    // Timeout - payment not confirmed within 60 seconds
    return res.status(408).json({
      success: false,
      error: 'Payment timeout. Please check your phone and try again.'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
};