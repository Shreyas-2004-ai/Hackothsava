# Fix "Failed to fetch" Error - 2 Minutes

## The Problem
Your app is trying to query database tables that don't exist yet in your new Supabase project.

## The Fix (2 Steps)

### Step 1: Create Database Tables (1 minute)

1. Go to: https://ghfcovjbnoznyygssjpb.supabase.co
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this entire file: `SIMPLE_AUTH_SETUP.sql`
5. Click **Run** (or Ctrl+Enter)
6. Wait for "Success. No rows returned"

### Step 2: Restart Dev Server (30 seconds)

```bash
# In your terminal, press Ctrl+C to stop
# Then restart:
npm run dev
```

## Done!

Your app should now work without "Failed to fetch" errors.

## What This Does

- Creates 7 tables (families, family_members, etc.)
- NO RLS enabled (no permission errors)
- Ready for testing

## Next Steps

1. Test sign in with Google
2. Create a family
3. Add members
4. Everything should work!

---

**Still getting errors?** Check browser console (F12) for specific error messages.
