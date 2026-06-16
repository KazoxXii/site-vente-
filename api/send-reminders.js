const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Email template
function buildEmailHtml(prenom, formule, montant, datePrelevement) {
  const fs = require('fs');
  const path = require('path');
  let html = fs.readFileSync(path.join(__dirname, 'email-rappel.html'), 'utf8');
  html = html.replace(/\{\{PRENOM\}\}/g, prenom);
  html = html.replace(/\{\{FORMULE\}\}/g, formule);
  html = html.replace(/\{\{MONTANT\}\}/g, montant);
  html = html.replace(/\{\{DATE_PRELEVEMENT\}\}/g, datePrelevement);
  return html;
}

// Send email via Resend (free tier: 100 emails/day)
async function sendEmail(to, subject, html) {
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
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }
  
  return await response.json();
}

module.exports = async (req, res) => {
  // Only allow POST or GET from cron
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Security: verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const results = [];
    
    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100
    });
    
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    for (const sub of subscriptions.data) {
      const currentPeriodEnd = new Date(sub.current_period_end * 1000);
      
      // Check if renewal is in ~2 days (between 1.5 and 2.5 days from now)
      const daysUntilRenewal = (currentPeriodEnd - now) / (1000 * 60 * 60 * 24);
      
      if (daysUntilRenewal >= 1.5 && daysUntilRenewal <= 2.5) {
        const customer = await stripe.customers.retrieve(sub.items.data[0].customer);
        const email = customer.email;
        const name = customer.name || customer.metadata?.firstName || 'Client';
        const planName = sub.metadata?.plan === 'premium' ? 'Premium' : 'Essentiel';
        const amount = sub.items.data[0].plan.amount / 100;
        const renewalDate = currentPeriodEnd.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        // Check if we already sent a reminder today
        const reminderKey = `reminder_${sub.id}_${now.toISOString().split('T')[0]}`;
        
        const TEST_EMAIL = 'cameronn.bonvallet972@gmail.com';
        
        // Build and send email
        const html = buildEmailHtml(name, planName, amount + '€', renewalDate);
        
        await sendEmail(
          TEST_EMAIL,
          `🛡️ [Copie] Rappel : renouvellement ${planName} dans 2 jours — ${name}`,
          html
        );
        
        results.push({
          subscription: sub.id,
          customer: email,
          plan: planName,
          renewalDate: renewalDate,
          status: 'sent'
        });
      }
    }
    
    return res.status(200).json({
      message: `${results.length} rappel(s) envoyé(s)`,
      results: results
    });
    
  } catch (error) {
    console.error('Error sending reminders:', error.message);
    return res.status(500).json({ error: error.message });
  }
};