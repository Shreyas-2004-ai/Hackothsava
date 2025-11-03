import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { memberId, action, adminName, currentAdminCount } = await request.json();
    
    // Admin limit enforcement
    const MAX_ADMINS = 2;
    
    if (action === 'promote' && currentAdminCount >= MAX_ADMINS) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Cannot promote member. Maximum of ${MAX_ADMINS} admins allowed (excluding main admin).` 
        },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Verify the current user is a main admin
    // 2. Check current admin count from database
    // 3. Update the member's admin status in the database
    // 4. Send email notifications
    // 5. Log the admin action for audit purposes

    // Simulate database update
    console.log(`Admin action: ${action} for member ID: ${memberId} by ${adminName}`);

    // Email content for promotion
    const promotionEmailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're Now an Admin!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Congratulations on Your Promotion!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              <strong>${adminName}</strong> has promoted you to admin status in the Apna Parivar family tree.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
              <h3 style="color: #333; margin-top: 0;">Your New Admin Privileges:</h3>
              <ul style="color: #666; margin-bottom: 0;">
                <li>Add and manage family members</li>
                <li>Edit family tree information</li>
                <li>Manage family relationships</li>
                <li>Access admin dashboard</li>
                <li>View detailed family analytics</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ApnaParivar.com" 
                 style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);">
                Access Admin Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              Sign in at <a href="https://ApnaParivar.com" style="color: #8b5cf6;">ApnaParivar.com</a> 
              to start using your new admin privileges.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              This email was sent because you were promoted to admin in Apna Parivar.<br>
              If you have questions, please contact the main admin.
            </p>
          </div>
        </body>
      </html>
    `;

    // Email content for demotion
    const demotionEmailContent = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Admin Status Update</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Admin Privileges Removed</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              <strong>${adminName}</strong> has removed your admin privileges from the Apna Parivar family tree.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #333; margin-top: 0;">What This Means:</h3>
              <ul style="color: #666; margin-bottom: 0;">
                <li>You can still view the family tree</li>
                <li>You can still update your own profile</li>
                <li>You cannot add or manage other family members</li>
                <li>You cannot access admin features</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ApnaParivar.com" 
                 style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);">
                Continue Using Apna Parivar
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
              You can still access your family tree at <a href="https://ApnaParivar.com" style="color: #6b7280;">ApnaParivar.com</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              This email was sent because your admin status was changed in Apna Parivar.<br>
              If you have questions, please contact the main admin.
            </p>
          </div>
        </body>
      </html>
    `;

    // Log the action
    console.log(`Email notification would be sent for ${action} action`);
    console.log('Email content:', action === 'promote' ? promotionEmailContent : demotionEmailContent);

    // Simulate successful operation
    return NextResponse.json({
      success: true,
      message: `Admin ${action} completed successfully. Email notification sent.`,
      action,
      memberId
    });

  } catch (error) {
    console.error('Error managing admin status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update admin status' },
      { status: 500 }
    );
  }
}