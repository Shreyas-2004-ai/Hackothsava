import nodemailer from 'nodemailer';

// Email configuration - using environment variables
const createTransporter = () => {
  // For Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Gmail App Password (not regular password)
    },
  });
};

// Alternative: Using SMTP (for other email providers)
const createSMTPTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.warn('⚠️ Email credentials not configured. Email sending is disabled.');
      console.warn('Set EMAIL_USER and EMAIL_APP_PASSWORD in .env.local to enable email notifications.');
      return {
        success: false,
        message: 'Email service not configured',
      };
    }

    const transporter = process.env.SMTP_HOST 
      ? createSMTPTransporter() 
      : createTransporter();

    const mailOptions = {
      from: `"Apna Parivar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Plain text version
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: String(error),
    };
  }
}

// Send family member invitation email
export async function sendFamilyMemberInvitation(
  memberEmail: string,
  memberName: string,
  addedByName: string
) {
  const subject = `${addedByName} has added you to Apna Parivar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 40px;
            color: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 40px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .message {
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 20px;
          }
          .highlight {
            color: #667eea;
            font-weight: bold;
          }
          .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            opacity: 0.9;
          }
          .divider {
            height: 1px;
            background: rgba(255,255,255,0.3);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">👨‍👩‍👧‍👦</div>
            <h1>Apna Parivar</h1>
            <p style="opacity: 0.9; margin-top: 10px;">Family Connections for All</p>
          </div>
          
          <div class="content">
            <p class="message">
              Hello <strong>${memberName}</strong>,
            </p>
            
            <p class="message">
              Great news! <span class="highlight">${addedByName}</span> has added you to the Apna Parivar family tree.
            </p>
            
            <p class="message">
              You can now sign in to view your family tree, connect with relatives, and preserve your family heritage.
            </p>
            
            <div style="text-align: center;">
              <a href="https://apnaparivar.com/login" class="button">
                Sign In with Google
              </a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Simply visit <strong>https://apnaparivar.com</strong> and sign in with your Google account (<strong>${memberEmail}</strong>) to access your family tree.
            </p>
          </div>
          
          <div class="footer">
            <p>Welcome to the family! 👨‍👩‍👧‍👦</p>
            <p style="font-size: 12px; opacity: 0.7; margin-top: 10px;">
              This is an automated message from Apna Parivar. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${memberName},

Great news! ${addedByName} has added you to the Apna Parivar family tree.

You can now sign in to view your family tree, connect with relatives, and preserve your family heritage.

Simply visit https://apnaparivar.com and sign in with your Google account (${memberEmail}) to access your family tree.

Welcome to the family!

---
This is an automated message from Apna Parivar. Please do not reply to this email.
  `;

  return sendEmail({
    to: memberEmail,
    subject,
    html,
    text,
  });
}

