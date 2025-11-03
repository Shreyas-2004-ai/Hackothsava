-- Temporarily disable RLS for testing
-- Run this in Supabase SQL Editor

-- Disable RLS on family_members table
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Disable RLS on families table
ALTER TABLE families DISABLE ROW LEVEL SECURITY;

-- Disable RLS on family_custom_fields table
ALTER TABLE family_custom_fields DISABLE ROW LEVEL SECURITY;

-- Disable RLS on family_member_custom_values table
ALTER TABLE family_member_custom_values DISABLE ROW LEVEL SECURITY;

-- Now try adding a family member - it should work!

-- IMPORTANT: After testing, re-enable RLS with:
-- ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE families ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE family_custom_fields ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE family_member_custom_values ENABLE ROW LEVEL SECURITY;
