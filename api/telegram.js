const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Telegram config missing');
    return;
  }
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });
    return await response.json();
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

function notifyNewSubscription(data) {
  return sendTelegram(
    `⭐ NOUVEL ABONNEMENT\n\n` +
    `👤 Client: ${data.name}\n` +
    `📧 Email: ${data.email}\n` +
    `🌐 Domaine: ${data.domain}\n` +
    `🔷 Formule: ${data.plan}\n` +
    `💰 Montant: ${data.amount}/mois\n` +
    `🆔 Session: ${data.sessionId}\n` +
    `📅 Date: ${data.date}\n` +
    `Statut: ✅ Actif`
  );
}

function notifyPayment(data) {
  return sendTelegram(
    `💰 PAIEMENT RECU\n\n` +
    `👤 Client: ${data.name}\n` +
    `📧 Email: ${data.email}\n` +
    `🔷 Formule: ${data.plan}\n` +
    `💰 Montant: ${data.amount}€\n` +
    `🆔 Facture: ${data.invoiceId}\n` +
    `🔗 Lien: ${data.invoiceUrl}\n` +
    `📅 Date: ${data.date}\n` +
    `Statut: ✅ Confirme`
  );
}

function notifyPaymentFailed(data) {
  return sendTelegram(
    `❌ PAIEMENT ECHEC\n\n` +
    `👤 Client: ${data.name}\n` +
    `📧 Email: ${data.email}\n` +
    `🆔 Facture: ${data.invoiceId}\n` +
    `🔗 Lien: ${data.invoiceUrl}\n` +
    `📅 Date: ${data.date}\n` +
    `Statut: ⚠️ A relancer\n` +
    `Action: Client doit mettre a jour sa carte`
  );
}

function notifyMaintenanceRequest(data) {
  const priorityEmoji = {low:'🟢 Normale',medium:'🟡 Moyenne',high:'🔴 Urgente'};
  const typeLabels = {modification:'Modification de contenu',bug:'Signaler un bug',design:'Changement de design',seo:'Optimisation SEO',ajout:'Ajout de fonctionnalite',autre:'Autre'};
  return sendTelegram(
    `📝 DEMANDE MAINTENANCE\n\n` +
    `👤 Client: ${data.clientName}\n` +
    `📧 Email: ${data.clientEmail}\n` +
    `📂 Type: ${typeLabels[data.type] || data.type}\n` +
    `🚦 Priorite: ${priorityEmoji[data.priority] || '🟡 Moyenne'}\n` +
    `💬 Description:\n${data.description.substring(0, 300)}\n\n` +
    `📅 Date: ${data.date}\n` +
    `⚡ Action requise`
  );
}

function notifyReminder(data) {
  return sendTelegram(
    `🛡️ RAPPEL RENOUVELLEMENT\n\n` +
    `👤 Client: ${data.name}\n` +
    `📧 Email: ${data.email}\n` +
    `🔷 Formule: ${data.plan}\n` +
    `💰 Montant: ${data.amount}\n` +
    `📅 Renouvellement: ${data.renewalDate}\n\n` +
    `Email de rappel envoye au client.`
  );
}

module.exports = {
  sendTelegram,
  notifyNewSubscription,
  notifyPayment,
  notifyPaymentFailed,
  notifyMaintenanceRequest,
  notifyReminder
};
