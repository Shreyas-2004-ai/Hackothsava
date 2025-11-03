-- =====================================================
-- COMPLETE APNAPARIVAR DATABASE SETUP
-- =====================================================
-- This file contains EVERYTHING needed for ApnaParivar
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: CLEANUP (Remove existing objects)
-- =====================================================

-- Drop messaging tables first (they depend on family tables)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS family_banned_members CASCADE;
DROP TABLE IF EXISTS family_admin_actions CASCADE;
DROP TABLE IF EXISTS family_messages CASCADE;

-- Drop family system tables
DROP TABLE IF EXISTS family_invitations CASCADE;
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_member_custom_values CASCADE;
DROP TABLE IF EXISTS family_custom_fields CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_family_with_admin(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS kick_family_member(UUID, UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS ban_family_member(UUID, UUID, UUID, TEXT, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS unban_family_member(UUID, UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_message_read(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS expire_temporary_bans() CASCADE;

-- =====================================================
-- PART 2: FAMILY SYSTEM TABLES
-- =====================================================

-- Families Table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
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
  invited_by UUID REFERENCES family_members(id),
  invitation_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, email)
);

-- Custom Fields Table
CREATE TABLE family_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text',
  field_order INTEGER,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, field_name)
);

-- Custom Field Values Table
CREATE TABLE family_member_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  field_id UUID REFERENCES family_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, field_id)
);

-- Family Events Table
CREATE TABLE family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  related_members UUID[],
  created_by UUID REFERENCES family_members(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Relationships Table
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  related_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, related_member_id, relationship_type)
);

-- Invitation Tokens Table
CREATE TABLE family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES family_members(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 3: MESSAGING SYSTEM TABLES
-- =====================================================

-- Messages Table
CREATE TABLE family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
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
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banned Members Table
CREATE TABLE family_banned_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unban_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(family_id, member_id)
);

-- Message Reactions Table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES family_messages(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, member_id, reaction_type)
);

-- =====================================================
-- PART 4: INDEXES FOR PERFORMANCE
-- =====================================================

-- Family system indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_events_family_id ON family_events(family_id);
CREATE INDEX idx_family_events_date ON family_events(event_date);
CREATE INDEX idx_family_relationships_member ON family_relationships(member_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);

-- Messaging system indexes
CREATE INDEX idx_messages_family_id ON family_messages(family_id);
CREATE INDEX idx_messages_sender_id ON family_messages(sender_id);
CREATE INDEX idx_messages_created_at ON family_messages(created_at DESC);
CREATE INDEX idx_admin_actions_family_id ON family_admin_actions(family_id);
CREATE INDEX idx_admin_actions_target ON family_admin_actions(target_member_id);
CREATE INDEX idx_banned_members_family ON family_banned_members(family_id);
CREATE INDEX idx_banned_members_member ON family_banned_members(member_id);

-- =====================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
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
-- RLS POLICIES: FAMILIES
-- =====================================================

CREATE POLICY "Users can view their own family"
  ON families FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Primary admin can update family"
  ON families FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
      AND family_members.is_primary_admin = true
    )
  );

-- =====================================================
-- RLS POLICIES: FAMILY MEMBERS
-- =====================================================

CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can add family members"
  ON family_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.is_admin = true
    )
  );

CREATE POLICY "Admins can update family members"
  ON family_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.is_admin = true
    )
  );

-- =====================================================
-- RLS POLICIES: FAMILY EVENTS
-- =====================================================

CREATE POLICY "Users can view family events"
  ON family_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create family events"
  ON family_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_events.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.is_admin = true
    )
  );

-- =====================================================
-- RLS POLICIES: CUSTOM FIELDS
-- =====================================================

CREATE POLICY "Users can view custom fields"
  ON family_custom_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage custom fields"
  ON family_custom_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = family_custom_fields.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.is_admin = true
    )
  );

-- =====================================================
-- RLS POLICIES: MESSAGES
-- =====================================================

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

CREATE POLICY "Users can update own messages"
  ON family_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.id = family_messages.sender_id
      AND family_members.user_id = auth.uid()
    )
  );

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

-- =====================================================
-- RLS POLICIES: ADMIN ACTIONS
-- =====================================================

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

-- =====================================================
-- RLS POLICIES: BANNED MEMBERS
-- =====================================================

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
-- PART 6: FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a new family with primary admin
CREATE OR REPLACE FUNCTION create_family_with_admin(
  p_family_name VARCHAR,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_email VARCHAR,
  p_subscription_type VARCHAR DEFAULT 'free_trial'
)
RETURNS UUID AS $$
DECLARE
  v_family_id UUID;
  v_member_id UUID;
  v_subscription_end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_subscription_type = 'free_trial' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  ELSIF p_subscription_type = 'paid' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  END IF;

  INSERT INTO families (family_name, created_by, subscription_type, subscription_end_date)
  VALUES (p_family_name, auth.uid(), p_subscription_type, v_subscription_end_date)
  RETURNING id INTO v_family_id;

  INSERT INTO family_members (
    family_id, user_id, email, first_name, last_name, 
    is_admin, is_primary_admin, invitation_accepted
  )
  VALUES (
    v_family_id, auth.uid(), p_email, p_first_name, p_last_name,
    true, true, true
  )
  RETURNING id INTO v_member_id;

  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to kick a family member
CREATE OR REPLACE FUNCTION kick_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_primary_admin BOOLEAN;
BEGIN
  SELECT is_admin, is_primary_admin INTO v_is_admin, v_is_primary_admin
  FROM family_members
  WHERE id = p_admin_id AND family_id = p_family_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can kick members';
  END IF;

  SELECT is_primary_admin INTO v_is_primary_admin
  FROM family_members
  WHERE id = p_target_member_id;

  IF v_is_primary_admin THEN
    RAISE EXCEPTION 'Cannot kick the primary admin';
  END IF;

  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type, reason)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'kick', p_reason);

  DELETE FROM family_members WHERE id = p_target_member_id;

  INSERT INTO family_messages (family_id, sender_id, message_text, message_type, is_admin_message)
  VALUES (
    p_family_id, 
    p_admin_id, 
    'A member has been removed from the family.',
    'system',
    true
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to ban a family member
CREATE OR REPLACE FUNCTION ban_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_duration_days INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_primary_admin BOOLEAN;
  v_unban_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM family_members
  WHERE id = p_admin_id AND family_id = p_family_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can ban members';
  END IF;

  SELECT is_primary_admin INTO v_is_primary_admin
  FROM family_members
  WHERE id = p_target_member_id;

  IF v_is_primary_admin THEN
    RAISE EXCEPTION 'Cannot ban the primary admin';
  END IF;

  IF p_duration_days IS NOT NULL THEN
    v_unban_at := NOW() + (p_duration_days || ' days')::INTERVAL;
  END IF;

  INSERT INTO family_banned_members (family_id, member_id, banned_by, reason, unban_at)
  VALUES (p_family_id, p_target_member_id, p_admin_id, p_reason, v_unban_at)
  ON CONFLICT (family_id, member_id) 
  DO UPDATE SET is_active = true, banned_at = NOW(), unban_at = v_unban_at, reason = p_reason;

  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type, reason)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'ban', p_reason);

  INSERT INTO family_messages (family_id, sender_id, message_text, message_type, is_admin_message)
  VALUES (
    p_family_id, 
    p_admin_id, 
    'A member has been banned from the family chat.',
    'system',
    true
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unban a family member
CREATE OR REPLACE FUNCTION unban_family_member(
  p_family_id UUID,
  p_admin_id UUID,
  p_target_member_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE family_banned_members
  SET is_active = false
  WHERE family_id = p_family_id AND member_id = p_target_member_id;

  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'unban');

  INSERT INTO family_messages (family_id, sender_id, message_text, message_type, is_admin_message)
  VALUES (
    p_family_id, 
    p_admin_id, 
    'A member has been unbanned and can now participate in the chat.',
    'system',
    true
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_message_read(
  p_message_id UUID,
  p_member_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE family_messages
  SET read_by = array_append(read_by, p_member_id)
  WHERE id = p_message_id
  AND NOT (p_member_id = ANY(read_by));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire temporary bans
CREATE OR REPLACE FUNCTION expire_temporary_bans()
RETURNS void AS $$
BEGIN
  UPDATE family_banned_members
  SET is_active = false
  WHERE is_active = true
  AND unban_at IS NOT NULL
  AND unban_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Enable Realtime in Supabase Dashboard for:
--    - family_messages
--    - family_admin_actions
--    - family_banned_members
-- 2. Start your Next.js app: npm run dev
-- 3. Visit: http://localhost:3000/family-chat
-- =====================================================
