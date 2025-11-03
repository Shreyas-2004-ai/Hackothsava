-- =====================================================
-- APNAPARIVAR REALTIME MESSAGING & ADMIN CONTROL SYSTEM
-- =====================================================
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. MESSAGES TABLE (Realtime Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'system', 'announcement'
  is_admin_message BOOLEAN DEFAULT false,
  read_by UUID[] DEFAULT '{}', -- Array of member IDs who read the message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ADMIN ACTIONS TABLE (Kick/Ban History)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  target_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'kick', 'ban', 'unban', 'warn'
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BANNED MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS family_banned_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES family_members(id) ON DELETE SET NULL,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unban_at TIMESTAMP WITH TIME ZONE, -- NULL means permanent ban
  is_active BOOLEAN DEFAULT true,
  UNIQUE(family_id, member_id)
);

-- =====================================================
-- 4. MESSAGE REACTIONS TABLE (Optional - for likes/reactions)
-- =====================================================
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES family_messages(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) DEFAULT 'like', -- 'like', 'love', 'laugh', 'sad', 'angry'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, member_id, reaction_type)
);

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_messages_family_id ON family_messages(family_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON family_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON family_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_family_id ON family_admin_actions(family_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON family_admin_actions(target_member_id);
CREATE INDEX IF NOT EXISTS idx_banned_members_family ON family_banned_members(family_id);
CREATE INDEX IF NOT EXISTS idx_banned_members_member ON family_banned_members(member_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_banned_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

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

-- Banned Members: Admins can manage bans
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
-- 7. REALTIME PUBLICATION
-- =====================================================

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE family_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE family_admin_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE family_banned_members;

-- =====================================================
-- 8. FUNCTIONS
-- =====================================================

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
  -- Check if the admin has permission
  SELECT is_admin, is_primary_admin INTO v_is_admin, v_is_primary_admin
  FROM family_members
  WHERE id = p_admin_id AND family_id = p_family_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admins can kick members';
  END IF;

  -- Check if target is primary admin (cannot be kicked)
  SELECT is_primary_admin INTO v_is_primary_admin
  FROM family_members
  WHERE id = p_target_member_id;

  IF v_is_primary_admin THEN
    RAISE EXCEPTION 'Cannot kick the primary admin';
  END IF;

  -- Log the action
  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type, reason)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'kick', p_reason);

  -- Delete the member
  DELETE FROM family_members WHERE id = p_target_member_id;

  -- Send system message
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
  p_duration_days INTEGER DEFAULT NULL -- NULL means permanent
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_primary_admin BOOLEAN;
  v_unban_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if the admin has permission
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

  -- Calculate unban date
  IF p_duration_days IS NOT NULL THEN
    v_unban_at := NOW() + (p_duration_days || ' days')::INTERVAL;
  END IF;

  -- Add to banned list
  INSERT INTO family_banned_members (family_id, member_id, banned_by, reason, unban_at)
  VALUES (p_family_id, p_target_member_id, p_admin_id, p_reason, v_unban_at)
  ON CONFLICT (family_id, member_id) 
  DO UPDATE SET is_active = true, banned_at = NOW(), unban_at = v_unban_at, reason = p_reason;

  -- Log the action
  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type, reason)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'ban', p_reason);

  -- Send system message
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
  -- Update ban status
  UPDATE family_banned_members
  SET is_active = false
  WHERE family_id = p_family_id AND member_id = p_target_member_id;

  -- Log the action
  INSERT INTO family_admin_actions (family_id, admin_id, target_member_id, action_type)
  VALUES (p_family_id, p_admin_id, p_target_member_id, 'unban');

  -- Send system message
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

-- =====================================================
-- 9. AUTOMATIC BAN EXPIRY (Optional - Run via cron)
-- =====================================================
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
-- 1. Enable Realtime in Supabase Dashboard for these tables
-- 2. Create the messaging UI components
-- 3. Set up admin dashboard for member management
-- 4. Test the kick/ban functionality
