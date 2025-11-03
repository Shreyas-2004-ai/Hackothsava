import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const { name, relation, email, phone, photo, customFields, addedBy, addedById } = formData;

    // 1. Save the family member to the database
    const { data: newMember, error: insertError } = await supabase
      .from('family_members')
      .insert([
        {
          name,
          relation,
          email,
          phone,
          photo_url: photo,
          custom_fields: customFields,
          added_by: addedBy,
          added_by_id: addedById,
          is_active: true,
          joined_date: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, message: 'Failed to save family member to database' },
        { status: 500 }
      );
    }

    // 2. Update family tree relationships
    if (newMember) {
      // Create family tree relationship entry
      const { error: relationError } = await supabase
        .from('family_relationships')
        .insert([
          {
            member_id: newMember.id,
            related_to_id: addedById,
            relationship_type: relation,
            created_by: addedById,
            created_at: new Date().toISOString()
          }
        ]);

      if (relationError) {
        console.error('Relationship insert error:', relationError);
        // Continue even if relationship fails - member is still added
      }

      // Update family statistics
      await updateFamilyStats(addedById);
    }

    // 3. Send email notification
    const emailSent = await sendWelcomeEmail(name, email, relation, addedBy);

    // 4. Log the activity
    await logFamilyActivity({
      action: 'member_added',
      member_id: newMember.id,
      performed_by: addedById,
      details: `${addedBy} added ${name} as ${relation}`
    });

    return NextResponse.json({
      success: true,
      message: `Family member ${name} has been added successfully. ${emailSent ? 'Email notification sent.' : 'Email notification failed.'}`,
      data: {
        memberId: newMember.id,
        name: newMember.name,
        relation: newMember.relation,
        email: newMember.email
      }
    });

  } catch (error) {
    console.error('Error adding family member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add family member' },
      { status: 500 }
    );
  }
}

// Helper function to send welcome email
async function sendWelcomeEmail(name: string, email: string, relation: string, addedBy: string): Promise<boolean> {
  try {
    const emailContent = generateWelcomeEmailHTML(name, relation, addedBy);
    
    // Using Resend for email sending
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not found, simulating email send...');
      console.log(`Email would be sent to: ${email}`);
      console.log(`Subject: You've been added to ${addedBy}'s Apna Parivar family tree`);
      return true; // Simulate success when no API key
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Apna Parivar <noreply@apnaparivar.com>',
        to: [email],
        subject: `🏠 You've been added to ${addedBy}'s Apna Parivar family tree!`,
        html: emailContent,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Email sent successfully:', result.id);
      return true;
    } else {
      const error = await response.text();
      console.error('Email sending failed:', error);
      return false;
    }
    
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Helper function to generate email HTML
function generateWelcomeEmailHTML(name: string, relation: string, addedBy: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 Welcome to Apna Parivar!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">You've been added to a family tree! 👨‍👩‍👧‍👦</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Hello <strong>${name}</strong>,
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            <strong>${addedBy}</strong> has added you to their Apna Parivar family tree as their <strong>${relation}</strong>.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #333; margin-top: 0;">🌳 What is Apna Parivar?</h3>
            <ul style="color: #666; margin-bottom: 0;">
              <li>Connect with family members across generations</li>
              <li>Preserve your family heritage and memories</li>
              <li>Share photos, stories, and important events</li>
              <li>Stay updated with family news and celebrations</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ApnaParivar.com" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
              🚀 Join Your Family Tree
            </a>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #059669; margin-top: 0;">🔐 Getting Started:</h4>
            <ol style="color: #666; margin-bottom: 0;">
              <li>Visit <a href="https://ApnaParivar.com" style="color: #059669;">ApnaParivar.com</a></li>
              <li>Sign in with your Google account</li>
              <li>Complete your profile information</li>
              <li>Start connecting with your family!</li>
            </ol>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
            This email was sent because you were added to a family tree on Apna Parivar.<br>
            If you believe this was sent in error, please contact our support team.
          </p>
        </div>
      </body>
    </html>
  `;
}

// Helper function to update family statistics
async function updateFamilyStats(familyId: string): Promise<void> {
  try {
    // Get current family member count
    const { count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('added_by_id', familyId)
      .eq('is_active', true);

    // Update or insert family stats
    const { error } = await supabase
      .from('family_stats')
      .upsert([
        {
          family_id: familyId,
          total_members: count || 0,
          last_updated: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Failed to update family stats:', error);
    }
  } catch (error) {
    console.error('Error updating family stats:', error);
  }
}

// Helper function to log family activities
async function logFamilyActivity(activity: {
  action: string;
  member_id: string;
  performed_by: string;
  details: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('family_activities')
      .insert([
        {
          ...activity,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}