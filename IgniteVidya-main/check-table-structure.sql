-- Check the actual structure of family_members table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'family_members'
ORDER BY ordinal_position;
