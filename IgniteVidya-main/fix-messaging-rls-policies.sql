-- =====================================================
-- FIX RLS POLICIES FOR MESSAGING SYSTEM
-- =====================================================
-- Run this in Supabase SQL Editor to fix the RLS policy errors

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view family messages" ON family_messages;
DROP POLICY IF EXISTS "Users can send messages" ON family_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON family_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON family_messages;
DROP POLICY IF EXISTS "Admins can view admin actions" ON family_admin_actions;
DROP POLICY IF EXISTS "Admins can create actions" ON family_admin_actions;
DROP POLICY IF EXISTS "Admins can view banned members" ON family_banned_members;
DROP POLICY IF EXISTS "Admins can manage bans" ON family_banned_members;

-- =====================================================
-- FIXED RLS POLICIES
-- =====================================================

-- Messages: Users can view messages in their family (if not banned)
CREATE POLICY "Users can view family messages"
  ON family_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_messages.family_id
      AND family_members.id NOT IN (
        SELECT member_id FROM family_banned_members 
        WHERE is_active = true
      )
    )
  );

-- Messages: Users can send messages (if not banned)
CREATE POLICY "Users can send messages"
  ON family_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_messages.sender_id
      AND family_members.user_id = auth.uid()
      AND family_members.id NOT IN (
        SELECT member_id FROM family_banned_members 
        WHERE is_active = true
      )
    )
  );

-- Messages: Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON family_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_messages.sender_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Messages: Admins can delete any message
CREATE POLICY "Admins can delete messages"
  ON family_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_messages.family_id
      AND family_members.is_admin = true
    )
  );

-- Admin Actions: Admins can view all actions
CREATE POLICY "Admins can view admin actions"
  ON family_admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_admin_actions.family_id
      AND family_members.is_admin = true
    )
  );

-- Admin Actions: Admins can create actions
CREATE POLICY "Admins can create actions"
  ON family_admin_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_admin_actions.admin_id
      AND family_members.user_id = auth.uid()
      AND family_members.is_admin = true
    )
  );

-- Banned Members: Admins can view banned members
CREATE POLICY "Admins can view banned members"
  ON family_banned_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_banned_members.family_id
      AND family_members.is_admin = true
    )
  );

-- Banned Members: Admins can manage bans (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage bans"
  ON family_banned_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_banned_members.family_id
      AND family_members.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.user_id = auth.uid()
      AND family_members.family_id = family_banned_members.family_id
      AND family_members.is_admin = true
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify policies are created:
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('family_messages', 'family_admin_actions', 'family_banned_members');

