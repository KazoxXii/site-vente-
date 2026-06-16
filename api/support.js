const { notifySupportRequest } = require('./telegram');

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
