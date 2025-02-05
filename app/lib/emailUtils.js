import nodemailer from "nodemailer";

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendTicketConfirmationEmail = async (ticket) => {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3068b2;">IT Help Desk Ticket Confirmation</h2>
      <p>Hello ${ticket.name},</p>
      <p>Your IT support ticket has been successfully created. Here are the details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Ticket ID:</strong> ${ticket._id}</li>
          <li><strong>Issue:</strong> ${ticket.issue}</li>
          <li><strong>Department:</strong> ${ticket.department}</li>
          <li><strong>Status:</strong> ${ticket.status}</li>
        </ul>
      </div>
      
      <p>We will review your ticket and get back to you as soon as possible.</p>
      
      <p style="margin-top: 20px;">Best regards,<br>IT Help Desk Team</p>
      
      <div style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: ticket.email,
      subject: `IT Help Desk Ticket Confirmation - ${ticket._id}`,
      html: emailTemplate,
    });
    console.log("Confirmation email sent successfully");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Don't throw the error to prevent ticket creation from failing
  }
};

export const sendTicketUpdateEmail = async (ticket, updateType = "status") => {
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3068b2;">IT Help Desk Ticket Update</h2>
      <p>Hello ${ticket.name},</p>
      <p>Your IT support ticket has been updated. Here are the current details:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Ticket Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Ticket ID:</strong> ${ticket._id}</li>
          <li><strong>Issue:</strong> ${ticket.issue}</li>
          <li><strong>Department:</strong> ${ticket.department}</li>
          <li><strong>Status:</strong> ${ticket.status}</li>
        </ul>
      </div>
      
      <p>We will continue to keep you updated on any changes.</p>
      
      <p style="margin-top: 20px;">Best regards,<br>IT Help Desk Team</p>
      
      <div style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: ticket.email,
      subject: `IT Help Desk Ticket Update - ${ticket._id}`,
      html: emailTemplate,
    });
    console.log("Update email sent successfully");
  } catch (error) {
    console.error("Error sending update email:", error);
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  // Use default URL if environment variable is not set
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3068b2;">Password Reset Request</h2>
      <p>Hello ${user.username},</p>
      <p>A password reset has been requested for your account. Click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #3068b2; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email or contact your administrator.</p>
      
      <p style="margin-top: 20px;">Best regards,<br>IT Help Desk Team</p>
      
      <div style="font-size: 12px; color: #666; margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: emailTemplate,
    });
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
