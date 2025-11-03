-- =====================================================
-- ENABLE RLS WITH SIMPLE PERMISSIVE POLICIES
-- =====================================================
-- Run this after testing to re-enable security
-- These are simple policies that allow authenticated users
-- =====================================================

-- First, enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_banned_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- SIMPLE PERMISSIVE POLICIES (Allow all authenticated users)
-- =====================================================

-- Families: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON families
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Family Members: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_members
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Custom Fields: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_custom_fields
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Custom Values: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_member_custom_values
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Events: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_events
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Relationships: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_relationships
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invitations: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_invitations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Messages: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_messages
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin Actions: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_admin_actions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Banned Members: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON family_banned_members
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Message Reactions: Authenticated users can do everything
CREATE POLICY "Allow all for authenticated users" ON message_reactions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- DONE!
-- =====================================================
-- All tables now have simple permissive policies
-- Any authenticated user can access all data
-- This is good for testing, but you may want to
-- add more restrictive policies later for production
-- =====================================================
