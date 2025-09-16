import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default function mail(
  name: string,
  email: string,
  subject: string,
  html: string
) {
  const mailOptions = {
    from: `"Zynvo Team" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject: subject,
    html: html,
  };

  // Send email asynchronously without blocking
  transporter.sendMail(mailOptions)
    .then((info) => {
      console.log('Email sent:', info.messageId);
    })
    .catch((error) => {
      console.log('Email error:', error);
    });
}
