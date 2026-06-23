const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  if (!BOT_TOKEN) return res.status(500).json({ error: 'BOT_TOKEN missing' });

  const webhookUrl = 'https://maltyshop.vercel.app/api/telegram-webhook';

  try {
    // Remove old webhook
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);

    // Set new webhook
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['callback_query'] })
    });
    const data = await response.json();

    return res.status(200).json({ ok: true, webhook: data, url: webhookUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
