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
        text: message,
        parse_mode: 'HTML'
      })
    });
    return await response.json();
  } catch (err) {
    console.error('Telegram error:', err.message);
  }
}

function notifyNewSubscription(name, email, plan) {
  const planEmoji = plan === 'Premium' ? '⭐' : '🔷';
  return sendTelegram(
    `${planEmoji} NOUVEL ABONNEMENT\n\n` +
    `Client: ${name}\n` +
    `Email: ${email}\n` +
    `Formule: ${plan}\n` +
    `Statut: ✅ Actif`
  );
}

function notifyPayment(name, amount, plan) {
  return sendTelegram(
    `💰 PAIEMENT RECU\n\n` +
    `Client: ${name}\n` +
    `Montant: ${amount}€\n` +
    `Formule: ${plan}\n` +
    `Statut: ✅ Confirme`
  );
}

function notifyPaymentFailed(name) {
  return sendTelegram(
    `❌ PAIEMENT ECHEC\n\n` +
    `Client: ${name}\n` +
    `Statut: ⚠️ A relancer\n` +
    `Action: Mettre a jour le moyen de paiement`
  );
}

function notifyMaintenanceRequest(clientName, clientEmail, type, description, priority) {
  const priorityEmoji = {low:'🟢',medium:'🟡',high:'🔴'};
  const typeLabels = {modification:'Modification',bug:'Bug',design:'Design',seo:'SEO',ajout:'Ajout',autre:'Autre'};
  return sendTelegram(
    `${priorityEmoji[priority] || '📝'} DEMANDE MAINTENANCE\n\n` +
    `Client: ${clientName}\n` +
    `Email: ${clientEmail}\n` +
    `Type: ${typeLabels[type] || type}\n` +
    `Priorite: ${priorityEmoji[priority] || '🟡'}\n` +
    `Description: ${description.substring(0, 200)}`
  );
}

function notifyReminder(name, plan, amount, renewalDate) {
  return sendTelegram(
    `🛡️ RAPPEL RENOUVELLEMENT\n\n` +
    `Client: ${name}\n` +
    `Formule: ${plan}\n` +
    `Montant: ${amount}\n` +
    `Renouvellement: ${renewalDate}`
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
