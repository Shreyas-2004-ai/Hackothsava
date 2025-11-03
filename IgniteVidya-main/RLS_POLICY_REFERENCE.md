# RLS Policy Reference - ApnaParivar

## Quick Reference: Who Can Do What

### 👨‍👩‍👧‍👦 Family Members (Regular Users)

**CAN:**
- ✅ View their own family details
- ✅ View all family members in their family
- ✅ View family events
- ✅ View family tree/relationships
- ✅ View and send chat messages (if not banned)
- ✅ React to messages
- ✅ Update their own messages
- ✅ View custom fields and values

**CANNOT:**
- ❌ Add or remove family members
- ❌ Edit other members' information
- ❌ Create or modify events
- ❌ Delete messages
- ❌ Ban or kick members
- ❌ View admin actions
- ❌ Modify family settings

### 👑 Family Admins (admin2, admin3, etc.)

**CAN (Everything Members Can, PLUS):**
- ✅ Add new family members
- ✅ Edit any family member's information
- ✅ Remove family members (except primary admin)
- ✅ Create, edit, and delete family events
- ✅ Manage custom fields
- ✅ Edit custom field values for any member
- ✅ Delete any chat message
- ✅ Ban/unban members from chat
- ✅ Kick members from family
- ✅ View admin action logs
- ✅ Send invitations

**CANNOT:**
- ❌ Delete or demote the primary admin
- ❌ Modify family subscription settings
- ❌ Delete the family

### 👑👑 Primary Admin (admin1)

**CAN (Everything Admins Can, PLUS):**
- ✅ Update family settings
- ✅ Manage subscription
- ✅ Promote members to admin
- ✅ Demote other admins
- ✅ Cannot be removed or banned

## Detailed Policy Breakdown

### FAMILIES Table

| Action | Who Can Do It | Condition |
|--------|---------------|-----------|
| SELECT | All family members | User is a member of the family |
| INSERT | Any authenticated user | Creating their own family |
| UPDATE | Primary admin only | User is the primary admin |
| DELETE | No one | Not implemented (soft delete recommended) |

### FAMILY_MEMBERS Table

| Action | Who Can Do It | Condition |
|--------|---------------|-----------|
| SELECT | All family members | User is in the same family |
| INSERT | Admins | User is an admin in that family |
| UPDATE | Admins | User is an admin in that family |
| DELETE | Admins | Target is not primary admin |

### FAMILY_MESSAGES Table

| Action | Who Can Do It | Condition |
|--------|---------------|-----------|
| SELECT | Non-banned members | User is not banned |
| INSERT | Non-banned members | User is not banned |
| UPDATE | Message sender | User sent the message |
| DELETE | Admins | User is an admin |

### FAMILY_ADMIN_ACTIONS Table

| Action | Who Can Do It | Condition |
|--------|---------------|-----------|
| SELECT | Admins | User is an admin |
| INSERT | Admins | User is an admin |
| UPDATE | No one | Audit log is immutable |
| DELETE | No one | Audit log is immutable |

### FAMILY_BANNED_MEMBERS Table

| Action | Who Can Do It | Condition |
|--------|---------------|-----------|
| SELECT | Admins | User is an admin |
| INSERT | Admins | User is an admin |
| UPDATE | Admins | For unbanning members |
| DELETE | No one | Use UPDATE to deactivate |

## Common Scenarios

### Scenario 1: New User Signs Up

1. User authenticates with Google OAuth
2. User record created in `auth.users`
3. User can now create a family (INSERT on families)
4. `create_family_with_admin()` function creates:
   - Family record
   - Family member record (user as primary admin)

**RLS Check:** ✅ User can insert because `auth.uid() = created_by`

### Scenario 2: Admin Adds a New Member

1. Admin fills out "Add Member" form
2. API calls INSERT on `family_members`
3. RLS checks: Is the requester an admin in this family?
4. If yes, member is added
5. Email notification sent to new member

**RLS Check:** ✅ Admin can insert because they have `is_admin = true`

### Scenario 3: Member Tries to Add Another Member

1. Regular member tries to add someone
2. API calls INSERT on `family_members`
3. RLS checks: Is the requester an admin?
4. Check fails (user is not admin)
5. INSERT is blocked

**RLS Check:** ❌ Blocked because `is_admin = false`

### Scenario 4: Banned Member Tries to Send Message

1. Banned member tries to send a message
2. API calls INSERT on `family_messages`
3. RLS checks: Is user banned?
4. User found in `family_banned_members` with `is_active = true`
5. INSERT is blocked

**RLS Check:** ❌ Blocked because user is in banned list

### Scenario 5: Admin Promotes Member to Admin

1. Primary admin selects a member
2. API calls UPDATE on `family_members` setting `is_admin = true`
3. RLS checks: Is requester an admin?
4. Check passes
5. Member is now an admin

**RLS Check:** ✅ Admin can update because they have `is_admin = true`

### Scenario 6: User Tries to View Another Family

1. User tries to query families table
2. RLS checks: Is user a member of this family?
3. Check fails (user not in family_members for this family)
4. No rows returned

**RLS Check:** ❌ Blocked because user is not a family member

## Testing RLS Policies

### Test 1: Verify User Can Only See Their Family

```sql
-- As authenticated user
SELECT * FROM families;
-- Should only return families where you're a member
```

### Test 2: Verify Non-Admin Cannot Add Members

```sql
-- As non-admin user, try to insert
INSERT INTO family_members (family_id, email, first_name, last_name)
VALUES ('some-family-id', 'test@example.com', 'Test', 'User');
-- Should fail with RLS error
```

### Test 3: Verify Banned User Cannot Send Messages

```sql
-- First ban a user
SELECT ban_family_member(
  'family-id',
  'admin-member-id',
  'target-member-id',
  'Test ban',
  NULL
);

-- Then try to insert message as banned user
INSERT INTO family_messages (family_id, sender_id, message_text)
VALUES ('family-id', 'banned-member-id', 'Test message');
-- Should fail with RLS error
```

## Security Best Practices

### ✅ DO:
- Always use `auth.uid()` to identify the current user
- Check admin status before allowing modifications
- Use SECURITY DEFINER functions for complex operations
- Log all admin actions for audit trail
- Validate input on both client and server side

### ❌ DON'T:
- Never disable RLS in production
- Don't trust client-side checks alone
- Don't expose service role key to frontend
- Don't allow primary admin to be deleted
- Don't skip authentication checks

## RLS Policy Patterns Used

### Pattern 1: Member of Family Check
```sql
EXISTS (
  SELECT 1 FROM family_members
  WHERE family_members.family_id = target_table.family_id
    AND family_members.user_id = auth.uid()
)
```

### Pattern 2: Admin Check
```sql
EXISTS (
  SELECT 1 FROM family_members
  WHERE family_members.family_id = target_table.family_id
    AND family_members.user_id = auth.uid()
    AND family_members.is_admin = true
)
```

### Pattern 3: Not Banned Check
```sql
member_id NOT IN (
  SELECT member_id FROM family_banned_members
  WHERE family_id = target_table.family_id
    AND is_active = true
)
```

### Pattern 4: Owner Check
```sql
EXISTS (
  SELECT 1 FROM family_members
  WHERE family_members.id = target_table.sender_id
    AND family_members.user_id = auth.uid()
)
```

## Debugging RLS Issues

### Issue: "permission denied for table X"

**Cause:** RLS policy is blocking the operation

**Debug Steps:**
1. Check if user is authenticated: `SELECT auth.uid();`
2. Check if user is in family: `SELECT * FROM family_members WHERE user_id = auth.uid();`
3. Check if user has required role: `SELECT is_admin FROM family_members WHERE user_id = auth.uid();`
4. Review the specific policy for that operation

### Issue: Query returns no rows but data exists

**Cause:** RLS is filtering out rows user doesn't have access to

**Debug Steps:**
1. Verify user is member of the family
2. Check if user is banned (for messages)
3. Temporarily disable RLS to see all data (dev only!)

```sql
-- DEV ONLY - Never in production!
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- Check data
SELECT * FROM table_name;
-- Re-enable
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Performance Considerations

- Indexes are created on frequently queried columns
- RLS policies use EXISTS for efficient subqueries
- Banned member checks use indexed columns
- Admin checks are optimized with boolean index

## Summary

The RLS policies ensure:
1. **Data Isolation**: Families can't see each other's data
2. **Role-Based Access**: Admins have more permissions
3. **Audit Trail**: All admin actions are logged
4. **Ban Enforcement**: Banned users can't participate
5. **Primary Admin Protection**: Can't be removed or banned

---

**Remember:** RLS is your last line of defense. Always implement proper authentication and authorization in your application code as well!
