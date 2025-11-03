-- Simple Family Tables Setup (No Foreign Key Constraints)
-- Copy and paste this into your Supabase SQL Editor

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS family_memories CASCADE;
DROP TABLE IF EXISTS family_admins CASCADE;
DROP TABLE IF EXISTS family_activities CASCADE;
DROP TABLE IF EXISTS family_stats CASCADE;
DROP TABLE IF EXISTS family_events CASCADE;
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;

-- 1. Family Members Table (Main table)
CREATE TABLE family_members (
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
    added_by_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_online BOOLEAN DEFAULT false,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Family Relationships Table
CREATE TABLE family_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID,
    related_to_id VARCHAR(255),
    relationship_type VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Family Statistics Table
CREATE TABLE family_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id VARCHAR(255) NOT NULL,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    new_members_this_month INTEGER DEFAULT 0,
    upcoming_events INTEGER DEFAULT 0,
    family_tree_depth INTEGER DEFAULT 1,
    average_age DECIMAL(5,2) DEFAULT 0,
    oldest_member_id UUID,
    youngest_member_id UUID,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Family Activities Log Table
CREATE TABLE family_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    member_id UUID,
    performed_by VARCHAR(255),
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Family Events Table
CREATE TABLE family_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    created_by VARCHAR(255),
    attendees JSONB DEFAULT '[]',
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Family Admin Roles Table
CREATE TABLE family_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID,
    family_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}',
    granted_by VARCHAR(255),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 7. Family Memories Table
CREATE TABLE family_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    memory_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    thumbnail_url TEXT,
    tags JSONB DEFAULT '[]',
    shared_with JSONB DEFAULT '[]',
    uploaded_by VARCHAR(255),
    memory_date DATE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_members_added_by_id ON family_members(added_by_id);
CREATE INDEX idx_family_members_is_active ON family_members(is_active);
CREATE INDEX idx_family_relationships_member_id ON family_relationships(member_id);
CREATE INDEX idx_family_activities_member_id ON family_activities(member_id);

-- Enable Row Level Security (RLS) with permissive policies for testing
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memories ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for testing)
CREATE POLICY "Allow all on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_relationships" ON family_relationships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_events" ON family_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_stats" ON family_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_activities" ON family_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_admins" ON family_admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_memories" ON family_memories FOR ALL USING (true) WITH CHECK (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_family_members_updated_at 
    BEFORE UPDATE ON family_members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_relationships_updated_at 
    BEFORE UPDATE ON family_relationships 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_events_updated_at 
    BEFORE UPDATE ON family_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_memories_updated_at 
    BEFORE UPDATE ON family_memories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test record to verify everything works
INSERT INTO family_members (
    name, 
    relation, 
    email, 
    added_by, 
    added_by_id,
    custom_fields
) VALUES (
    'Test Admin', 
    'Admin', 
    'admin@test.com', 
    'System', 
    'system-admin',
    '{"role": "admin", "test": true}'
);

-- Verify setup
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
    RAISE NOTICE '✅ Simple family tables setup complete!';
    RAISE NOTICE '✅ All 7 tables created without foreign key constraints';
    RAISE NOTICE '✅ Test record inserted successfully';
    RAISE NOTICE '✅ RLS policies set to permissive for testing';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- family_members (with test record)';
    RAISE NOTICE '- family_relationships';
    RAISE NOTICE '- family_events';
    RAISE NOTICE '- family_stats';
    RAISE NOTICE '- family_activities';
    RAISE NOTICE '- family_admins';
    RAISE NOTICE '- family_memories';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready to test! Try adding a family member now.';
END $$;