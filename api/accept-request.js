const { sendTelegram, answerCallback, editMessage } = require('./telegram');

function getRedis() {
  let url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url) url = url.replace(/\/+$/, '');
  return { url, token };
}

async function redisGet(key) {
  const { url, token } = getRedis();
  if (!url || !token) return null;
  try {
    const res = await fetch(url + '/get/' + encodeURIComponent(key), {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (data.result === null || data.result === undefined) return null;
    if (typeof data.result === 'string') {
      try { return JSON.parse(data.result); } catch(e) { return data.result; }
    }
    return data.result;
  } catch(e) { return null; }
}

async function redisSet(key, value) {
  const { url, token } = getRedis();
  if (!url || !token) return null;
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    const res = await fetch(url + '/set/' + encodeURIComponent(key), {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'text/plain' },
      body: serialized
    });
    return await res.json();
  } catch(e) { return null; }
}

function acceptEmailHtml(clientName, requestType) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:0;border-radius:16px;overflow:hidden;border:1px solid #1a2a4a;">
    <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">✅</div>
      <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">Demande acceptée !</h1>
    </div>
    <div style="padding:32px 40px;">
      <p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">${clientName}</strong>,</p>
      <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Bonne nouvelle ! Votre demande a été <strong style="color:#22c55e;">acceptée</strong> par notre équipe.</p>
      <div style="background:#0d2818;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:15px;color:#86efac;">⏱️ Votre demande sera prête dans les <strong>24 heures</strong></p>
        <p style="margin:8px 0 0;font-size:13px;color:#4ade80;">Sauf urgence — contactez-nous si besoin</p>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://maltyshop.vercel.app/espace-client.html" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">Mon espace client →</a>
      </div>
      <p style="font-size:14px;color:#6a8cba;text-align:center;line-height:1.5;">Merci pour votre confiance. Nous reviendrons vers vous très vite !</p>
    </div>
    <div style="background:#0d1525;padding:20px 40px;text-align:center;border-top:1px solid #1a2a4a;">
      <p style="margin:0;font-size:13px;color:#4a6a8a;">— L'équipe MALTY</p>
      <p style="margin:4px 0 0;font-size:11px;color:#3a5a7a;">maltyshop.vercel.app</p>
    </div>
  </div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const requestId = req.query && req.query.id ? req.query.id : (req.body ? req.body.requestId : null);
  const cbId = req.body ? req.body.callbackQueryId : null;

  if (!requestId) {
    return res.status(400).json({ error: 'Missing requestId' });
  }

  // Get request from Redis
  const r = await redisGet('request:' + requestId);
  if (!r) {
    if (cbId) await answerCallback(cbId, '❌ Demande introuvable');
    return res.status(404).json({ error: 'Demande introuvable' });
  }

  if (r.status === 'accepted') {
    if (cbId) await answerCallback(cbId, '⚠️ Déjà acceptée');
    return res.status(200).json({ ok: true, message: 'Déjà acceptée' });
  }

  // Update Redis
  r.status = 'accepted';
  r.respondedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  await redisSet('request:' + requestId, r);

  // Send email
  let emailOk = false;
  let emailError = null;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MALTY <onboarding@resend.dev>',
        to: [r.email],
        subject: '[MALTY] Votre demande a été acceptée ✅',
        html: acceptEmailHtml(r.nom, r.type)
      })
    });
    const result = await response.json();
    if (response.ok) {
      emailOk = true;
    } else {
      emailError = JSON.stringify(result);
    }
  } catch(e) {
    emailError = e.message;
  }

  // Telegram callback answer
  if (cbId) {
    await answerCallback(cbId, emailOk ? '✅ Email envoyé au client !' : '⚠️ Accepté mais email échoué');
  }

  return res.status(200).json({ ok: true, emailSent: emailOk, emailError: emailError });
};
