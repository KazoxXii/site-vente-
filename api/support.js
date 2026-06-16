const RESEND_API_KEY = process.env.RESEND_API_KEY;
const { notifySupportRequest } = require('./telegram');

async function sendEmail(to, subject, html) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
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

function emailToMalty(nom, email, type, site, message) {
  const typeEmoji = {
    'Bug / Problème technique': '🐛',
    'Modification de contenu': '✏️',
    'Demande de devis': '📦',
    'Facturation / Abonnement': '💳',
    'Déploiement / Mise en ligne': '🚀',
    'Autre': '💡'
  };

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:40px;border-radius:12px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:#0066ff;width:60px;height:60px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;">M</div>
    </div>
    <h1 style="color:#0066ff;font-size:22px;text-align:center;margin-bottom:8px;">${typeEmoji[type] || '📩'} Nouvelle demande support</h1>
    <p style="color:#6a8cba;text-align:center;margin-bottom:32px;">Un client vous a contacté depuis la page support.</p>
    <div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Nom</td>
          <td style="padding:8px 0;font-weight:600;">${nom}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#0066ff;text-decoration:none;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Type</td>
          <td style="padding:8px 0;font-weight:600;">${type}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Site</td>
          <td style="padding:8px 0;">${site || 'Non précisé'}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Message</td>
          <td style="padding:8px 0;line-height:1.6;">${message.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="mailto:${email}?subject=Re: Demande support — MALTY" style="display:inline-block;background:#0066ff;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Répondre au client</a>
    </div>
    <p style="color:#6a8cba;font-size:11px;text-align:center;margin-top:32px;">— MALTY Support</p>
  </div>`;
}

function confirmationToClient(nom, type, message) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:40px;border-radius:12px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:#0066ff;width:60px;height:60px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;">M</div>
    </div>
    <h1 style="color:#00cc66;font-size:22px;text-align:center;margin-bottom:8px;">✅ Message envoyé</h1>
    <p style="color:#6a8cba;text-align:center;margin-bottom:32px;">Bonjour ${nom}, j'ai bien reçu votre message.</p>
    <div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Type</td>
          <td style="padding:8px 0;font-weight:600;">${type}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Message</td>
          <td style="padding:8px 0;line-height:1.6;">${message.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
    <div style="background:#0d1a2e;border-left:4px solid #0066ff;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;">📅 <strong>Délai de réponse :</strong> Sous 24 heures</p>
    </div>
    <p style="color:#6a8cba;font-size:13px;text-align:center;">Vous recevrez une réponse par email very quickly.</p>
    <p style="color:#6a8cba;font-size:11px;text-align:center;margin-top:32px;">— MALTY</p>
  </div>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nom, email, type, site, message } = req.body || {};

  if (!nom || !email || !type || !message) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  try {
    await sendEmail(
      'maltyz@outlook.fr',
      `📩 Nouvelle demande support — ${nom}`,
      emailToMalty(nom, email, type, site, message)
    );

    await sendEmail(
      email,
      `✅ [MALTY] Votre message a bien été envoyé`,
      confirmationToClient(nom, type, message)
    );

    await notifySupportRequest({
      nom,
      email,
      type,
      site: site || '',
      message,
      date: now
    });

    return res.status(200).json({ ok: true, message: 'Demande envoyée' });
  } catch (err) {
    console.error('Support API error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};
