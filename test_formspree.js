
const https = require('https');

function sendTestOrder() {
    const formspreeUrl = "https://formspree.io/f/xredyerp";
    const testData = JSON.stringify({
        nom: "NOUVEAU TEST FORMSpree",
        email: "test@example.com",
        formule: "Pack Premium Sur-Mesure",
        formule_prix: "899€",
        objectif: "TEST AVEC LE NOUVEAU LIEN",
        desc: "Ceci est un test avec votre nouveau lien Formspree (xredyerp).",
        _subject: "🚀 NOUVEAU TEST - MALTY"
    });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(testData)
        }
    };

    console.log("Envoi du test vers le NOUVEAU lien Formspree...");

    const req = https.request(formspreeUrl, options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log("✅ SUCCÈS : Le test a été envoyé au nouveau lien !");
            } else {
                console.error(`❌ ERREUR Formspree (Code: ${res.statusCode}):`, body);
            }
        });
    });

    req.on('error', (e) => console.error("❌ ERREUR :", e.message));
    req.write(testData);
    req.end();
}

sendTestOrder();
