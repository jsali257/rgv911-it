require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Log the configuration for debugging
console.log('Email configuration:', {
  host: 'smtp.gmail.com',
  port: 587,
  user: process.env.SMTP_USER
});

const testTicket = {
  _id: 'TEST-123',
  name: 'Test User',
  email: process.env.SMTP_USER,
  issue: 'Test Ticket',
  department: 'IT',
  status: 'Open'
};

async function sendTestEmail() {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3068b2;">IT Help Desk Ticket Confirmation</h2>
      <p>Hello ${testTicket.name},</p>
      <p>Your IT support ticket has been successfully created. Here are the details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Ticket ID:</strong> ${testTicket._id}</li>
          <li><strong>Issue:</strong> ${testTicket.issue}</li>
          <li><strong>Department:</strong> ${testTicket.department}</li>
          <li><strong>Status:</strong> ${testTicket.status}</li>
        </ul>
      </div>
      
      <p>We will review your ticket and get back to you as soon as possible.</p>
      
      <p style="margin-top: 20px;">Best regards,<br>IT Help Desk Team</p>
    </div>
  `;

  try {
    console.log('Attempting to send test email...');
    const info = await transporter.sendMail({
      from: {
        name: 'RGV911 IT Help Desk',
        address: process.env.SMTP_USER
      },
      to: testTicket.email,
      subject: `IT Help Desk Ticket Confirmation - ${testTicket._id}`,
      html: emailTemplate,
    });
    console.log('Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  }
}

sendTestEmail();
