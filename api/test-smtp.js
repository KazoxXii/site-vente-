const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: process.env.BREVO_SMTP_LOGIN, pass: process.env.BREVO_SMTP_KEY }
});
t.verify()
  .then(() => {
    console.log('SMTP Brevo connecte !');
    return t.sendMail({
      from: '"MALTY" <maltyz@outlook.fr>',
      to: 'maltyz@outlook.fr',
      subject: 'Test SMTP Brevo MALTY',
      html: '<h1>Brevo fonctionne !</h1>'
    });
  })
  .then(r => { console.log('Email envoye:', r.messageId); process.exit(0); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
