const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { sendTelegram } = require('./telegram');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Maman972lol';

async function sendEmail(to, subject, html) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MALTY <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html
      })
    });
    return await response.json();
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

function responseEmailHtml(adminName, responseType, message) {
  const typeLabels = {accepted:'✅ Acceptee',rejected:'❌ Refusee',in_progress:'🔄 En cours',completed:'✅ Terminee'};
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:40px;border-radius:12px;">
    <h1 style="color:#0066ff;font-size:22px;text-align:center;margin-bottom:24px;">Reponse de MALTY</h1>
    <div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="margin:0 0 12px;"><strong>Statut:</strong> ${typeLabels[responseType] || responseType}</p>
      <p style="margin:0 0 12px;"><strong>Message:</strong></p>
      <div style="background:#0d1a2e;border-left:4px solid #0066ff;padding:16px;border-radius:0 8px 8px 0;margin-top:8px;">
        <p style="margin:0;line-height:1.6;white-space:pre-wrap;">${message}</p>
      </div>
    </div>
    <p style="color:#6a8cba;font-size:13px;text-align:center;">Connectez-vous a votre espace client pour suivre l'avancement.</p>
    <p style="color:#6a8cba;font-size:11px;text-align:center;margin-top:24px;">— L'equipe MALTY</p>
  </div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action');

  try {
    if (req.method === 'GET' && action === 'subscriptions') {
      const subscriptions = await stripe.subscriptions.list({ limit: 100 });
      const customers = await stripe.customers.list({ limit: 100 });

      const subs = subscriptions.data.map(sub => {
        const customer = customers.data.find(c => c.id === sub.items.data[0].customer);
        return {
          id: sub.id,
          status: sub.status,
          plan: sub.metadata?.plan === 'premium' ? 'Premium 39€' : 'Essentiel 19€',
          email: customer?.email || 'N/A',
          name: customer?.name || sub.metadata?.firstName || 'Client',
          startDate: new Date(sub.created * 1000).toLocaleDateString('fr-FR'),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toLocaleDateString('fr-FR'),
          amount: sub.items.data[0].plan.amount / 100
        };
      });

      return res.status(200).json({ subscriptions: subs });
    }

    if (req.method === 'GET' && action === 'customers') {
      const customers = await stripe.customers.list({ limit: 100 });
      return res.status(200).json({ customers: customers.data.map(c => ({
        id: c.id,
        name: c.name || 'N/A',
        email: c.email || 'N/A',
        created: new Date(c.created * 1000).toLocaleDateString('fr-FR')
      }))});
    }

    if (req.method === 'GET' && action === 'invoices') {
      const invoices = await stripe.invoices.list({ limit: 50 });
      return res.status(200).json({ invoices: invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amount_paid / 100,
        status: inv.status,
        email: inv.customer_email,
        name: inv.customer_name || 'N/A',
        date: new Date(inv.created * 1000).toLocaleDateString('fr-FR'),
        url: inv.hosted_invoice_url
      }))});
    }

    if (req.method === 'GET' && action === 'stats') {
      const subscriptions = await stripe.subscriptions.list({ limit: 100 });
      const invoices = await stripe.invoices.list({ limit: 100 });
      const customers = await stripe.customers.list({ limit: 100 });

      const activeSubs = subscriptions.data.filter(s => s.status === 'active').length;
      const totalRevenue = invoices.data
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + i.amount_paid / 100, 0);
      const pendingInvoices = invoices.data.filter(i => i.status === 'open').length;

      return res.status(200).json({
        activeSubscriptions: activeSubs,
        totalRevenue: totalRevenue,
        pendingInvoices: pendingInvoices,
        totalCustomers: customers.total_count || customers.data.length
      });
    }

    if (req.method === 'POST' && action === 'respond') {
      const { clientEmail, clientName, responseType, message } = req.body || {};

      if (!clientEmail || !message) {
        return res.status(400).json({ error: 'Email et message requis' });
      }

      await sendEmail(
        clientEmail,
        `Reponse MALTY — Votre demande: ${responseType}`,
        responseEmailHtml(clientName, responseType, message)
      );

      await sendTelegram(
        `📨 REPONSE ENVOYEE\n\n` +
        `Client: ${clientName}\n` +
        `Email: ${clientEmail}\n` +
        `Statut: ${responseType}\n` +
        `Message: ${message.substring(0, 200)}`
      );

      return res.status(200).json({ success: true, message: 'Reponse envoyee' });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Admin API error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
