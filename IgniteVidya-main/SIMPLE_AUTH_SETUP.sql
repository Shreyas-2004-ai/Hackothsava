-- =====================================================
-- APNAPARIVAR SIMPLE AUTHENTICATION SETUP
-- =====================================================
-- This creates tables WITHOUT RLS for initial testing
-- Run this first to get authentication working
-- We'll add RLS security later once everything works
-- =====================================================

-- =====================================================
-- STEP 1: CLEANUP
-- =====================================================

DROP TRIGGER IF EXISTS update_families_updated_at ON families CASCADE;
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members CASCADE;
DROP TRIGGER IF EXISTS update_family_events_updated_at ON family_events CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS create_family_with_admin(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;

DROP TABLE IF EXISTS family_invitations CASCADE;
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_member_custom_values CASCADE;
DROP TABLE IF EXISTS family_custom_fields CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES (NO RLS YET)
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

-- Custom Fields Table
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
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_members_is_admin ON family_members(is_admin) WHERE is_admin = true;
CREATE INDEX idx_family_events_family_id ON family_events(family_id);
CREATE INDEX idx_family_events_date ON family_events(event_date DESC);
CREATE INDEX idx_family_relationships_member ON family_relationships(member_id);
CREATE INDEX idx_family_relationships_related ON family_relationships(related_member_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(token);

-- =====================================================
-- STEP 4: DISABLE RLS (FOR NOW)
-- =====================================================

ALTER TABLE families DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_custom_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_member_custom_values DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
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

-- =====================================================
-- STEP 6: CREATE FAMILY WITH ADMIN FUNCTION
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
-- VERIFICATION QUERIES
-- =====================================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is disabled (should show false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Configure Google OAuth in Supabase Dashboard
-- 2. Test authentication flow
-- 3. Create a test family
-- 4. Once everything works, run ENABLE_RLS.sql to add security
-- =====================================================
