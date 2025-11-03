# Simple Authentication Setup Guide

## 🎯 Goal: Get Authentication Working First

This guide helps you set up ApnaParivar authentication **without RLS complications**. Once everything works, we'll add security.

---

## 📋 Two-Phase Approach

### Phase 1: Authentication Only (Start Here)
- Create tables WITHOUT RLS
- Get Google OAuth working
- Test creating families
- Test adding members
- **No permission errors!**

### Phase 2: Add Security (Later)
- Enable RLS on all tables
- Add security policies
- Test that permissions work correctly

---

## 🚀 Phase 1: Simple Setup (15 minutes)

### Step 1: Run Simple Database Script

1. Open Supabase Dashboard: https://ghfcovjbnoznyygssjpb.supabase.co
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Open `SIMPLE_AUTH_SETUP.sql` in your code editor
5. Copy ALL contents
6. Paste into Supabase SQL Editor
7. Click **Run**
8. Wait for "Success. No rows returned"

**What this does:**
- Creates 7 tables (families, family_members, etc.)
- Adds indexes for performance
- **Disables RLS** (no permission errors)
- Creates helper functions

### Step 2: Verify Tables Created

Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- families
- family_custom_fields
- family_events
- family_invitations
- family_member_custom_values
- family_members
- family_relationships

### Step 3: Verify RLS is Disabled

Run this query:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Expected:** All tables should show `rowsecurity = false`

This means NO permission errors while testing!

### Step 4: Configure Google OAuth

1. Go to **Authentication** > **Providers** in Supabase
2. Find **Google** and toggle it ON
3. You need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 Client ID
   - Add redirect URI from Supabase
   - Copy Client ID and Secret
4. Paste credentials in Supabase
5. Click **Save**

### Step 5: Test Your App

```bash
npm run dev
```

Visit `http://localhost:3000`

**Test Flow:**
1. Click "Sign in with Google"
2. Choose your Google account
3. Should redirect back to your app
4. You're authenticated!

### Step 6: Create Test Family

In your app or via SQL:

```sql
-- Replace 'your-user-id' with actual auth.uid()
SELECT create_family_with_admin(
  'Test Family',
  'John',
  'Doe',
  'john@example.com',
  'free_trial'
);
```

### Step 7: Verify Family Created

```sql
SELECT * FROM families;
SELECT * FROM family_members;
```

You should see:
- 1 family record
- 1 family member (you, as primary admin)

### Step 8: Test Adding Members

Try adding a family member through your app's UI.

**It should work without any permission errors!**

---

## ✅ Phase 1 Complete Checklist

- [ ] Ran `SIMPLE_AUTH_SETUP.sql`
- [ ] Verified 7 tables exist
- [ ] Confirmed RLS is disabled (rowsecurity = false)
- [ ] Configured Google OAuth
- [ ] Tested sign in with Google
- [ ] Created a test family
- [ ] Added a test member
- [ ] No RLS errors encountered

---

## 🔒 Phase 2: Add Security (Run Later)

**Only do this AFTER Phase 1 works perfectly!**

### When to Enable RLS

Enable RLS when:
- ✅ Authentication is working
- ✅ You can create families
- ✅ You can add members
- ✅ All basic features work
- ✅ You're ready to add security

### How to Enable RLS

1. Open Supabase SQL Editor
2. Open `ENABLE_RLS_LATER.sql`
3. Copy ALL contents
4. Paste and Run
5. Test your app again

**What this does:**
- Enables RLS on all tables
- Adds 30+ security policies
- Users can only see their own family
- Admins can modify data
- Members can only view

### After Enabling RLS

Test these scenarios:

1. **As Admin:**
   - Can view family members ✅
   - Can add new members ✅
   - Can edit members ✅
   - Can create events ✅

2. **As Regular Member:**
   - Can view family members ✅
   - Cannot add members ❌
   - Cannot edit members ❌
   - Cannot create events ❌

3. **Cross-Family:**
   - Cannot see other families ❌
   - Cannot access other family data ❌

---

## 🐛 Troubleshooting

### Issue: Can't sign in with Google

**Check:**
- Google OAuth is enabled in Supabase
- Client ID and Secret are correct
- Redirect URI matches exactly
- Browser allows popups

**Solution:**
```
1. Go to Supabase > Authentication > Providers
2. Verify Google is enabled
3. Check credentials
4. Try in incognito mode
```

### Issue: "auth.uid() is null"

**Cause:** User is not authenticated

**Solution:**
```
1. Sign out completely
2. Clear browser cookies
3. Sign in again with Google
4. Check: SELECT auth.uid(); (should return UUID)
```

### Issue: Can't create family

**Check:**
```sql
-- Are you authenticated?
SELECT auth.uid();

-- Does the function exist?
SELECT * FROM pg_proc WHERE proname = 'create_family_with_admin';
```

**Solution:**
- Make sure you're signed in
- Re-run `SIMPLE_AUTH_SETUP.sql` if function is missing

### Issue: After enabling RLS, getting permission errors

**This is normal!** RLS is working.

**Check:**
```sql
-- Are you a member of the family?
SELECT * FROM family_members WHERE user_id = auth.uid();

-- Are you an admin?
SELECT is_admin FROM family_members WHERE user_id = auth.uid();
```

**Solution:**
- Make sure you're querying YOUR family
- Check if you have admin permissions for the action
- Review `RLS_POLICY_REFERENCE.md` for details

---

## 📊 What's Different from Production Setup

| Feature | Simple Setup | Production Setup |
|---------|-------------|------------------|
| RLS | Disabled | Enabled |
| Security | None | Full |
| Errors | None | Permission checks |
| Testing | Easy | Requires proper roles |
| Production Ready | No | Yes |
| Good for | Development | Production |

---

## 🎯 Recommended Workflow

```
Day 1: Phase 1 - Simple Setup
├── Run SIMPLE_AUTH_SETUP.sql
├── Configure Google OAuth
├── Test authentication
├── Create test family
└── Add test members

Day 2-3: Build Features
├── Build UI components
├── Test all features
├── No RLS errors to worry about
└── Focus on functionality

Day 4: Phase 2 - Add Security
├── Run ENABLE_RLS_LATER.sql
├── Test with different roles
├── Fix any permission issues
└── Ready for production!
```

---

## 🔄 Switching Between Modes

### Disable RLS (for testing)
```sql
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Enable RLS (for production)
```sql
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

---

## 📚 Next Steps

After Phase 1 works:

1. **Build Your Features**
   - Family tree visualization
   - Member management UI
   - Event calendar
   - Photo uploads

2. **Test Everything**
   - Create multiple families
   - Add multiple members
   - Test all CRUD operations

3. **Enable RLS (Phase 2)**
   - Run `ENABLE_RLS_LATER.sql`
   - Test with different user roles
   - Verify security works

4. **Deploy**
   - Push to production
   - Monitor for errors
   - Celebrate! 🎉

---

## 💡 Pro Tips

1. **Start Simple** - Get auth working first, add security later
2. **Test Thoroughly** - Make sure everything works before enabling RLS
3. **Use Incognito** - Test with multiple Google accounts
4. **Check Logs** - Supabase Dashboard shows all errors
5. **Read Docs** - When ready for RLS, read `RLS_POLICY_REFERENCE.md`

---

## ✨ Summary

**Phase 1 (Now):**
- ✅ Simple setup, no RLS
- ✅ No permission errors
- ✅ Focus on functionality
- ✅ Easy testing

**Phase 2 (Later):**
- ✅ Enable RLS
- ✅ Add security policies
- ✅ Production-ready
- ✅ Secure and scalable

---

**Start with `SIMPLE_AUTH_SETUP.sql` and get your authentication working!** 🚀
