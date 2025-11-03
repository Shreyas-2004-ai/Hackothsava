-- =====================================================
-- DISABLE RLS TEMPORARILY FOR TESTING
-- =====================================================
-- Run this in Supabase SQL Editor to disable RLS
-- WARNING: Only use this for testing/development!
-- =====================================================

-- Disable RLS on all tables
ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_custom_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_custom_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_admin_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_banned_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'families',
  'family_members',
  'family_messages',
  'family_admin_actions',
  'family_banned_members'
)
ORDER BY tablename;

-- You should see rowsecurity = false for all tables
