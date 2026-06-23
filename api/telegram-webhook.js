const { answerCallback, editMessage, sendTelegram } = require('./telegram');

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

async function sendEmail(to, subject, html) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'MALTY <onboarding@resend.dev>', to: [to], subject, html })
  });
  const result = await response.json();
  if (!response.ok) console.error('Resend error:', JSON.stringify(result));
  return result;
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
  if (req.method !== 'POST') return res.status(200).end();

  const body = req.body;
  if (!body) return res.status(200).end();

  // Handle callback_query (button clicks)
  if (body.callback_query) {
    const cb = body.callback_query;
    const data = cb.data || '';
    const chatId = cb.message && cb.message.chat ? cb.message.chat.id : null;
    const msgId = cb.message ? cb.message.message_id : null;

    if (data.startsWith('accept:')) {
      const requestId = data.replace('accept:', '');

      // Get request from Redis
      const r = await redisGet('request:' + requestId);
      if (!r) {
        await answerCallback(cb.id, '❌ Demande introuvable');
        return res.status(200).end();
      }

      if (r.status === 'accepted') {
        await answerCallback(cb.id, '⚠️ Déjà acceptée');
        return res.status(200).end();
      }

      // Update Redis
      r.status = 'accepted';
      r.respondedAt = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
      await redisSet('request:' + requestId, r);

      // Send email to client
      try {
        const emailResult = await sendEmail(r.email, '[MALTY] Votre demande a été acceptée ✅', acceptEmailHtml(r.nom, r.type));
        console.log('Email sent to:', r.email, 'Result:', JSON.stringify(emailResult));
      } catch(e) {
        console.error('Email send error:', e.message);
      }

      // Answer callback
      await answerCallback(cb.id, '✅ Demande acceptée ! Email envoyé au client.');

      // Edit Telegram message to show accepted
      if (chatId && msgId) {
        const newText = `✅ DEMANDE ACCEPTÉE\n\n` +
          `👤 Client: ${r.nom}\n` +
          `📧 Email: ${r.email}\n` +
          `📂 Type: ${r.type}\n` +
          `📅 Acceptée le: ${r.respondedAt}\n\n` +
          `✅ Email envoyé au client — prêt sous 24h`;
        await editMessage(chatId, msgId, newText);
      }
    }

    return res.status(200).end();
  }

  // Handle webhook setup verification
  if (body.url) {
    return res.status(200).json({ ok: true });
  }

  return res.status(200).end();
};
