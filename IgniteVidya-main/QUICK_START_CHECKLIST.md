# ApnaParivar Quick Start Checklist

## 🚀 Complete Setup in 15 Minutes

Follow this checklist to get your ApnaParivar app running with proper authentication and database security.

---

## ☑️ Phase 1: Supabase Setup (5 minutes)

### Step 1: Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "New Project"
- [ ] Choose organization
- [ ] Enter project name: "apnaparivar"
- [ ] Set database password (save it!)
- [ ] Choose region closest to your users
- [ ] Click "Create new project"
- [ ] Wait for project to be ready (~2 minutes)

### Step 2: Get API Credentials
- [ ] Go to Project Settings > API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key
- [ ] Copy **service_role** key (keep this secret!)

### Step 3: Update Environment Variables
- [ ] Open `IgniteVidya-main/.env.local`
- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` with your Project URL
- [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` with your service role key

---

## ☑️ Phase 2: Database Setup (3 minutes)

### Step 4: Run Database Script
- [ ] Open Supabase Dashboard
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "New Query"
- [ ] Open `PRODUCTION_DATABASE_SETUP.sql` in your code editor
- [ ] Copy ALL contents (Ctrl+A, Ctrl+C)
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" button (or Ctrl+Enter)
- [ ] Wait for "Success. No rows returned" message

### Step 5: Verify Database
- [ ] Run verification query:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```
- [ ] Confirm you see 11 tables:
  - families
  - family_admin_actions
  - family_banned_members
  - family_custom_fields
  - family_events
  - family_invitations
  - family_member_custom_values
  - family_members
  - family_messages
  - family_relationships
  - message_reactions

---

## ☑️ Phase 3: Authentication Setup (4 minutes)

### Step 6: Configure Google OAuth
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project or select existing
- [ ] Enable "Google+ API"
- [ ] Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
- [ ] Choose "Web application"
- [ ] Add authorized redirect URI from Supabase:
  - Go to Supabase Dashboard > Authentication > Providers > Google
  - Copy the "Callback URL"
  - Paste it in Google Cloud Console
- [ ] Click "Create"
- [ ] Copy Client ID and Client Secret

### Step 7: Enable Google in Supabase
- [ ] Go to Supabase Dashboard > Authentication > Providers
- [ ] Find "Google" and toggle it ON
- [ ] Paste your Google Client ID
- [ ] Paste your Google Client Secret
- [ ] Click "Save"

---

## ☑️ Phase 4: Storage Setup (2 minutes)

### Step 8: Create Storage Bucket
- [ ] Go to Supabase Dashboard > Storage
- [ ] Click "New Bucket"
- [ ] Name: `family-photos`
- [ ] Make it Public: Toggle ON
- [ ] Click "Create Bucket"

### Step 9: Set Storage Policies
- [ ] Click on `family-photos` bucket
- [ ] Go to "Policies" tab
- [ ] Click "New Policy"
- [ ] Add upload policy:
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-photos');
```
- [ ] Add view policy:
```sql
CREATE POLICY "Anyone can view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'family-photos');
```

---

## ☑️ Phase 5: Realtime Setup (1 minute)

### Step 10: Enable Realtime
- [ ] Go to Supabase Dashboard > Database > Replication
- [ ] Find and enable these tables:
  - [ ] family_messages
  - [ ] family_admin_actions
  - [ ] family_banned_members
- [ ] Click "Save"

---

## ☑️ Phase 6: Test Your Setup (Optional but Recommended)

### Step 11: Verify RLS Policies
```sql
-- Run in SQL Editor
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```
- [ ] Confirm all tables have policies

### Step 12: Test Application
- [ ] Open terminal in project directory
- [ ] Run: `npm install` (if not done already)
- [ ] Run: `npm run dev`
- [ ] Open browser to `http://localhost:3000`
- [ ] Click "Sign in with Google"
- [ ] Complete Google OAuth flow
- [ ] You should be redirected back to your app

---

## ☑️ Phase 7: Create Your First Family

### Step 13: Create Test Family
- [ ] After signing in, go to "Create Family" page
- [ ] Enter family name
- [ ] Enter your details
- [ ] Choose subscription plan
- [ ] Click "Create Family"
- [ ] Verify you're redirected to admin dashboard

### Step 14: Add a Family Member
- [ ] Click "Add Family Member"
- [ ] Fill in member details
- [ ] Enter their Gmail address
- [ ] Upload a photo (optional)
- [ ] Click "Save"
- [ ] Check that member appears in family list

---

## ✅ Setup Complete!

Your ApnaParivar app is now fully configured with:
- ✅ Secure authentication via Google OAuth
- ✅ Row Level Security protecting all data
- ✅ Proper role-based access control
- ✅ Real-time messaging capabilities
- ✅ Photo storage for family members
- ✅ Admin action audit logging

---

## 🔍 Troubleshooting

### Can't sign in with Google?
- Check Google OAuth credentials in Supabase
- Verify redirect URI matches exactly
- Check browser console for errors

### Database errors?
- Re-run `PRODUCTION_DATABASE_SETUP.sql`
- Check Supabase logs in Dashboard
- Verify RLS is enabled

### Can't add family members?
- Verify you're logged in
- Check you're an admin (is_admin = true)
- Look at browser console for errors

### Messages not appearing in real-time?
- Enable replication for family_messages table
- Check Supabase Realtime logs
- Verify WebSocket connection in browser

---

## 📚 Next Steps

1. **Read the Documentation**
   - [ ] `DATABASE_SETUP_GUIDE.md` - Detailed setup instructions
   - [ ] `RLS_POLICY_REFERENCE.md` - Understanding security policies
   - [ ] `README.md` - Full app documentation

2. **Customize Your App**
   - [ ] Update branding and colors
   - [ ] Configure custom fields for your family
   - [ ] Set up email templates
   - [ ] Configure Razorpay for payments

3. **Deploy to Production**
   - [ ] Set up Vercel or your hosting platform
   - [ ] Update environment variables for production
   - [ ] Configure production domain in Google OAuth
   - [ ] Test thoroughly before launch

---

## 🆘 Need Help?

- Check the troubleshooting section in `DATABASE_SETUP_GUIDE.md`
- Review Supabase logs in Dashboard
- Check browser console for client-side errors
- Verify all environment variables are set correctly

---

**Congratulations!** You're ready to build and grow your family network with ApnaParivar! 🎉
