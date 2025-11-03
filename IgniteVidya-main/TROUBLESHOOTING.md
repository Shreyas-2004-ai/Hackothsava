# 🔧 Troubleshooting Guide - Add Family Members

## 🚨 "It's not working" - Let's fix it step by step!

### Step 1: Check Database Setup

**Problem**: Family tables don't exist in Supabase
**Solution**: 
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the contents of `setup-family-tables.sql`
5. Click **Run**
6. You should see "✅ Family tables setup complete!" message

### Step 2: Verify Environment Variables

**Check your `.env.local` file has:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
RESEND_API_KEY=your_resend_key
```

**To get Resend API Key:**
1. Go to [resend.com](https://resend.com)
2. Sign up (free)
3. Go to API Keys
4. Create new key
5. Copy to `.env.local`

### Step 3: Test the System

**Run the debug script:**
```bash
cd IgniteVidya-main
node debug-family-system.js
```

**Expected output:**
```
✅ Supabase connection successful!
✅ family_members table exists
✅ All tables verified
```

### Step 4: Test the Web Interface

1. **Start dev server**: `npm run dev`
2. **Go to**: `http://localhost:3000/level/add-family-members`
3. **Fill the form** with test data
4. **Click "Save Family Member"**
5. **Check browser console** for any errors

### Step 5: Common Issues & Solutions

#### ❌ "relation family_members does not exist"
**Solution**: Run `setup-family-tables.sql` in Supabase SQL Editor

#### ❌ "Failed to save family member to database"
**Solution**: Check Supabase RLS policies are set to permissive (done in setup script)

#### ❌ "Email notification failed"
**Solution**: 
- Check `RESEND_API_KEY` in `.env.local`
- Verify API key is valid at resend.com
- Check console logs for specific error

#### ❌ "Network error" or "Failed to fetch"
**Solution**: 
- Make sure dev server is running
- Check if port 3000 is available
- Try different port: `npm run dev -- -p 3001`

#### ❌ Form submits but nothing happens
**Solution**:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Submit form again
4. Look for error messages
5. Go to Network tab to see API requests

### Step 6: Manual Testing

**Test API directly with curl:**
```bash
curl -X POST http://localhost:3000/api/add-family-member \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "relation": "Brother",
    "email": "test@gmail.com",
    "addedBy": "Admin",
    "addedById": "admin-123"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Family member Test User has been added successfully. Email notification sent.",
  "data": {
    "memberId": "uuid-here",
    "name": "Test User",
    "relation": "Brother",
    "email": "test@gmail.com"
  }
}
```

### Step 7: Check Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Check `family_members` table
3. Verify new records are being created
4. Check `family_activities` for activity logs

### Step 8: Email Testing

**If emails aren't sending:**
1. Check Resend dashboard for delivery logs
2. Verify sender domain (use default for testing)
3. Check spam folder
4. Test with different email address

### 🆘 Still Not Working?

**Provide these details:**
1. **Error messages** from browser console
2. **Network tab** showing API requests/responses  
3. **Supabase logs** from dashboard
4. **Environment setup** (Node version, OS)
5. **Steps you've tried** from this guide

**Quick Debug Checklist:**
- [ ] Database tables created ✅
- [ ] Environment variables set ✅  
- [ ] Dev server running ✅
- [ ] No console errors ✅
- [ ] API responding ✅
- [ ] Resend API key valid ✅

**Most Common Issue**: Database tables not created
**Quick Fix**: Run `setup-family-tables.sql` in Supabase SQL Editor

---

**🎯 Once working, you should see:**
- Form submits successfully
- Toast notification appears  
- Email sent to new member
- Data appears in Supabase tables
- Family tree updates automatically