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

const logSkippedEmail = (options) => {
    const previewText = options.html || '';
    const urlMatch = previewText.match(/https?:\/\/[^\s"']+/i);

    console.warn('Email delivery skipped in development:');
    console.warn(`To: ${options.email}`);
    console.warn(`Subject: ${options.subject}`);

    if (urlMatch) {
        console.warn(`Preview link: ${urlMatch[0]}`);
    }
};

const sendEmail = async (options) => {
    try {
        const auth = getGmailAuth();

        // 1. Create the Transporter (The Postman)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: auth.user,
                pass: auth.pass
            }
        });

        // 2. Define the Email
        const mailOptions = {
            from: `"Cinema Booking System" <${auth.user}>`,
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        // 3. Send it
        await transporter.sendMail(mailOptions);
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[emailService] ${error.message}`);
            logSkippedEmail(options);
            return { skipped: true };
        }

        throw error;
    }
};

module.exports = sendEmail;