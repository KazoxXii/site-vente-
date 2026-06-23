module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { clientName, requestType, clientMessage, tone } = req.body || {};

  if (!clientMessage) {
    return res.status(400).json({ error: 'Message du client requis' });
  }

  const name = clientName || 'Client';
  const type = requestType || 'Support technique';
  const msg = clientMessage.toLowerCase();
  const t = tone || 'professionnel';

  let response = '';

  if (type === 'Maintenance') {
    if (msg.includes('bug') || msg.includes('erreur') || msg.includes('ne fonctionne pas') || msg.includes('plant')) {
      response = `Bonjour ${name},\n\nMerci pour votre signalement. Nous avons bien pris note du problème rencontré.\n\nNotre équipe technique va analyser la situation dans les plus brefs délais. En général, ce type de problème est résolu sous 24 à 48h ouvrées.\n\nNous reviendrons vers vous dès que le correctif sera en place. Si le problème persiste d'ici là, n'hésitez pas à nous recontacter.\n\nCordialement,\nL'équipe MALTY`;
    } else if (msg.includes('lent') || msg.includes('performance') || msg.includes('chargement')) {
      response = `Bonjour ${name},\n\nMerci de nous avoir signalé ce souci de performance. Nous allons examiner les temps de chargement de votre site pour identifier l'origine du ralentissement.\n\nNos optimizations incluent généralement : la compression des images, la mise en cache et l'optimisation du code. Nous reviendrons vers vous avec un compte-rendu dès que possible.\n\nCordialement,\nL'équipe MALTY`;
    } else if (msg.includes('modification') || msg.includes('changer') || msg.includes('update') || msg.includes('modifier')) {
      response = `Bonjour ${name},\n\nBien reçu votre demande de modification. Pouvez-vous nous préciser exactement les éléments que vous souhaitez faire changer ?\n\nCela nous permettra de préparer l'intervention et de vous confirmer un délai de réalisation.\n\nDans l'attente de vos indications,\nL'équipe MALTY`;
    } else {
      response = `Bonjour ${name},\n\nMerci de nous avoir contactés concernant ${type.toLowerCase()}.\n\nNous avons bien reçu votre demande et notre équipe l'examine en ce moment même. Nous reviendrons vers vous très rapidement avec une solution adaptée.\n\nN'hésitez pas à nous envoyer des informations complémentaires si nécessaire.\n\nCordialement,\nL'équipe MALTY`;
    }
  } else if (type === 'Abonnement') {
    if (msg.includes('annul') || msg.includes('résilie') || msg.includes('stop')) {
      response = `Bonjour ${name},\n\nNous avons bien pris en compte votre demande concernant votre abonnement.\n\nPourriez-vous nous indiquer la raison de votre souhait d'annulation ? Cela nous permettrait de voir si nous pouvons trouver une solution qui vous conviendrait mieux.\n\nEn attendant, votre abonnement restera actif jusqu'à la fin de la période en cours.\n\nCordialement,\nL'équipe MALTY`;
    } else if (msg.includes('changer') || msg.includes('passer') || msg.includes('upgrade') || msg.includes('formule')) {
      response = `Bonjour ${name},\n\nMerci pour votre intérêt concernant le changement de formule !\n\nNous pouvons tout à fait procéder à une modification de votre abonnement. Voici nos offres disponibles :\n\n• Essentiel (19€/mois) — Site vitrine optimisé\n• Premium (39€/mois) — Site complet + fonctionnalités avancées\n\nDites-nous quelle formule vous intéresse et nous effectuerons le changement immédiatement.\n\nCordialement,\nL'équipe MALTY`;
    } else {
      response = `Bonjour ${name},\n\nMerci pour votre message concernant votre abonnement.\n\nNous sommes là pour vous accompagner. Que souhaitez-vous savoir ou modifier ? N'hésitez pas à nous décrire votre besoin en détail.\n\nCordialement,\nL'équipe MALTY`;
    }
  } else if (type === 'Demande de devis') {
    if (msg.includes('prix') || msg.includes('tarif') || msg.includes('coût') || msg.includes('combien')) {
      response = `Bonjour ${name},\n\nMerci pour votre demande de devis ! Voici un résumé de nos prestations :\n\n• Landing Page — 99€ (one-shot)\n• Site Vitrine — Sur devis\n• Maintenance mensuelle — 19€ ou 39€/mois\n• SEO & Référencement — Sur devis\n\nPour un devis précis, pourriez-vous nous décrire plus en détail votre projet ? (nombre de pages, fonctionnalités souhaitées, délais...)\n\nNous reviendrons vers vous avec une offre personnalisée sous 24h.\n\nCordialement,\nL'équipe MALTY`;
    } else {
      response = `Bonjour ${name},\n\nMerci pour votre demande de devis ! Nous sommes ravis de votre intérêt.\n\nAfin de vous proposer l'offre la plus adaptée à vos besoins, pourriez-vous nous en dire plus sur votre projet ?\n\n• Type de site souhaité\n• Nombre de pages approximatif\n• Fonctionnalités spécifiques\n• Délai souhaité\n\nNous préparons votre devis personnalisé dans les plus brefs délais.\n\nCordialement,\nL'équipe MALTY`;
    }
  } else if (type === 'Support technique') {
    if (msg.includes('connexion') || msg.includes('login') || msg.includes('mot de passe') || msg.includes('compte')) {
      response = `Bonjour ${name},\n\nNous comprenons votre problème de connexion. Voici quelques étapes à vérifier :\n\n1. Vérifiez que votre adresse email est correcte\n2. Assurez-vous que votre mot de passe est bien saisi\n3. Essayez de réinitialiser votre mot de passe depuis la page de connexion\n\nSi le problème persiste, nous pouvons réinitialiser votre accès manuellement. Dites-nous comment vous souhaitez procéder.\n\nCordialement,\nL'équipe MALTY`;
    } else if (msg.includes('email') || msg.includes('mail') || msg.includes('reçu')) {
      response = `Bonjour ${name},\n\nMerci de nous avoir signalé ce problème d'email.\n\nVeuillez vérifier :\n1. Votre dossier spam/courriers indésirables\n2. Que votre adresse email est bien à jour dans votre profil\n3. Que les notifications sont activées dans votre espace client\n\nSi le problème persiste, nous allons investiguer de notre côté et reviendrons vers vous rapidement.\n\nCordialement,\nL'équipe MALTY`;
    } else {
      response = `Bonjour ${name},\n\nMerci de nous avoir contactés pour ${type.toLowerCase()}.\n\nNous avons bien reçu votre demande et notre équipe technique va l'analyser. Nous reviendrons vers vous avec une solution dans les plus brefs délais.\n\nN'hésitez pas à nous fournir des captures d'écran ou des détails supplémentaires qui pourraient nous aider à résoudre le problème plus rapidement.\n\nCordialement,\nL'équipe MALTY`;
    }
  } else {
    if (msg.includes('merci') || msg.includes('super') || msg.includes('parfait') || msg.includes('génial')) {
      response = `Bonjour ${name},\n\nMerci beaucoup pour votre retour positif ! Nous sommes ravis que tout soit en ordre.\n\nN'hésitez pas à nous recontacter si vous avez la moindre question ou si besoin d'une assistance supplémentaire.\n\nBelle journée !\nL'équipe MALTY`;
    } else if (msg.includes('urgence') || msg.includes('urgent') || msg.includes('asap') || msg.includes('rapidement')) {
      response = `Bonjour ${name},\n\nNous avons bien noté l'urgence de votre demande. Notre équipe traite votre demande en priorité.\n\nNous reviendrons vers vous dans les plus brefs délais avec une solution. Si votre situation est critique, n'hésitez pas à nous joindre directement par email à maltyz@outlook.fr.\n\nCordialement,\nL'équipe MALTY`;
    } else {
      response = `Bonjour ${name},\n\nMerci pour votre message. Nous avons bien reçu votre demande et nous l'examinons en ce moment.\n\nNous reviendrons vers vous très rapidement avec une réponse adaptée.\n\nCordialement,\nL'équipe MALTY`;
    }
  }

  return res.status(200).json({ response: response });
};
