-- Setup Family Tables for Apna Parivar
-- Copy and paste this into your Supabase SQL Editor

-- ============================================
-- 1. CREATE FAMILY TABLES
-- ============================================

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    photo_url TEXT,
    age INTEGER,
    location VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    added_by VARCHAR(255),
    added_by_id UUID,
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Relationships Table
CREATE TABLE IF NOT EXISTS family_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID,
    related_to_id UUID,
    relationship_type VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, related_to_id, relationship_type)
);

-- Family Events Table
CREATE TABLE IF NOT EXISTS family_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    created_by UUID,
    attendees JSONB DEFAULT '[]',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Statistics Table
CREATE TABLE IF NOT EXISTS family_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    new_members_this_month INTEGER DEFAULT 0,
    upcoming_events INTEGER DEFAULT 0,
    family_tree_depth INTEGER DEFAULT 1,
    average_age DECIMAL(5,2) DEFAULT 0,
    oldest_member_id UUID,
    youngest_member_id UUID,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id)
);

-- Family Activities Log Table
CREATE TABLE IF NOT EXISTS family_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    member_id UUID,
    performed_by UUID,
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Admin Roles Table
CREATE TABLE IF NOT EXISTS family_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID,
    family_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(member_id, family_id)
);

-- Family Memories Table
CREATE TABLE IF NOT EXISTS family_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    memory_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT,
    tags JSONB DEFAULT '[]',
    shared_with JSONB DEFAULT '[]',
    uploaded_by UUID,
    memory_date DATE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_family_members_email ON family_members(email);
CREATE INDEX IF NOT EXISTS idx_family_members_added_by_id ON family_members(added_by_id);
CREATE INDEX IF NOT EXISTS idx_family_members_is_active ON family_members(is_active);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_id ON family_relationships(member_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_related_to_id ON family_relationships(related_to_id);
CREATE INDEX IF NOT EXISTS idx_family_events_event_date ON family_events(event_date);
CREATE INDEX IF NOT EXISTS idx_family_events_created_by ON family_events(created_by);
CREATE INDEX IF NOT EXISTS idx_family_activities_member_id ON family_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_family_activities_performed_by ON family_activities(performed_by);
CREATE INDEX IF NOT EXISTS idx_family_activities_created_at ON family_activities(created_at);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES (PERMISSIVE FOR TESTING)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on family_members" ON family_members;
DROP POLICY IF EXISTS "Allow all operations on family_relationships" ON family_relationships;
DROP POLICY IF EXISTS "Allow all operations on family_events" ON family_events;
DROP POLICY IF EXISTS "Allow all operations on family_stats" ON family_stats;
DROP POLICY IF EXISTS "Allow all operations on family_activities" ON family_activities;
DROP POLICY IF EXISTS "Allow all operations on family_admins" ON family_admins;
DROP POLICY IF EXISTS "Allow all operations on family_memories" ON family_memories;

-- Create permissive policies for testing (you can make these more restrictive later)
CREATE POLICY "Allow all operations on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_relationships" ON family_relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_events" ON family_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_stats" ON family_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_activities" ON family_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_admins" ON family_admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on family_memories" ON family_memories FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. CREATE UPDATE TRIGGERS
-- ============================================

-- Function for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
DROP TRIGGER IF EXISTS update_family_relationships_updated_at ON family_relationships;
DROP TRIGGER IF EXISTS update_family_events_updated_at ON family_events;
DROP TRIGGER IF EXISTS update_family_memories_updated_at ON family_memories;

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_relationships_updated_at BEFORE UPDATE ON family_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_memories_updated_at BEFORE UPDATE ON family_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. VERIFY SETUP
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'family_%'
ORDER BY table_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Family tables setup complete!';
  RAISE NOTICE '✅ All 7 family tables created';
  RAISE NOTICE '✅ RLS policies applied (permissive for testing)';
  RAISE NOTICE '✅ Indexes created for performance';
  RAISE NOTICE '✅ Update triggers added';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- family_members';
  RAISE NOTICE '- family_relationships';
  RAISE NOTICE '- family_events';
  RAISE NOTICE '- family_stats';
  RAISE NOTICE '- family_activities';
  RAISE NOTICE '- family_admins';
  RAISE NOTICE '- family_memories';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test the add family member functionality';
  RAISE NOTICE '2. Check the debug script: node debug-family-system.js';
END $$;