require('dotenv').config();
const nodemailer = require('nodemailer');
const { getGmailAuth } = require('./emailConfig');

const isAuthError = (error) => {
  const message = error?.message || '';
  return (
    error?.responseCode === 535 ||
    /535-5\.7\.8|BadCredentials|Username and Password not accepted|Invalid login/i.test(message)
  );
};

const logSkippedEmail = (to, subject, text, html) => {
  const previewText = html || text || '';
  const urlMatch = previewText.match(/https?:\/\/[^\s"']+/i);

  console.warn('Email delivery skipped in development:');
  console.warn(`To: ${to}`);
  console.warn(`Subject: ${subject}`);

  if (urlMatch) {
    console.warn(`Preview link: ${urlMatch[0]}`);
  } else if (previewText) {
    console.warn(`Preview text: ${previewText}`);
  }
};

const sendEmail = async (to, subject, text, html) => {
  try {
    const auth = getGmailAuth();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
    });

    const mailOptions = {
      from: auth.user,
      to,
      subject,
    };

    if (html) {
      mailOptions.html = html;
    } else {
      mailOptions.text = text;
    }

    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');
  } catch (error) {
    if (process.env.NODE_ENV !== 'production' && isAuthError(error)) {
      console.warn(error.message);
      logSkippedEmail(to, subject, text, html);
      return { skipped: true };
    }

    console.error('Email Error:', error);
    throw error;
  }
};

module.exports = sendEmail;