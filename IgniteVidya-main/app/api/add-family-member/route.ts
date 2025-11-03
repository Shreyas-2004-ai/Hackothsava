import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { name, relation, email, customFields, addedBy } = formData;

    // Here you would typically:
    // 1. Save the family member to your database
    // 2. Send an email notification

    // For now, we'll simulate the email sending process
    const emailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Apna Parivar!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">You've been added to a family tree!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              <strong>${addedBy || 'A family member'}</strong> has added you to their Apna Parivar family tree as their <strong>${relation}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">What is Apna Parivar?</h3>
              <p style="color: #666; margin-bottom: 0;">
                Apna Parivar is a family tree management platform that helps families stay connected, 
                preserve their heritage, and share memories across generations.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ApnaParivar.com" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                Sign In with Google Account
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              You can sign in at <a href="https://ApnaParivar.com" style="color: #667eea;">ApnaParivar.com</a> 
              using your Google account to view and manage your family tree.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              This email was sent because you were added to a family tree on Apna Parivar.<br>
              If you believe this was sent in error, please contact support.
            </p>
          </div>
        </body>
      </html>
    `;

    // In a real implementation, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    // etc.

    console.log(`Email would be sent to: ${email}`);
    console.log(`Subject: You've been added to ${addedBy || 'a family member'}'s Apna Parivar family tree`);
    console.log('Email content:', emailContent);

    // Simulate successful email sending
    return NextResponse.json({
      success: true,
      message: `Family member ${name} has been added successfully. Email notification sent to ${email}.`
    });

  } catch (error) {
    console.error('Error adding family member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add family member' },
      { status: 500 }
    );
  }
}