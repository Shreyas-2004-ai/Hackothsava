-- Fix RLS Policy for Adding Family Members
-- Run this in Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admins can add family members" ON family_members;

-- Create a new policy that allows admins to add members
CREATE POLICY "Admins can add family members"
ON family_members FOR INSERT
WITH CHECK (
  -- Allow insert if the user is an admin in the same family
  EXISTS (
    SELECT 1 FROM family_members
    WHERE family_members.user_id = auth.uid()
    AND family_members.family_id = family_members.family_id
    AND family_members.is_admin = true
  )
);

-- Alternative: Simpler policy that just checks if user is an admin
DROP POLICY IF EXISTS "Admins can add family members" ON family_members;

CREATE POLICY "Admins can add family members"
ON family_members FOR INSERT
WITH CHECK (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm
    WHERE fm.user_id = auth.uid() 
    AND fm.is_admin = true
  )
);

-- Also make sure the SELECT policy allows viewing family members
DROP POLICY IF EXISTS "Users can view family members" ON family_members;

CREATE POLICY "Users can view family members"
ON family_members FOR SELECT
USING (
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm
    WHERE fm.user_id = auth.uid()
  )
);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'family_members';
