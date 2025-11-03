-- Apna Parivar Family Tree Database Schema

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
    member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    related_to_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- father, mother, son, daughter, etc.
    is_primary BOOLEAN DEFAULT false, -- primary relationship for tree structure
    created_by UUID REFERENCES family_members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, related_to_id, relationship_type)
);

-- Family Events Table
CREATE TABLE IF NOT EXISTS family_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- birthday, anniversary, wedding, memorial, celebration
    event_date DATE NOT NULL,
    location VARCHAR(255),
    created_by UUID REFERENCES family_members(id),
    attendees JSONB DEFAULT '[]', -- Array of member IDs
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- yearly, monthly, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Statistics Table
CREATE TABLE IF NOT EXISTS family_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    family_id UUID NOT NULL, -- Main admin's ID
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    new_members_this_month INTEGER DEFAULT 0,
    upcoming_events INTEGER DEFAULT 0,
    family_tree_depth INTEGER DEFAULT 1,
    average_age DECIMAL(5,2) DEFAULT 0,
    oldest_member_id UUID REFERENCES family_members(id),
    youngest_member_id UUID REFERENCES family_members(id),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id)
);

-- Family Activities Log Table
CREATE TABLE IF NOT EXISTS family_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL, -- member_added, event_created, profile_updated, etc.
    member_id UUID REFERENCES family_members(id),
    performed_by UUID REFERENCES family_members(id),
    details TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Admin Roles Table
CREATE TABLE IF NOT EXISTS family_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
    family_id UUID NOT NULL, -- Main admin's ID
    role VARCHAR(50) DEFAULT 'admin', -- main_admin, admin
    permissions JSONB DEFAULT '{}',
    granted_by UUID REFERENCES family_members(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(member_id, family_id)
);

-- Family Memories Table
CREATE TABLE IF NOT EXISTS family_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    memory_type VARCHAR(50) NOT NULL, -- photo, video, story, document
    file_url TEXT,
    thumbnail_url TEXT,
    tags JSONB DEFAULT '[]',
    shared_with JSONB DEFAULT '[]', -- Array of member IDs
    uploaded_by UUID REFERENCES family_members(id),
    memory_date DATE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
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

-- Row Level Security (RLS) Policies
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can view family members in their tree" ON family_members
    FOR SELECT USING (
        added_by_id = auth.uid() OR 
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM family_relationships 
            WHERE (member_id = auth.uid() AND related_to_id = family_members.id) OR
                  (related_to_id = auth.uid() AND member_id = family_members.id)
        )
    );

CREATE POLICY "Users can insert family members" ON family_members
    FOR INSERT WITH CHECK (added_by_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON family_members
    FOR UPDATE USING (id = auth.uid() OR added_by_id = auth.uid());

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_relationships_updated_at BEFORE UPDATE ON family_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_memories_updated_at BEFORE UPDATE ON family_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();