# MongoDB & Email Setup Guide

This guide will help you verify that MongoDB and email services are properly configured for the Add Family Member feature.

## ✅ MongoDB Setup (Already Connected)

Your MongoDB connection is configured to use:
- **Host**: `localhost:27017` (default)
- **Database**: `apnaparivar`
- **Collection**: `family_members`

### Verify MongoDB Connection

1. **Start MongoDB** (if not already running):
   ```bash
   # On Windows (if installed as service, it should auto-start)
   # Or use MongoDB Compass to connect
   ```

2. **Check Connection**:
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Verify database `apnaparivar` exists
   - Check `family_members` collection

3. **Test the Connection**:
   - Fill out the Add Family Member form
   - Click "Save"
   - Check MongoDB Compass to see the new document in `family_members` collection

### What Gets Saved to MongoDB

When you add a family member, the following data is saved:
```json
{
  "name": "Full Name",
  "firstName": "First",
  "lastName": "Last",
  "email": "email@example.com",
  "relation": "Father",
  "phone": "+91 9876543210",
  "generation": 1,
  "photo_url": "base64_image_string",
  "parentId": null,
  "spouseId": null,
  "children": [],
  "added_at": "2024-01-01T00:00:00.000Z",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

## 📧 Email Setup (Optional but Recommended)

Email notifications are sent automatically when a family member is added. Follow these steps to configure:

### Step 1: Enable 2-Step Verification on Gmail

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** and **Other (Custom name)**
3. Enter "Apna Parivar" as the name
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 3: Add to Environment Variables

Create or update `.env.local` in the root directory:

```env
# MongoDB (already configured - no action needed)
MONGODB_URI=mongodb://localhost:27017

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

**Important**: 
- Remove spaces from the app password when adding to `.env.local`
- Use App Password, NOT your regular Gmail password

### Step 4: Restart Development Server

After adding environment variables:
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
# or
pnpm dev
```

### Step 5: Test Email

1. Add a family member with a valid email address
2. Check the server logs for email status
3. Check the recipient's inbox (and spam folder)

## 🔍 Troubleshooting

### MongoDB Issues

**Problem**: "Failed to connect to database"
- **Solution**: Ensure MongoDB is running on `localhost:27017`
- Check MongoDB Compass connection
- Verify MongoDB service is running

**Problem**: "Failed to save family member"
- **Solution**: Check MongoDB logs
- Verify database `apnaparivar` exists
- Check collection `family_members` permissions

### Email Issues

**Problem**: "Email service not configured"
- **Solution**: Add `EMAIL_USER` and `EMAIL_APP_PASSWORD` to `.env.local`
- Restart the development server

**Problem**: "Invalid login credentials"
- **Solution**: 
  - Use App Password, not regular password
  - Ensure 2-Step Verification is enabled
  - Generate a new App Password

**Problem**: Email not sending
- **Solution**:
  - Check server logs for error messages
  - Verify environment variables are loaded
  - Test with a different email address
  - Check spam folder

## ✅ Success Indicators

### MongoDB Success
- Server logs show: `✅ Connected to MongoDB`
- Server logs show: `✅ Member inserted into MongoDB with ID: ...`
- Document appears in MongoDB Compass

### Email Success
- Server logs show: `✅ Invitation email sent successfully to: email@example.com`
- Email appears in recipient's inbox
- Success toast shows: "An invitation email has been sent"

## 📝 Notes

- **MongoDB is required** - Member data will not be saved without it
- **Email is optional** - Members are saved even if email fails
- The member is always saved to MongoDB first, then email is sent
- If email fails, the member is still added successfully

## 🎯 Quick Checklist

- [ ] MongoDB running on localhost:27017
- [ ] Database `apnaparivar` exists
- [ ] Collection `family_members` exists (auto-created on first insert)
- [ ] Gmail 2-Step Verification enabled (for email)
- [ ] Gmail App Password generated (for email)
- [ ] `.env.local` file created with email credentials (for email)
- [ ] Development server restarted after adding env variables

