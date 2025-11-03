-- =====================================================
-- ENABLE RLS POLICIES - RUN THIS AFTER TESTING
-- =====================================================
-- Run this ONLY after your authentication is working
-- and you've tested creating families and adding members
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: CREATE RLS POLICIES - FAMILIES
-- =====================================================

CREATE POLICY "family_select_policy" ON families
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "family_insert_policy" ON families
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "family_update_policy" ON families
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.is_primary_admin = true
    )
  );

-- =====================================================
-- STEP 3: CREATE RLS POLICIES - FAMILY MEMBERS
-- =====================================================

CREATE POLICY "members_select_policy" ON family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "members_insert_policy" ON family_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.is_admin = true
    )
  );

CREATE POLICY "members_update_policy" ON family_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.is_admin = true
    )
  );

CREATE POLICY "members_delete_policy" ON family_members
  FOR DELETE
  USING (
    family_members.is_primary_admin = false
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.is_admin = true
    )
  );

-- =====================================================
-- STEP 4: CREATE RLS POLICIES - CUSTOM FIELDS
-- =====================================================

CREATE POLICY "custom_fields_select_policy" ON family_custom_fields
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "custom_fields_insert_policy" ON family_custom_fields
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "custom_fields_update_policy" ON family_custom_fields
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "custom_fields_delete_policy" ON family_custom_fields
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 5: CREATE RLS POLICIES - CUSTOM VALUES
-- =====================================================

CREATE POLICY "custom_values_select_policy" ON family_member_custom_values
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm2.id = family_member_custom_values.member_id
        AND fm1.user_id = auth.uid()
    )
  );

CREATE POLICY "custom_values_insert_policy" ON family_member_custom_values
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm2.id = family_member_custom_values.member_id
        AND fm1.user_id = auth.uid()
        AND fm1.is_admin = true
    )
  );

CREATE POLICY "custom_values_update_policy" ON family_member_custom_values
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm2.id = family_member_custom_values.member_id
        AND fm1.user_id = auth.uid()
        AND fm1.is_admin = true
    )
  );

-- =====================================================
-- STEP 6: CREATE RLS POLICIES - EVENTS
-- =====================================================

CREATE POLICY "events_select_policy" ON family_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "events_insert_policy" ON family_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "events_update_policy" ON family_events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "events_delete_policy" ON family_events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 7: CREATE RLS POLICIES - RELATIONSHIPS
-- =====================================================

CREATE POLICY "relationships_select_policy" ON family_relationships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_relationships.family_id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "relationships_insert_policy" ON family_relationships
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_relationships.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "relationships_update_policy" ON family_relationships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_relationships.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "relationships_delete_policy" ON family_relationships
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_relationships.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 8: CREATE RLS POLICIES - INVITATIONS
-- =====================================================

CREATE POLICY "invitations_select_policy" ON family_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invitations.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "invitations_insert_policy" ON family_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invitations.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

CREATE POLICY "invitations_update_policy" ON family_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_invitations.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check RLS is enabled (should show true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies are created
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- RLS ENABLED!
-- =====================================================
-- Your database is now secure with Row Level Security
-- Test your app to make sure everything still works
-- =====================================================
