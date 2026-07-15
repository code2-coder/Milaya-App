import logger from "../utils/logger.js";
import { getResend } from '../config/resend.js';
import nodemailer from 'nodemailer';

export class EmailService {
  constructor() {
    this.appName = process.env.APP_NAME || 'Milaya';
    this.clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  }

  // Helper to get Nodemailer transporter if configured
  getTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
    return null;
  }

  // Helper to format Resend from address
  getFromAddress() {
    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    return `"${this.appName}" <${emailFrom}>`;
  }

  async sendWelcomeEmail(email, name) {
    const htmlContent = `<html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111827;">Welcome, ${name}!</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Thank you for registering with Milaya. We are thrilled to have you here.</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Explore our exclusive collections and start shopping today.</p>
          <a href="${this.clientUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: bold;">Visit Store</a>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Milaya. All rights reserved.</p>
        </div>
      </body>
    </html>`;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${this.appName}!`,
      html: htmlContent
    });
  }

  async sendVerificationEmail(email, name, otp) {
    const htmlContent = `<html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111827;">Verify Your Account</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Please use the following 6-digit One Time Password (OTP) to verify your account. This OTP is valid for 10 minutes.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #111827; margin: 20px 0;">
            ${otp}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Milaya. All rights reserved.</p>
        </div>
      </body>
    </html>`;

    return this.sendEmail({
      to: email,
      subject: `Verify your ${this.appName} account`,
      html: htmlContent
    });
  }

  async sendPasswordResetEmail(email, name, otp) {
    const htmlContent = `<html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111827;">Reset Your Password</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">You requested to reset your password. Use the following 6-digit OTP to proceed. This OTP is valid for 10 minutes.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #111827; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">If you did not request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Milaya. All rights reserved.</p>
        </div>
      </body>
    </html>`;

    return this.sendEmail({
      to: email,
      subject: `Reset your ${this.appName} password`,
      html: htmlContent
    });
  }

  async sendPasswordChangedEmail(email, name) {
    const htmlContent = `<html>
      <body style="font-family: sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111827;">Password Changed Successfully</h1>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hello ${name},</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">This is a confirmation that the password for your account has been successfully changed.</p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">If you did not make this change, please contact our support team immediately.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Milaya. All rights reserved.</p>
        </div>
      </body>
    </html>`;

    return this.sendEmail({
      to: email,
      subject: `Your ${this.appName} password has been updated`,
      html: htmlContent
    });
  }

  async sendEmail({ to, subject, html }) {
    try {
      const transporter = this.getTransporter();
      if (transporter) {
        try {
          logger.info(`Sending email to ${to} via Nodemailer (Gmail SMTP)...`);
          const info = await transporter.sendMail({
            from: `"${this.appName}" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
          });
          return info;
        } catch (smtpError) {
          console.error("SMTP delivery failed, trying Resend:", smtpError.message);
        }
      }

      logger.info(`Sending email to ${to} via Resend...`);
      const resend = getResend();
      const { data, error } = await resend.emails.send({
        from: this.getFromAddress(),
        to,
        subject,
        html
      });

      if (error) {
        throw new Error(error.message || "Resend email delivery failed");
      }
      return data;
    } catch (error) {
      console.error("Email send failed:", error.message);
      throw error;
    }
  }
}

export default new EmailService();
