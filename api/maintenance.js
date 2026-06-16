const RESEND_API_KEY = process.env.RESEND_API_KEY;

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

function emailToMalty(clientName, clientEmail, type, description, priority) {
  const typeLabels = {modification:'Modification de contenu',bug:'Signaler un bug',design:'Changement de design',seo:'Optimisation SEO',ajout:'Ajout de fonctionnalité',autre:'Autre'};
  const priorityLabels = {low:'🟢 Normale',medium:'🟡 Moyenne',high:'🔴 Urgente'};
  const priorityColors = {low:'#00cc66',medium:'#ff9900',high:'#ff3333'};

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:40px;border-radius:12px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:#0066ff;width:60px;height:60px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;">M</div>
    </div>
    <h1 style="color:#0066ff;font-size:22px;text-align:center;margin-bottom:8px;">📝 Nouvelle demande de maintenance</h1>
    <p style="color:#6a8cba;text-align:center;margin-bottom:32px;">Un client a soumis une demande depuis l'espace client.</p>
    <div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Client</td>
          <td style="padding:8px 0;font-weight:600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${clientEmail}" style="color:#0066ff;text-decoration:none;">${clientEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Type</td>
          <td style="padding:8px 0;font-weight:600;">${typeLabels[type] || type}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;">Priorité</td>
          <td style="padding:8px 0;font-weight:600;color:${priorityColors[priority] || '#e0e8f0'};">${priorityLabels[priority] || priority}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Description</td>
          <td style="padding:8px 0;line-height:1.6;">${description.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="mailto:${clientEmail}" style="display:inline-block;background:#0066ff;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Répondre au client</a>
    </div>
    <p style="color:#6a8cba;font-size:11px;text-align:center;margin-top:32px;">— MALTY Espace Client</p>
  </div>`;
}

function confirmationToClient(clientName, type, description) {
  const typeLabels = {modification:'Modification de contenu',bug:'Signaler un bug',design:'Changement de design',seo:'Optimisation SEO',ajout:'Ajout de fonctionnalité',autre:'Autre'};

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:40px;border-radius:12px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="background:#0066ff;width:60px;height:60px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;">M</div>
    </div>
    <h1 style="color:#00cc66;font-size:22px;text-align:center;margin-bottom:8px;">✅ Demande reçue</h1>
    <p style="color:#6a8cba;text-align:center;margin-bottom:32px;">Bonjour ${clientName}, nous avons bien reçu votre demande.</p>
    <div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Type</td>
          <td style="padding:8px 0;font-weight:600;">${typeLabels[type] || type}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Description</td>
          <td style="padding:8px 0;line-height:1.6;">${description.replace(/\n/g, '<br>')}</td>
        </tr>
      </table>
    </div>
    <div style="background:#0d1a2e;border-left:4px solid #0066ff;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;">📅 <strong>Délai de traitement :</strong> 24 à 48 heures ouvrées</p>
    </div>
    <p style="color:#6a8cba;font-size:13px;text-align:center;">Vous recevrez un email une fois la demande traitée.</p>
    <p style="color:#6a8cba;font-size:11px;text-align:center;margin-top:32px;">— L'équipe MALTY</p>
  </div>`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clientName, clientEmail, type, description, priority } = req.body;

    if (!clientName || !clientEmail || !type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const typeLabels = {modification:'Modification',bug:'Bug',design:'Design',seo:'SEO',ajout:'Ajout',autre:'Autre'};
    const priorityEmoji = {low:'🟢',medium:'🟡',high:'🔴'};

    const TEST_EMAIL = 'cameronn.bonvallet972@gmail.com';

    await sendEmail(
      TEST_EMAIL,
      `${priorityEmoji[priority] || '📝'} Nouvelle demande ${typeLabels[type] || type} — ${clientName}`,
      emailToMalty(clientName, clientEmail, type, description, priority)
    );

    await sendEmail(
      TEST_EMAIL,
      `✅ [Copie] Confirmation demande ${clientName} — MALTY`,
      confirmationToClient(clientName, type, description)
    );

    return res.status(200).json({ success: true, message: 'Emails envoyés avec succès' });

  } catch (error) {
    console.error('Maintenance email error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
