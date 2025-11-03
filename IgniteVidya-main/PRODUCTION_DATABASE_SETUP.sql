-- =====================================================
-- APNAPARIVAR PRODUCTION DATABASE SETUP
-- =====================================================
-- Complete database schema with authentication and RLS
-- Run this ONCE in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CLEANUP (Remove all existing objects)
-- =====================================================

-- Drop all triggers
DROP TRIGGER IF EXISTS update_families_updated_at ON families CASCADE;
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members CASCADE;
DROP TRIGGER IF EXISTS update_family_events_updated_at ON family_events CASCADE;
DROP TRIGGER IF EXISTS update_family_messages_updated_at ON family_messages CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_family_with_admin(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS kick_family_member(UUID, UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS ban_family_member(UUID, UUID, UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS unban_family_member(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_message_read(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS expire_temporary_bans() CASCADE;

-- Drop all tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS family_banned_members CASCADE;
DROP TABLE IF EXISTS family_admin_actions CASCADE;
DROP TABLE IF EXISTS family_messages CASCADE;
DROP TABLE IF EXISTS family_invitations CASCADE;
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_member_custom_values CASCADE;
DROP TABLE IF EXISTS family_custom_fields CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- =====================================================
-- STEP 2: CREATE CORE TABLES
-- =====================================================

-- Families Table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_type VARCHAR(50) DEFAULT 'free_trial',
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Members Table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  relation VARCHAR(100),
  photo_url TEXT,
  date_of_birth DATE,
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_primary_admin BOOLEAN DEFAULT false,
  invited_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  invitation_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_family_email UNIQUE(family_id, email)
);

-- Custom Fields Table (10 programmable fields per family)
CREATE TABLE family_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  field_order INTEGER,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_family_field UNIQUE(family_id, field_name)
);

-- Custom Field Values Table
CREATE TABLE family_member_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  field_id UUID REFERENCES family_custom_fields(id) ON DELETE CASCADE NOT NULL,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_member_field UNIQUE(member_id, field_id)
);

-- Family Events Table
CREATE TABLE family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  related_members UUID[],
  created_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Relationships Table
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  related_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_relationship UNIQUE(member_id, related_member_id, relationship_type)
);

-- Family Invitations Table
CREATE TABLE family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE MESSAGING TABLES
-- =====================================================

-- Family Messages Table
CREATE TABLE family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text',
  is_admin_message BOOLEAN DEFAULT false,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Actions Table
CREATE TABLE family_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  admin_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banned Members Table
CREATE TABLE family_banned_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  banned_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unban_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_banned_member UNIQUE(family_id, member_id)
);

-- Message Reactions Table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES family_messages(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_reaction UNIQUE(message_id, member_id, reaction_type)
);

-- =====================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Family Members Indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_members_is_admin ON family_members(is_admin) WHERE is_admin = true;

-- Family Events Indexes
CREATE INDEX idx_family_events_family_id ON family_events(family_id);
CREATE INDEX idx_family_events_date ON family_events(event_date DESC);

-- Relationships Indexes
CREATE INDEX idx_family_relationships_member ON family_relationships(member_id);
CREATE INDEX idx_family_relationships_related ON family_relationships(related_member_id);

-- Invitations Indexes
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);

-- Messages Indexes
CREATE INDEX idx_messages_family_id ON family_messages(family_id);
CREATE INDEX idx_messages_sender_id ON family_messages(sender_id);
CREATE INDEX idx_messages_created_at ON family_messages(created_at DESC);

-- Admin Actions Indexes
CREATE INDEX idx_admin_actions_family_id ON family_admin_actions(family_id);
CREATE INDEX idx_admin_actions_target ON family_admin_actions(target_member_id);

-- Banned Members Indexes
CREATE INDEX idx_banned_members_family ON family_banned_members(family_id);
CREATE INDEX idx_banned_members_member ON family_banned_members(member_id);
CREATE INDEX idx_banned_members_active ON family_banned_members(is_active) WHERE is_active = true;

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

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

-- =====================================================
-- STEP 6: RLS POLICIES - FAMILIES TABLE
-- =====================================================

-- Users can view their own family
CREATE POLICY "family_select_policy" ON families
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

-- Authenticated users can create families
CREATE POLICY "family_insert_policy" ON families
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Primary admin can update family
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
-- STEP 7: RLS POLICIES - FAMILY MEMBERS TABLE
-- =====================================================

-- Users can view members in their family
CREATE POLICY "members_select_policy" ON family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
    )
  );

-- Admins can add family members
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

-- Admins can update family members
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

-- Admins can delete family members (except primary admin)
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
-- STEP 8: RLS POLICIES - CUSTOM FIELDS
-- =====================================================

-- Users can view custom fields in their family
CREATE POLICY "custom_fields_select_policy" ON family_custom_fields
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- Admins can manage custom fields
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
-- STEP 9: RLS POLICIES - CUSTOM FIELD VALUES
-- =====================================================

-- Users can view custom values in their family
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

-- Admins can manage custom values
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
-- STEP 10: RLS POLICIES - FAMILY EVENTS
-- =====================================================

-- Users can view events in their family
CREATE POLICY "events_select_policy" ON family_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- Admins can create events
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

-- Admins can update events
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

-- Admins can delete events
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
-- STEP 11: RLS POLICIES - RELATIONSHIPS
-- =====================================================

-- Users can view relationships in their family
CREATE POLICY "relationships_select_policy" ON family_relationships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_relationships.family_id
        AND family_members.user_id = auth.uid()
    )
  );

-- Admins can manage relationships
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
-- STEP 12: RLS POLICIES - INVITATIONS
-- =====================================================

-- Admins can view invitations
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

-- Admins can create invitations
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

-- Admins can update invitations
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
-- STEP 13: RLS POLICIES - MESSAGES
-- =====================================================

-- Non-banned users can view messages
CREATE POLICY "messages_select_policy" ON family_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_messages.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.id NOT IN (
          SELECT member_id FROM family_banned_members
          WHERE family_id = family_messages.family_id
            AND is_active = true
        )
    )
  );

-- Non-banned users can send messages
CREATE POLICY "messages_insert_policy" ON family_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_messages.sender_id
        AND family_members.user_id = auth.uid()
        AND family_members.id NOT IN (
          SELECT member_id FROM family_banned_members
          WHERE family_id = family_messages.family_id
            AND is_active = true
        )
    )
  );

-- Users can update their own messages
CREATE POLICY "messages_update_policy" ON family_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_messages.sender_id
        AND family_members.user_id = auth.uid()
    )
  );

-- Admins can delete any message
CREATE POLICY "messages_delete_policy" ON family_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_messages.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 14: RLS POLICIES - ADMIN ACTIONS
-- =====================================================

-- Admins can view admin actions
CREATE POLICY "admin_actions_select_policy" ON family_admin_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_admin_actions.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- Admins can create admin actions
CREATE POLICY "admin_actions_insert_policy" ON family_admin_actions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_admin_actions.admin_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 15: RLS POLICIES - BANNED MEMBERS
-- =====================================================

-- Admins can view banned members
CREATE POLICY "banned_members_select_policy" ON family_banned_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_banned_members.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- Admins can ban members
CREATE POLICY "banned_members_insert_policy" ON family_banned_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_banned_members.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- Admins can update bans (for unbanning)
CREATE POLICY "banned_members_update_policy" ON family_banned_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_banned_members.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.is_admin = true
    )
  );

-- =====================================================
-- STEP 16: RLS POLICIES - MESSAGE REACTIONS
-- =====================================================

-- Users can view reactions
CREATE POLICY "reactions_select_policy" ON message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_messages fm
      JOIN family_members fmem ON fmem.family_id = fm.family_id
      WHERE fm.id = message_reactions.message_id
        AND fmem.user_id = auth.uid()
    )
  );

-- Users can add reactions
CREATE POLICY "reactions_insert_policy" ON message_reactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = message_reactions.member_id
        AND family_members.user_id = auth.uid()
    )
  );

-- Users can delete their own reactions
CREATE POLICY "reactions_delete_policy" ON message_reactions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = message_reactions.member_id
        AND family_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 17: CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers for updated_at
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_events_updated_at
  BEFORE UPDATE ON family_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_messages_updated_at
  BEFORE UPDATE ON family_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 18: CREATE FAMILY WITH ADMIN FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_family_with_admin(
  p_family_name VARCHAR,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_subscription_type VARCHAR DEFAULT 'free_trial'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_member_id UUID;
  v_subscription_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate subscription end date
  IF p_subscription_type = 'free_trial' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  ELSIF p_subscription_type = 'paid' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  END IF;

  -- Create family
  INSERT INTO families (
    family_name,
    created_by,
    subscription_type,
    subscription_end_date
  )
  VALUES (
    p_family_name,
    auth.uid(),
    p_subscription_type,
    v_subscription_end_date
  )
  RETURNING id INTO v_family_id;

  -- Create primary admin member
  INSERT INTO family_members (
    family_id,
    user_id,
    email,
    first_name,
    last_name,
    is_admin,
    is_primary_admin,
    invitation_accepted
  )
  VALUES (
    v_family_id,
    auth.uid(),
    p_email,
    p_first_name,
    p_last_name,
    true,
    true,
    true
  )
  RETURNING id INTO v_member_id;

  RETURN v_family_id;
END;
$$;

-- =====================================================
-- STEP 19: KICK MEMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION kick_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_primary_admin BOOLEAN;
BEGIN
  -- Check if requester is admin
  SELECT is_admin INTO v_is_admin
  FROM family_members
  WHERE id = p_admin_id AND family_id = p_family_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can kick members';
  END IF;

  -- Check if target is primary admin
  SELECT is_primary_admin INTO v_is_primary_admin
  FROM family_members
  WHERE id = p_target_member_id;

  IF v_is_primary_admin THEN
    RAISE EXCEPTION 'Cannot kick the primary admin';
  END IF;

  -- Log the action
  INSERT INTO family_admin_actions (
    family_id,
    admin_id,
    target_member_id,
    action_type,
    reason
  )
  VALUES (
    p_family_id,
    p_admin_id,
    p_target_member_id,
    'kick',
    p_reason
  );

  -- Delete the member
  DELETE FROM family_members WHERE id = p_target_member_id;

  -- Send system message
  INSERT INTO family_messages (
    family_id,
    sender_id,
    message_text,
    message_type,
    is_admin_message
  )
  VALUES (
    p_family_id,
    p_admin_id,
    'A member has been removed from the family.',
    'system',
    true
  );

  RETURN true;
END;
$$;

-- =====================================================
-- STEP 20: BAN MEMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION ban_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_duration_days INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_primary_admin BOOLEAN;
  v_unban_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if requester is admin
  SELECT is_admin INTO v_is_admin
  FROM family_members
  WHERE id = p_admin_id AND family_id = p_family_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can ban members';
  END IF;

  -- Check if target is primary admin
  SELECT is_primary_admin INTO v_is_primary_admin
  FROM family_members
  WHERE id = p_target_member_id;

  IF v_is_primary_admin THEN
    RAISE EXCEPTION 'Cannot ban the primary admin';
  END IF;

  -- Calculate unban date if temporary
  IF p_duration_days IS NOT NULL THEN
    v_unban_at := NOW() + (p_duration_days || ' days')::INTERVAL;
  END IF;

  -- Insert or update ban record
  INSERT INTO family_banned_members (
    family_id,
    member_id,
    banned_by,
    reason,
    unban_at
  )
  VALUES (
    p_family_id,
    p_target_member_id,
    p_admin_id,
    p_reason,
    v_unban_at
  )
  ON CONFLICT (family_id, member_id)
  DO UPDATE SET
    is_active = true,
    banned_at = NOW(),
    unban_at = v_unban_at,
    reason = p_reason,
    banned_by = p_admin_id;

  -- Log the action
  INSERT INTO family_admin_actions (
    family_id,
    admin_id,
    target_member_id,
    action_type,
    reason
  )
  VALUES (
    p_family_id,
    p_admin_id,
    p_target_member_id,
    'ban',
    p_reason
  );

  -- Send system message
  INSERT INTO family_messages (
    family_id,
    sender_id,
    message_text,
    message_type,
    is_admin_message
  )
  VALUES (
    p_family_id,
    p_admin_id,
    'A member has been banned from the family chat.',
    'system',
    true
  );

  RETURN true;
END;
$$;

-- =====================================================
-- STEP 21: UNBAN MEMBER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION unban_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate the ban
  UPDATE family_banned_members
  SET is_active = false
  WHERE family_id = p_family_id
    AND member_id = p_target_member_id;

  -- Log the action
  INSERT INTO family_admin_actions (
    family_id,
    admin_id,
    target_member_id,
    action_type
  )
  VALUES (
    p_family_id,
    p_admin_id,
    p_target_member_id,
    'unban'
  );

  -- Send system message
  INSERT INTO family_messages (
    family_id,
    sender_id,
    message_text,
    message_type,
    is_admin_message
  )
  VALUES (
    p_family_id,
    p_admin_id,
    'A member has been unbanned and can now participate in the chat.',
    'system',
    true
  );

  RETURN true;
END;
$$;

-- =====================================================
-- STEP 22: MARK MESSAGE AS READ FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION mark_message_read(
  p_message_id UUID,
  p_member_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE family_messages
  SET read_by = array_append(read_by, p_member_id)
  WHERE id = p_message_id
    AND NOT (p_member_id = ANY(read_by));

  RETURN true;
END;
$$;

-- =====================================================
-- STEP 23: EXPIRE TEMPORARY BANS FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION expire_temporary_bans()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE family_banned_members
  SET is_active = false
  WHERE is_active = true
    AND unban_at IS NOT NULL
    AND unban_at <= NOW();
END;
$$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify your setup:

-- 1. Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Check all policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Enable Realtime in Supabase Dashboard for:
--    - family_messages
--    - family_admin_actions
--    - family_banned_members
--
-- 2. Configure Google OAuth in Supabase:
--    - Go to Authentication > Providers
--    - Enable Google
--    - Add your OAuth credentials
--
-- 3. Set up Storage Buckets:
--    - Create 'family-photos' bucket
--    - Enable public access for photos
--
-- 4. Test your setup:
--    - Start your Next.js app: npm run dev
--    - Create a test family
--    - Add members and test permissions
--
-- =====================================================
