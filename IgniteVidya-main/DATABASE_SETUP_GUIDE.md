# ApnaParivar Database Setup Guide

## Overview
This guide will walk you through setting up your ApnaParivar database with proper authentication and RLS policies.

## Prerequisites
- Supabase account created
- Project created in Supabase
- `.env.local` file configured with your Supabase credentials

## Step 1: Run the Database Setup Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `PRODUCTION_DATABASE_SETUP.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

**Expected Result:** You should see "Success. No rows returned" message.

## Step 2: Verify Tables Were Created

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables:**
- families
- family_members
- family_custom_fields
- family_member_custom_values
- family_events
- family_relationships
- family_invitations
- family_messages
- family_admin_actions
- family_banned_members
- message_reactions

## Step 3: Verify RLS is Enabled

Run this query:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Expected Result:** All tables should show `rowsecurity = true`

## Step 4: Verify RLS Policies

Run this query:

```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Expected Policy Counts:**
- families: 3 policies (select, insert, update)
- family_members: 4 policies (select, insert, update, delete)
- family_custom_fields: 4 policies (select, insert, update, delete)
- family_member_custom_values: 3 policies (select, insert, update)
- family_events: 4 policies (select, insert, update, delete)
- family_relationships: 4 policies (select, insert, update, delete)
- family_invitations: 3 policies (select, insert, update)
- family_messages: 4 policies (select, insert, update, delete)
- family_admin_actions: 2 policies (select, insert)
- family_banned_members: 3 policies (select, insert, update)
- message_reactions: 3 policies (select, insert, delete)

## Step 5: Configure Google OAuth

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Find **Google** and click to enable it
3. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console
4. Add your site URL to **Authorized redirect URIs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs (get from Supabase Auth settings)
7. Copy Client ID and Client Secret to Supabase

## Step 6: Enable Realtime (Optional but Recommended)

For live chat functionality:

1. Go to **Database** > **Replication** in Supabase
2. Enable replication for these tables:
   - `family_messages`
   - `family_admin_actions`
   - `family_banned_members`

## Step 7: Set Up Storage for Photos

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Name it: `family-photos`
4. Make it **Public** (so photos can be displayed)
5. Click **Create Bucket**

### Set Storage Policies

Click on the bucket, go to **Policies**, and add:

**Policy 1: Allow authenticated users to upload**
```sql
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-photos');
```

**Policy 2: Anyone can view photos**
```sql
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'family-photos');
```

## Step 8: Test Your Setup

### Test 1: Create a Test Family

Run this in SQL Editor (replace with your actual user ID):

```sql
-- First, sign up via your app to get a user ID
-- Then run this to create a test family:
SELECT create_family_with_admin(
  'Test Family',
  'John',
  'Doe',
  'john@example.com',
  'free_trial'
);
```

### Test 2: Verify Family Was Created

```sql
SELECT * FROM families;
SELECT * FROM family_members;
```

### Test 3: Test RLS Policies

Try to query as an unauthenticated user (should return nothing):

```sql
-- This should work only when you're authenticated
SELECT * FROM families;
```

## Step 9: Update Your Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

## Step 10: Start Your Application

```bash
npm run dev
```

Visit `http://localhost:3000` and test:

1. **Sign up with Google** - Should create a user in auth.users
2. **Create a family** - Should create family and make you primary admin
3. **Add a member** - Should send email notification
4. **Test permissions** - Regular members should only see, admins can edit

## Troubleshooting

### Issue: "permission denied for table families"

**Solution:** RLS policies might not be set correctly. Re-run the setup script.

### Issue: "new row violates row-level security policy"

**Solution:** Check that you're authenticated and have the right permissions.

### Issue: Can't insert family members

**Solution:** Make sure the user is an admin in the family_members table.

### Issue: Messages not showing in realtime

**Solution:** Enable replication for family_messages table in Supabase Dashboard.

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Policies prevent unauthorized access
- ✅ Primary admin cannot be deleted or banned
- ✅ Only admins can modify family data
- ✅ Banned members cannot send messages
- ✅ Users can only see their own family data

## Database Schema Overview

### Core Tables
- **families**: Family information and subscriptions
- **family_members**: All family members with roles
- **family_custom_fields**: 10 programmable fields per family
- **family_member_custom_values**: Values for custom fields

### Relationship Tables
- **family_relationships**: Parent-child, spouse relationships
- **family_events**: Weddings, deaths, birthdays, etc.
- **family_invitations**: Email invitation tokens

### Messaging Tables
- **family_messages**: Chat messages
- **family_admin_actions**: Audit log of admin actions
- **family_banned_members**: Banned user records
- **message_reactions**: Likes, loves, etc.

## Key Functions

1. **create_family_with_admin()** - Creates family and primary admin
2. **kick_family_member()** - Removes member from family
3. **ban_family_member()** - Bans member from chat
4. **unban_family_member()** - Unbans a member
5. **mark_message_read()** - Marks message as read
6. **expire_temporary_bans()** - Auto-expires temporary bans

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Verify RLS policies are active
3. Ensure user is authenticated
4. Check browser console for errors

---

**Setup Complete!** Your ApnaParivar database is ready for production use.
