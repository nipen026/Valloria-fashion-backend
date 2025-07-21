const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendInvoiceEmail = async (to, orderId, filePath) => {
  const info = await transporter.sendMail({
    from: `"Vogue Vastra" <${process.env.SMTP_USER}>`,
    to,
    subject: `Invoice for Order #${orderId}`,
    text: `Thanks for shopping with Vogue Vastra!\nPlease find your invoice for Order #${orderId} attached.`,
    attachments: [
      {
        filename: `invoice-${orderId}.pdf`,
        path: filePath,
      }
    ]
  });

  console.log('Invoice email sent:', info.messageId);
};

module.exports = sendInvoiceEmail;
