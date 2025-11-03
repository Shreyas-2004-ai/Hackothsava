-- ApnaParivar Authentication & Family Management Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- 0. CLEANUP (Drop existing objects if they exist)
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
DROP TRIGGER IF EXISTS update_family_events_updated_at ON family_events;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_family_with_admin(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own family" ON families;
DROP POLICY IF EXISTS "Primary admin can update family" ON families;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Admins can add family members" ON family_members;
DROP POLICY IF EXISTS "Admins can update family members" ON family_members;
DROP POLICY IF EXISTS "Users can view family events" ON family_events;
DROP POLICY IF EXISTS "Admins can create family events" ON family_events;
DROP POLICY IF EXISTS "Users can view custom fields" ON family_custom_fields;
DROP POLICY IF EXISTS "Admins can manage custom fields" ON family_custom_fields;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS family_invitations CASCADE;
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_member_custom_values CASCADE;
DROP TABLE IF EXISTS family_custom_fields CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- =====================================================
-- 1. FAMILIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) DEFAULT 'free_trial', -- 'free_trial' or 'paid'
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. FAMILY MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  relation VARCHAR(100), -- Father, Mother, Son, Daughter, etc.
  photo_url TEXT,
  date_of_birth DATE,
  phone VARCHAR(20),
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_primary_admin BOOLEAN DEFAULT false, -- The first admin who created the family
  invited_by UUID REFERENCES family_members(id),
  invitation_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, email)
);

-- =====================================================
-- 3. CUSTOM FIELDS TABLE (10 programmable fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(50) DEFAULT 'text', -- text, number, date, boolean
  field_order INTEGER,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, field_name)
);

-- =====================================================
-- 4. CUSTOM FIELD VALUES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS family_member_custom_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  field_id UUID REFERENCES family_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, field_id)
);

-- =====================================================
-- 5. FAMILY EVENTS TABLE (Marriages, Deaths, Functions)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'wedding', 'death', 'birthday', 'anniversary', 'function', 'other'
  event_title VARCHAR(255) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  event_location VARCHAR(255),
  related_members UUID[], -- Array of member IDs involved in the event
  created_by UUID REFERENCES family_members(id),
  is_public BOOLEAN DEFAULT true, -- Show in news ticker
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. FAMILY RELATIONSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  related_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL, -- 'spouse', 'parent', 'child', 'sibling', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, related_member_id, relationship_type)
);

-- =====================================================
-- 7. INVITATION TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS family_invitations (
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
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_email ON family_members(email);
CREATE INDEX IF NOT EXISTS idx_family_events_family_id ON family_events(family_id);
CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(event_date);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member ON family_relationships(member_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(token);

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Families: Users can only see their own family
CREATE POLICY "Users can view their own family"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Families: Only primary admin can update
CREATE POLICY "Primary admin can update family"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND is_primary_admin = true
    )
  );

-- Family Members: Users can view members in their family
CREATE POLICY "Users can view family members"
  ON family_members FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Family Members: Admins can insert new members
CREATE POLICY "Admins can add family members"
  ON family_members FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Family Members: Admins can update members
CREATE POLICY "Admins can update family members"
  ON family_members FOR UPDATE
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Family Events: Users can view events in their family
CREATE POLICY "Users can view family events"
  ON family_events FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Family Events: Admins can create events
CREATE POLICY "Admins can create family events"
  ON family_events FOR INSERT
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Custom Fields: Users can view custom fields
CREATE POLICY "Users can view custom fields"
  ON family_custom_fields FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Custom Fields: Admins can manage custom fields
CREATE POLICY "Admins can manage custom fields"
  ON family_custom_fields FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- =====================================================
-- 10. FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
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
  -- Calculate subscription end date
  IF p_subscription_type = 'free_trial' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  ELSIF p_subscription_type = 'paid' THEN
    v_subscription_end_date := NOW() + INTERVAL '1 year';
  END IF;

  -- Create family
  INSERT INTO families (family_name, created_by, subscription_type, subscription_end_date)
  VALUES (p_family_name, auth.uid(), p_subscription_type, v_subscription_end_date)
  RETURNING id INTO v_family_id;

  -- Create primary admin member
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

-- =====================================================
-- 11. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- You can uncomment this to add sample data
/*
-- Create a sample family (you'll need to replace the user_id with actual auth.users id)
INSERT INTO families (family_name, created_by, subscription_type)
VALUES ('Sharma Family', 'YOUR_USER_ID_HERE', 'free_trial');

-- Add sample family members
INSERT INTO family_members (family_id, email, first_name, last_name, relation, is_admin, is_primary_admin)
VALUES 
  ((SELECT id FROM families WHERE family_name = 'Sharma Family'), 'ramesh@example.com', 'Ramesh', 'Sharma', 'Father', true, true),
  ((SELECT id FROM families WHERE family_name = 'Sharma Family'), 'priya@example.com', 'Priya', 'Sharma', 'Mother', false, false),
  ((SELECT id FROM families WHERE family_name = 'Sharma Family'), 'arun@example.com', 'Arun', 'Sharma', 'Son', false, false);
*/

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Enable Google OAuth in Supabase Authentication settings
-- 2. Configure email templates for invitations
-- 3. Set up storage buckets for family photos
-- 4. Create the login pages in your Next.js app
