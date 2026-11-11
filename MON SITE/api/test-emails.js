const nodemailer = require('nodemailer');

const t = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: 'afe41f001@smtp-brevo.com', pass: 'xsmtpsib-8aba3f78940af3fa8a0a38c1266229708c637682130772613bbb6bcadd0452f8-q7FUFQaKdSJGh95q' }
});

const TO = 'cameronn.bonvallet972@gmail.com';

function baseLayout(headerGradient, headerEmoji, headerTitle, headerSubtitle, bodyContent, footerText) {
  return `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1a;color:#e0e8f0;padding:0;border-radius:16px;overflow:hidden;border:1px solid #1a2a4a;">
    <div style="background:${headerGradient};padding:40px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">${headerEmoji}</div>
      <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:700;">${headerTitle}</h1>
      <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:8px 0 0;">${headerSubtitle}</p>
    </div>
    <div style="padding:32px 40px;">
      ${bodyContent}
    </div>
    <div style="background:#0d1525;padding:20px 40px;text-align:center;border-top:1px solid #1a2a4a;">
      <p style="margin:0;font-size:13px;color:#4a6a8a;">— L'équipe MALTY</p>
      <p style="margin:4px 0 0;font-size:11px;color:#3a5a7a;">maltyshop.vercel.app</p>
    </div>
  </div>`;
}

function btn(href, text) {
  return `<div style="text-align:center;margin:32px 0;"><a href="${href}" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;">${text}</a></div>`;
}

function card(content) {
  return `<div style="background:#111f35;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">${content}</div>`;
}

const emails = [
  {
    name: '1-acceptation',
    subject: '[MALTY] Votre demande a été acceptée ✅',
    html: baseLayout(
      'linear-gradient(135deg,#22c55e,#16a34a)', '✅', 'Demande acceptée !',
      'Votre demande a été prise en compte',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Bonne nouvelle ! Votre demande a été <strong style="color:#22c55e;">acceptée</strong> par notre équipe.</p>
       ${card(`
         <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
           <span style="background:#22c55e;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">Acceptée</span>
           <span style="color:#6a8cba;font-size:13px;">Facturation / Abonnement</span>
         </div>
         <p style="color:#8ab4f8;font-size:13px;margin:0 0 8px;">Votre message :</p>
         <p style="color:#b0c4de;font-size:14px;margin:0;line-height:1.5;">Je voudrais modifier mon abonnement</p>
       `)}
       <div style="background:#0d2818;border:1px solid #166534;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
         <p style="margin:0;font-size:15px;color:#86efac;">⏱️ Votre demande sera prête dans les <strong>24 heures</strong></p>
       </div>
       ${btn('https://maltyshop.vercel.app/espace-client.html', 'Mon espace client →')}
       <p style="font-size:14px;color:#6a8cba;text-align:center;line-height:1.5;">Merci pour votre confiance !</p>`
    )
  },
  {
    name: '2-bienvenue',
    subject: '[MALTY] Bienvenue — Abonnement activé 🚀',
    html: baseLayout(
      'linear-gradient(135deg,#0066ff,#0044cc)', '🚀', 'Bienvenue chez MALTY !',
      'Votre abonnement est maintenant actif',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Merci pour votre confiance ! Votre forfait <strong style="color:#0066ff;">Premium</strong> est activé.</p>
       ${card(`
         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Forfait</td><td style="padding:8px 0;font-weight:600;color:#0066ff;font-size:16px;">Premium</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;">Prix</td><td style="padding:8px 0;font-weight:600;">39€/mois</td></tr>
         </table>
       `)}
       <div style="background:#0d1a2e;border:1px solid #1a2a4a;border-radius:12px;padding:24px;margin-bottom:24px;">
         <p style="margin:0 0 12px;font-size:14px;color:#0066ff;font-weight:600;">🚀 Ce qui est inclus :</p>
         <ul style="margin:0;padding-left:20px;">
           <li>Modifications illimitées</li>
           <li>Support prioritaire 24h</li>
           <li>Suivi SEO mensuel</li>
           <li>Analytics avancés</li>
         </ul>
       </div>
       ${btn('https://maltyshop.vercel.app/espace-client.html', 'Mon espace client →')}`
    )
  },
  {
    name: '3-paiement',
    subject: '[MALTY] Paiement confirmé ✅',
    html: baseLayout(
      'linear-gradient(135deg,#22c55e,#16a34a)', '💳', 'Paiement confirmé',
      'Votre paiement a bien été reçu',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Votre paiement a bien été reçu.</p>
       ${card(`
         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Montant</td><td style="padding:8px 0;font-weight:600;color:#22c55e;font-size:18px;">39,00€</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;">Forfait</td><td style="padding:8px 0;font-weight:600;">Premium</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;">Prochain</td><td style="padding:8px 0;">Prélèvement dans 30 jours</td></tr>
         </table>
       `)}
       <p style="font-size:14px;color:#6a8cba;text-align:center;line-height:1.5;">Merci pour votre confiance !</p>`
    )
  },
  {
    name: '4-paiement-echoue',
    subject: '[MALTY] ⚠️ Paiement échoué',
    html: baseLayout(
      'linear-gradient(135deg,#ef4444,#dc2626)', '⚠️', 'Paiement échoué',
      'Une action est requise',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Nous n'avons pas pu renouveler votre abonnement. Veuillez mettre à jour votre moyen de paiement.</p>
       <div style="background:#2a0f0f;border:1px solid #7f1d1d;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
         <p style="margin:0;font-size:15px;color:#fca5a5;">⚠️ Votre abonnement pourrait être suspendu</p>
       </div>
       ${btn('https://maltyshop.vercel.app/espace-client.html', 'Mettre à jour mon moyen de paiement →')}
       <p style="font-size:14px;color:#6a8cba;text-align:center;line-height:1.5;">Besoin d'aide ? Contactez-nous.</p>`
    )
  },
  {
    name: '5-reponse-support',
    subject: '[MALTY] Réponse à votre demande de support',
    html: baseLayout(
      'linear-gradient(135deg,#0066ff,#0044cc)', '📩', 'Réponse MALTY',
      'Concernant votre demande de support',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Nous avons traité votre demande. Voici notre réponse :</p>
       ${card(`
         <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
           <span style="background:#22c55e;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">Acceptée</span>
           <span style="color:#6a8cba;font-size:13px;">Bug / Problème technique</span>
         </div>
         <div style="background:#0d1a2e;border-left:4px solid #22c55e;padding:16px;border-radius:0 8px 8px 0;">
           <p style="margin:0;line-height:1.7;font-size:15px;">Bonjour Cameron, le problème a été identifié et corrigé. Votre site fonctionne normalement.</p>
         </div>
       `)}
       ${btn('https://maltyshop.vercel.app/espace-client.html', 'Mon espace client →')}`
    )
  },
  {
    name: '6-confirmation-support',
    subject: '[MALTY] Message bien reçu ✅',
    html: baseLayout(
      'linear-gradient(135deg,#22c55e,#16a34a)', '✅', 'Message envoyé',
      'Nous avons bien reçu votre message',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">J'ai bien reçu votre message.</p>
       ${card(`
         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Type</td><td style="padding:8px 0;font-weight:600;">Facturation / Abonnement</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Message</td><td style="padding:8px 0;line-height:1.6;">Question sur mon facture</td></tr>
         </table>
       `)}
       <div style="background:#0d1a2e;border-left:4px solid #0066ff;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
         <p style="margin:0;font-size:14px;">📅 <strong>Délai de réponse :</strong> Sous 24 heures</p>
       </div>
       <p style="font-size:14px;color:#6a8cba;text-align:center;">— L'équipe MALTY</p>`
    )
  },
  {
    name: '7-confirmation-maintenance',
    subject: '[MALTY] Demande de maintenance reçue 🔧',
    html: baseLayout(
      'linear-gradient(135deg,#f59e0b,#d97706)', '🔧', 'Demande reçue',
      'Votre demande de maintenance est en cours',
      `<p style="font-size:16px;margin:0 0 24px;">Bonjour <strong style="color:#ffffff;">Cameron</strong>,</p>
       <p style="font-size:15px;color:#b0c4de;margin:0 0 24px;line-height:1.7;">Nous avons bien reçu votre demande de maintenance.</p>
       ${card(`
         <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;width:120px;">Type</td><td style="padding:8px 0;font-weight:600;">Modification de contenu</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;">Priorité</td><td style="padding:8px 0;font-weight:600;color:#00cc66;">🟢 Normale</td></tr>
           <tr><td style="padding:8px 0;color:#6a8cba;font-size:13px;vertical-align:top;">Description</td><td style="padding:8px 0;line-height:1.6;">Modifier le numéro de téléphone sur la page d'accueil</td></tr>
         </table>
       `)}
       <div style="background:#0d1a2e;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
         <p style="margin:0;font-size:14px;">📅 <strong>Délai de traitement :</strong> 24 à 48 heures ouvrées</p>
       </div>
       <p style="font-size:14px;color:#6a8cba;text-align:center;">— L'équipe MALTY</p>`
    )
  },
  {
    name: '8-rappel-abonnement',
    subject: '[MALTY] Rappel — Renouvellement dans 2 jours ⏰',
    html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0f1a;font-family:'Segoe UI',Arial,sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1a;padding:40px 20px"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1a2e;border-radius:16px;overflow:hidden;border:1px solid #1a2a4a">
      <tr><td style="padding:32px;text-align:center;border-bottom:1px solid #1a2a4a">
        <h1 style="margin:0;font-size:24px;color:#e0e8f0">🛡️ MALTY Maintenance</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#6a8cba">Rappel de renouvellement</p>
      </td></tr>
      <tr><td style="padding:32px">
        <p style="color:#e0e8f0;font-size:16px;margin:0 0 16px">Bonjour <strong>Cameron</strong>,</p>
        <p style="color:#b0c4de;font-size:15px;margin:0 0 24px">Votre abonnement <strong style="color:#0066ff">Premium</strong> sera automatiquement renouvelé dans <strong style="color:#ff9900">2 jours</strong>.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#111f35;border-radius:12px;border:1px solid #1a2a4a;margin-bottom:24px">
          <tr>
            <td style="padding:20px;border-right:1px solid #1a2a4a;text-align:center" width="50%">
              <p style="margin:0;font-size:12px;color:#6a8cba;text-transform:uppercase">Formule</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#e0e8f0">Premium</p>
            </td>
            <td style="padding:20px;text-align:center" width="50%">
              <p style="margin:0;font-size:12px;color:#6a8cba;text-transform:uppercase">Montant</p>
              <p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#0066ff">39,00€</p>
            </td>
          </tr>
          <tr><td colspan="2" style="padding:16px 20px;border-top:1px solid #1a2a4a;text-align:center">
            <p style="margin:0;font-size:12px;color:#6a8cba">Prochain prélèvement le <strong style="color:#e0e8f0">27/06/2026</strong></p>
          </td></tr>
        </table>
        <p style="color:#b0c4de;font-size:14px;margin:0 0 24px">Le paiement sera effectué automatiquement via votre carte bancaire enregistrée chez Stripe.</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr><td style="background:#0066ff;border-radius:8px;padding:14px 28px">
          <a href="https://maltyshop.vercel.app/espace-client.html" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:14px">Mon espace client →</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:24px 32px;border-top:1px solid #1a2a4a;text-align:center">
        <p style="margin:0;font-size:11px;color:#3a5a7a">© 2026 MALTY — Maintenance de sites web professionnels</p>
      </td></tr>
    </table></td></tr></table></body></html>`
  }
];

async function sendAll() {
  let ok = 0, fail = 0;
  for (const e of emails) {
    try {
      await t.sendMail({ from: '"MALTY" <maltyz@outlook.fr>', to: TO, subject: e.subject, html: e.html });
      console.log(`✅ ${e.name} envoyé`);
      ok++;
    } catch (err) {
      console.error(`❌ ${e.name}: ${err.message}`);
      fail++;
    }
  }
  console.log(`\nTerminé: ${ok} envoyés, ${fail} échoués`);
  process.exit(0);
}

sendAll();
