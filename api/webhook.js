const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const { notifyNewSubscription, notifyPayment, notifyPaymentFailed } = require('./telegram');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_LOGIN,
    pass: process.env.BREVO_SMTP_KEY
  }
});

module.exports.config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// Send email via Outlook SMTP (free)
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: '"MALTY" <maltyz@outlook.fr>',
      to: to,
      subject: subject,
      html: html
    });
    return { id: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

function welcomeEmailHtml(name, plan) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#e0e0e0;padding:40px;border-radius:12px;">
    <h1 style="color:#3b82f6;font-size:24px;">Bienvenue chez MALTY !</h1>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Votre abonnement <strong>${plan}</strong> est maintenant actif.</p>
    <div style="background:#111;border-left:4px solid #3b82f6;padding:16px;margin:20px 0;border-radius:6px;">
      <p style="margin:0;"><strong>🚀 Ce qui est inclus :</strong></p>
      <ul style="margin:8px 0;padding-left:20px;">
        <li>Suivi de votre site en temps réel</li>
        <li>Modifications mensuelles incluses</li>
        <li>Support prioritaire par email</li>
      </ul>
    </div>
    <p>Connectez-vous à votre espace client : <a href="https://maltyshop.vercel.app/espace-client.html" style="color:#3b82f6;">maltyshop.vercel.app/espace-client</a></p>
    <p style="color:#888;font-size:12px;margin-top:30px;">— L'équipe MALTY</p>
  </div>`;
}

function paymentConfirmationHtml(name, plan, amount) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#e0e0e0;padding:40px;border-radius:12px;">
    <h1 style="color:#22c55e;font-size:24px;">Paiement confirmé</h1>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Votre paiement de <strong>${amount}€</strong> pour le forfait <strong>${plan}</strong> a bien été reçu.</p>
    <p>Prochain prélèvement automatique dans 30 jours.</p>
    <p style="color:#888;font-size:12px;margin-top:30px;">— L'équipe MALTY</p>
  </div>`;
}

function paymentFailedHtml(name) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a1a;color:#e0e0e0;padding:40px;border-radius:12px;">
    <h1 style="color:#ef4444;font-size:24px;">Paiement échoué</h1>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Nous n'avons pas pu renouveler votre abonnement.</p>
    <p>Veuillez mettre à jour votre moyen de paiement depuis votre <a href="https://maltyshop.vercel.app/espace-client.html" style="color:#3b82f6;">espace client</a>.</p>
    <p style="color:#888;font-size:12px;margin-top:30px;">— L'équipe MALTY</p>
  </div>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Subscription created:', session.id);
      
      const name = session.metadata?.firstName || session.customer_details?.name || 'Client';
      const email = session.customer_email || session.customer_details?.email;
      const plan = session.metadata?.plan === 'premium' ? 'Premium 39€' : 'Essentiel 19€';
      
      const now = new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
      
      if (email) {
        await sendEmail('maltyz@outlook.fr', '✅ [Copie] Bienvenue ' + name + ' — ' + plan, welcomeEmailHtml(name, plan));
      }
      await notifyNewSubscription({
        name,
        email: email || 'N/A',
        domain: session.metadata?.domain || 'N/A',
        plan,
        amount: plan === 'Premium 39€' ? '39€' : '19€',
        sessionId: session.id,
        date: now
      });
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object;
      console.log('💰 Payment received:', invoice.id);
      
      const email = invoice.customer_email;
      const name = invoice.customer_name || 'Client';
      const amount = invoice.amount_paid / 100;
      const plan = invoice.lines?.data?.[0]?.metadata?.plan === 'premium' ? 'Premium' : 'Essentiel';
      
      const now = new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
      
      if (email) {
        await sendEmail('maltyz@outlook.fr', '💰 [Copie] Paiement ' + amount + '€ — ' + name, paymentConfirmationHtml(name, plan, amount));
      }
      await notifyPayment({
        name,
        email: email || 'N/A',
        plan,
        amount,
        invoiceId: invoice.id,
        invoiceUrl: invoice.hosted_invoice_url || 'N/A',
        date: now
      });
      break;
    }
    
    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object;
      console.log('❌ Payment failed:', failedInvoice.id);
      
      const email = failedInvoice.customer_email;
      const name = failedInvoice.customer_name || 'Client';
      
      const now = new Date().toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
      
      if (email) {
        await sendEmail('maltyz@outlook.fr', '❌ [Copie] Paiement échoué — ' + name, paymentFailedHtml(name));
      }
      await notifyPaymentFailed({
        name,
        email: email || 'N/A',
        invoiceId: failedInvoice.id,
        invoiceUrl: failedInvoice.hosted_invoice_url || 'N/A',
        date: now
      });
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log('🗑️ Subscription cancelled:', subscription.id);
      break;
    }
    
    case 'customer.subscription.updated': {
      const updatedSub = event.data.object;
      console.log('🔄 Subscription updated:', updatedSub.id);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return res.status(200).json({ received: true });
};