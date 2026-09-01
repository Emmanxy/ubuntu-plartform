import nodemailer from 'nodemailer';
import { db } from '../dataStore';

export interface EmailDispatchResult {
  sentRealEmail: boolean;
  messageId?: string;
  error?: string;
  previewCode?: string;
  previewToken?: string;
}

export class EmailService {
  private static getTransporter() {
    // 1. Gmail configuration
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.GMAIL_PASS;

    if (gmailUser && gmailPass) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });
    }

    // 2. Generic SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    }

    return null;
  }

  /**
   * Dispatch account verification email with both 6-digit code and direct 1-click token link
   */
  static async sendVerificationEmail(params: {
    to: string;
    username: string;
    code: string;
    token: string;
    baseUrl?: string;
  }): Promise<EmailDispatchResult> {
    const { to, username, code, token, baseUrl } = params;
    
    // Resolve base URL for verification link
    const appUrl = baseUrl || process.env.APP_URL || 'http://localhost:3000';
    const verifyLink = `${appUrl}/?verifyToken=${encodeURIComponent(token)}`;
    const directApiLink = `${appUrl}/api/auth/verify-token?token=${encodeURIComponent(token)}`;

    const subject = 'Verify Your Zululand Games Account 🛡️ (Verification Code: ' + code + ')';
    
    const textBody = `Sawubona ${username}!
    
Thank you for joining the Zululand Games Heritage Platform.

To activate your account and access the Game Registry and Game Creation Studio, please verify your email address.

Your 6-Digit Verification Code: ${code}

Or click the link below to verify your account automatically:
${verifyLink}

This verification link and code will remain valid for 24 hours.

If you did not request this registration, please disregard this message.

Warm regards,
The Zululand Games Heritage Team
`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Zululand Games Account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0a09; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="580" style="max-width: 580px; background-color: #1c1917; border-radius: 16px; border: 1px solid #78350f; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #451a03 0%, #1c1917 100%); padding: 32px 30px; text-align: center; border-bottom: 2px solid #d97706;">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #f59e0b; letter-spacing: -0.5px;">
                🛡️ ZULULAND GAMES
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #fde68a; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                African Indigenous Gaming & Heritage Platform
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #fafaf9;">
                Sawubona, ${username}!
              </h2>
              
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d6d3d1;">
                Welcome to the Zululand Games community. You have taken the first step to preserving, exploring, and creating traditional African board, pebble, and strategy games.
              </p>

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #d6d3d1;">
                Please verify your email address (<strong>${to}</strong>) before signing in:
              </p>

              <!-- 6-Digit Code Box -->
              <div style="background-color: #0c0a09; border: 2px dashed #f59e0b; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 28px;">
                <span style="display: block; font-size: 12px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                  Your 6-Digit Security Code
                </span>
                <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #fef08a; padding-left: 10px;">
                  ${code}
                </span>
                <span style="display: block; font-size: 12px; color: #a8a29e; margin-top: 8px;">
                  Valid for 24 hours
                </span>
              </div>

              <!-- Action Button Link -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${verifyLink}" style="display: inline-block; background-color: #f59e0b; color: #1c1917; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);">
                  Verify Email & Activate Account &rarr;
                </a>
              </div>

              <p style="margin: 0 0 10px 0; font-size: 12px; color: #78716c; text-align: center;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <p style="margin: 0; font-size: 11px; word-break: break-all; color: #d97706; text-align: center; background-color: #0c0a09; padding: 10px; border-radius: 8px;">
                <a href="${verifyLink}" style="color: #f59e0b; text-decoration: underline;">${verifyLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #141210; padding: 24px 30px; text-align: center; border-top: 1px solid #292524;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #a8a29e;">
                Zululand Games Platform &bull; Celebrating African Strategic Heritage
              </p>
              <p style="margin: 0; font-size: 11px; color: #57534e;">
                If you did not register for an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 1. Always record in DB simulated inbox for guaranteed in-app preview
    db.addEmail({
      to,
      subject,
      type: 'VERIFICATION',
      code,
      token,
      body: `Sawubona ${username}! Your 6-digit verification code is: ${code}. Alternatively, use the direct verification link: ${verifyLink}`
    });

    // 2. Attempt real email delivery via Nodemailer if configured
    const transporter = this.getTransporter();
    let sentRealEmail = false;
    let messageId: string | undefined;
    let error: string | undefined;

    if (transporter) {
      try {
        const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'no-reply@zulugames.org';
        const info = await transporter.sendMail({
          from: `"Zululand Games" <${fromAddress}>`,
          to,
          subject,
          text: textBody,
          html: htmlBody
        });
        sentRealEmail = true;
        messageId = info.messageId;
        console.log(`[EmailService] Real verification email successfully sent to ${to} (MessageID: ${info.messageId})`);
      } catch (err: any) {
        console.error(`[EmailService] Failed to send real email via Nodemailer:`, err.message);
        error = err.message;
      }
    } else {
      console.log(`[EmailService] SMTP credentials not detected in env. Verification recorded in simulated inbox for ${to}.`);
    }

    return {
      sentRealEmail,
      messageId,
      error,
      previewCode: code,
      previewToken: token
    };
  }

  /**
   * Dispatch password reset email
   */
  static async sendPasswordResetEmail(params: {
    to: string;
    username: string;
    token: string;
    baseUrl?: string;
  }): Promise<EmailDispatchResult> {
    const { to, username, token, baseUrl } = params;
    const appUrl = baseUrl || process.env.APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/?resetToken=${encodeURIComponent(token)}`;

    const subject = 'Password Reset Request - Zululand Games';
    const textBody = `Sawubona ${username}! We received a request to reset your password. Use reset token: ${token} or follow ${resetLink}`;
    
    db.addEmail({
      to,
      subject,
      type: 'PASSWORD_RESET',
      token,
      body: textBody
    });

    const transporter = this.getTransporter();
    let sentRealEmail = false;
    let messageId: string | undefined;
    let error: string | undefined;

    if (transporter) {
      try {
        const fromAddress = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'no-reply@zulugames.org';
        const info = await transporter.sendMail({
          from: `"Zululand Games" <${fromAddress}>`,
          to,
          subject,
          text: textBody,
          html: `<p>Sawubona ${username},</p><p>Use reset token: <strong>${token}</strong> or click <a href="${resetLink}">here</a> to reset your password.</p>`
        });
        sentRealEmail = true;
        messageId = info.messageId;
      } catch (err: any) {
        console.error(`[EmailService] Failed to send password reset email:`, err.message);
        error = err.message;
      }
    }

    return {
      sentRealEmail,
      messageId,
      error,
      previewToken: token
    };
  }
}
