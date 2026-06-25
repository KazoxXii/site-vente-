const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: 'afe41f001@smtp-brevo.com', pass: 'xsmtpsib-8aba3f78940af3fa8a0a38c1266229708c637682130772613bbb6bcadd0452f8-q7FUFQaKdSJGh95q' }
});
t.verify()
  .then(() => {
    console.log('SMTP connecte !');
    return t.sendMail({
      from: '"MALTY" <maltyz@outlook.fr>',
      to: 'cameronn.bonvallet38@gmail.com',
      subject: '[MALTY] Test de confirmation',
      html: '<h1>Test Brevo</h1><p>Si tu recois cet email, tout marche !</p>'
    });
  })
  .then(r => { console.log('Email envoye:', r.messageId); process.exit(0); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
