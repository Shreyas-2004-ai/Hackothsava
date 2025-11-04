# Email Setup Guide for Apna Parivar

This guide will help you configure email notifications for family member invitations.

## 📧 Email Service Configuration

### Option 1: Gmail SMTP (Recommended for Testing)

1. **Enable 2-Step Verification** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Apna Parivar" as the name
   - Copy the 16-character password

3. **Add to .env.local**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_APP_PASSWORD=your-16-character-app-password
   ```

### Option 2: Other SMTP Providers

For other email providers (Outlook, Yahoo, etc.):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_APP_PASSWORD=your-password
```

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# Optional: For custom SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## ✅ Testing

1. Add a family member via `/admin/add-member`
2. Check the member's email inbox
3. Check server logs for email sending status

## 🚨 Troubleshooting

### Email not sending?
- Check if `EMAIL_USER` and `EMAIL_APP_PASSWORD` are set in `.env.local`
- Verify Gmail App Password is correct (16 characters)
- Check server logs for error messages
- Ensure 2-Step Verification is enabled on Gmail

### "Invalid login credentials"
- Make sure you're using an App Password, not your regular Gmail password
- Generate a new App Password if needed

### "Email service not configured"
- Ensure environment variables are set correctly
- Restart your development server after adding env variables

## 📝 Email Template

The invitation email includes:
- Personalized greeting with member's name
- Admin's name who added them
- Link to sign in at https://apnaparivar.com
- Beautiful HTML formatting
- Plain text fallback

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use App Passwords, not regular passwords
- Keep your App Password secure
- Rotate App Passwords periodically

