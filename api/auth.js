const crypto = require('crypto');
const { sendTelegram } = require('./telegram');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Maman972lol';
const JWT_SECRET = process.env.JWT_SECRET || 'malty-admin-secret-2026-secure';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Simple token-based auth (no JWT library needed)
function createToken(password) {
  if (password !== ADMIN_PASSWORD) return null;
  
  const payload = {
    authenticated: true,
    created: Date.now(),
    expires: Date.now() + TOKEN_EXPIRY
  };
  
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  
  return `${data}.${signature}`;
}

function verifyToken(token) {
  if (!token) return false;
  
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return false;
    
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('hex');
    if (signature !== expectedSig) return false;
    
    const payload = JSON.parse(Buffer.from(data, 'base64').toString());
    
    if (!payload.authenticated) return false;
    if (Date.now() > payload.expires) return false;
    
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://maltyshop.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `https://${req.headers.host}`);
  const action = url.searchParams.get('action');

  // Login
  if (req.method === 'POST' && action === 'login') {
    const { password } = req.body || {};
    
    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }
    
    const token = createToken(password);
    
    if (!token) {
      await sendTelegram(`⚠️ TENTATIVE DE CONNEXION ECHEC\n\nIP: ${req.headers['x-forwarded-for'] || 'Inconnue'}\nDate: ${new Date().toLocaleString('fr-FR', {timeZone: 'Europe/Paris'})}`);
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    // Set httpOnly cookie
    res.setHeader('Set-Cookie', `admin_token=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    
    await sendTelegram(`🔓 CONNEXION ADMIN\n\nDate: ${new Date().toLocaleString('fr-FR', {timeZone: 'Europe/Paris'})}`);
    
    return res.status(200).json({ ok: true, message: 'Connecté' });
  }

  // Check session
  if (req.method === 'GET' && action === 'check') {
    const cookies = req.headers.cookie || '';
    const tokenMatch = cookies.match(/admin_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    if (verifyToken(token)) {
      return res.status(200).json({ authenticated: true });
    }
    
    return res.status(401).json({ authenticated: false });
  }

  // Logout
  if (req.method === 'POST' && action === 'logout') {
    res.setHeader('Set-Cookie', `admin_token=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Action invalide' });
};
