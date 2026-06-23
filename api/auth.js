const crypto = require('crypto');

function getRedis() {
  let url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url) url = url.replace(/\/+$/, '');
  return { url, token };
}

async function rGet(key) {
  const { url, token } = getRedis();
  if (!url || !token) throw new Error('Redis not configured');
  const res = await fetch(url + '/get/' + encodeURIComponent(key), {
    headers: { Authorization: 'Bearer ' + token }
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  if (typeof data.result === 'string') {
    try { return JSON.parse(data.result); } catch(e) { return data.result; }
  }
  return data.result;
}

async function rSet(key, value) {
  const { url, token } = getRedis();
  if (!url || !token) throw new Error('Redis not configured');
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(url + '/set/' + encodeURIComponent(key), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'text/plain' },
    body: serialized
  });
  return await res.json();
}

async function rDel(key) {
  const { url, token } = getRedis();
  if (!url || !token) return;
  await fetch(url + '/del/' + encodeURIComponent(key), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: '{}'
  });
}

async function notify(msg) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT = process.env.TELEGRAM_CHAT_ID;
  if (!BOT || !CHAT) return;
  try {
    await fetch('https://api.telegram.org/bot' + BOT + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ chat_id: CHAT, text: msg })
    });
  } catch(e) {}
}

function hash(pw) { return crypto.createHash('sha256').update(pw).digest('hex'); }
function genToken() { return crypto.randomBytes(32).toString('hex'); }

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = req.body || {};
  const action = b.action;
  const email = b.email;
  const password = b.password;
  const nom = b.nom;
  const phone = b.phone;
  const ip = req.headers['x-forwarded-for'] || 'Inconnu';
  const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  // REGISTER
  if (action === 'register') {
    if (!email || !password || !nom) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    var em = email.toLowerCase();
    var exists = await rGet('user:' + em);
    if (exists) {
      return res.status(409).json({ error: 'Un compte existe deja avec cet email' });
    }
    var tk = genToken();
    var u = { nom: nom, email: em, phone: phone || '', password: hash(password), token: tk, createdAt: new Date().toISOString(), plan: null, sites: [] };
    await rSet('user:' + em, u);

    var listRaw = await rGet('user:emails');
    var list = Array.isArray(listRaw) ? listRaw : [];
    if (list.indexOf(em) === -1) { list.push(em); await rSet('user:emails', list); }

    notify('🆕 NOUVELLE INSCRIPTION\n\nNom: ' + nom + '\nEmail: ' + em + '\nTel: ' + (phone || 'N/A') + '\nDate: ' + now + '\nIP: ' + ip);

    return res.status(200).json({ ok: true, token: tk, user: { nom: nom, email: em, phone: phone || '' } });
  }

  // LOGIN
  if (action === 'login') {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    var em = email.toLowerCase();
    var u = await rGet('user:' + em);
    if (!u || u.password !== hash(password)) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    var tk = genToken();
    u.token = tk;
    await rSet('user:' + em, u);

    notify('🔓 CONNEXION\n\nNom: ' + u.nom + '\nEmail: ' + em + '\nDate: ' + now + '\nIP: ' + ip);

    return res.status(200).json({ ok: true, token: tk, user: { nom: u.nom, email: u.email, phone: u.phone, plan: u.plan } });
  }

  // CHECK
  if (action === 'check') {
    if (!email || !token) {
      return res.status(400).json({ error: 'Token requis' });
    }
    var em = email.toLowerCase();
    var u = await rGet('user:' + em);
    if (!u || u.token !== token) {
      return res.status(401).json({ error: 'Token invalide' });
    }
    return res.status(200).json({ ok: true, user: { nom: u.nom, email: u.email, phone: u.phone, plan: u.plan } });
  }

  // LOGOUT
  if (action === 'logout') {
    if (email) {
      var em = email.toLowerCase();
      var u = await rGet('user:' + em);
      if (u) { u.token = null; await rSet('user:' + em, u); }
    }
    return res.status(200).json({ ok: true });
  }

  // UPDATE PROFILE
  if (action === 'updateProfile') {
    if (!email || !token || !b.newNom || !b.newEmail) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    var em = email.toLowerCase();
    var u = await rGet('user:' + em);
    if (!u || u.token !== token) {
      return res.status(401).json({ error: 'Non autorise' });
    }
    var newEm = b.newEmail.toLowerCase();
    var newNom = b.newNom;
    var newPhone = b.newPhone || '';

    if (newEm !== em) {
      var exists = await rGet('user:' + newEm);
      if (exists) return res.status(409).json({ error: 'Cet email est deja utilise' });
      u.nom = newNom; u.email = newEm; u.phone = newPhone;
      await rSet('user:' + newEm, u);
      await rDel('user:' + em);
      var listRaw = await rGet('user:emails');
      var list = Array.isArray(listRaw) ? listRaw : [];
      var idx = list.indexOf(em);
      if (idx !== -1) list.splice(idx, 1);
      if (list.indexOf(newEm) === -1) list.push(newEm);
      await rSet('user:emails', list);
      var ntk = genToken(); u.token = ntk;
      await rSet('user:' + newEm, u);
      return res.status(200).json({ ok: true, token: ntk, user: { nom: newNom, email: newEm, phone: newPhone } });
    }

    u.nom = newNom; u.phone = newPhone;
    await rSet('user:' + em, u);
    return res.status(200).json({ ok: true, user: { nom: newNom, email: em, phone: newPhone } });
  }

  // CHANGE PASSWORD
  if (action === 'changePassword') {
    if (!email || !token || !b.oldPassword || !b.newPassword) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    var em = email.toLowerCase();
    var u = await rGet('user:' + em);
    if (!u || u.token !== token) return res.status(401).json({ error: 'Non autorise' });
    if (u.password !== hash(b.oldPassword)) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    if (b.newPassword.length < 6) return res.status(400).json({ error: 'Minimum 6 caracteres' });
    u.password = hash(b.newPassword);
    await rSet('user:' + em, u);
    notify('🔒 MOT DE PASSE CHANGÉ\n\nNom: ' + u.nom + '\nEmail: ' + em + '\nDate: ' + now);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Action inconnue' });
};
