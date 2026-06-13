const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // For Vercel, raw body is available in req.body
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Subscription created:', session.id);
      console.log('Customer:', session.customer_email);
      console.log('Plan:', session.metadata.plan);
      // TODO: Save to database
      break;
      
    case 'invoice.paid':
      const invoice = event.data.object;
      console.log('💰 Payment received:', invoice.id);
      console.log('Amount:', invoice.amount_paid / 100, '€');
      // TODO: Update subscription status
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('❌ Payment failed:', failedInvoice.id);
      // TODO: Notify customer, suspend service
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log('🗑️ Subscription cancelled:', subscription.id);
      // TODO: Remove access
      break;
      
    case 'customer.subscription.updated':
      const updatedSub = event.data.object;
      console.log('🔄 Subscription updated:', updatedSub.id);
      // TODO: Update plan
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return res.status(200).json({ received: true });
};