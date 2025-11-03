# ApnaParivar Authentication & Authorization Flow

## 🔐 Complete Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER VISITS APNAPARIVAR.COM                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Landing Page  │
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
    ┌───────────────────┐     ┌──────────────────┐
    │ Create a Family   │     │  Sign In         │
    │ (New Admin)       │     │  (Existing User) │
    └─────────┬─────────┘     └────────┬─────────┘
              │                        │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Sign in with Google    │
              │ (OAuth 2.0)            │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Google Authentication  │
              │ - User selects account │
              │ - Grants permissions   │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ Supabase Auth          │
              │ - Creates auth.users   │
              │ - Returns JWT token    │
              └────────────┬───────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
    ┌───────────────────┐   ┌────────────────────┐
    │ NEW USER          │   │ EXISTING USER      │
    │ (No family yet)   │   │ (Has family)       │
    └─────────┬─────────┘   └────────┬───────────┘
              │                      │
              ▼                      ▼
    ┌───────────────────┐   ┌────────────────────┐
    │ Create Family     │   │ Check Role         │
    │ - Choose plan     │   │ in family_members  │
    │ - Pay (if needed) │   └────────┬───────────┘
    └─────────┬─────────┘            │
              │              ┌────────┴────────┐
              ▼              │                 │
    ┌───────────────────┐   ▼                 ▼
    │ create_family_    │ ┌──────────┐  ┌──────────┐
    │ with_admin()      │ │  Admin   │  │  Member  │
    │ - Creates family  │ │ Dashboard│  │ Dashboard│
    │ - Sets as primary │ └──────────┘  └──────────┘
    │   admin           │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ Admin Dashboard   │
    └───────────────────┘
```

---

## 👤 User Role Determination Flow

```
User Logs In
    │
    ▼
Query: SELECT * FROM family_members WHERE user_id = auth.uid()
    │
    ├─ No Record Found ──────────────────────────────────┐
    │                                                     │
    ├─ Record Found ──────────────────────────────────┐  │
    │                                                  │  │
    ▼                                                  ▼  ▼
Check: is_primary_admin = true?                   New User
    │                                             Redirect to
    ├─ YES ──────────────────────────────┐       Create Family
    │                                     │
    ├─ NO ───────────────────────────┐   │
    │                                 │   │
    ▼                                 ▼   ▼
Check: is_admin = true?          PRIMARY ADMIN
    │                            - Full control
    ├─ YES ──────────────┐       - Can't be removed
    │                     │       - Manages subscription
    ├─ NO ───────────┐   │
    │                 │   │
    ▼                 ▼   ▼
REGULAR MEMBER    ADMIN (admin2, admin3)
- Read only       - Can add/edit members
- Can chat        - Can ban/kick
- View tree       - Can delete messages
                  - Can create events
```

---

## 🔒 RLS Policy Evaluation Flow

### Example: User Tries to View Family Members

```
1. User makes request: SELECT * FROM family_members WHERE family_id = 'xyz'
                                    │
                                    ▼
2. Supabase checks: Is user authenticated?
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
                  YES                              NO
                    │                               │
                    ▼                               ▼
3. Apply RLS Policy:                        Return: 401 Unauthorized
   "members_select_policy"
                    │
                    ▼
4. Check: EXISTS (
     SELECT 1 FROM family_members fm
     WHERE fm.family_id = 'xyz'
       AND fm.user_id = auth.uid()
   )
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
      TRUE                    FALSE
        │                       │
        ▼                       ▼
5. Return rows            Return: 0 rows
   (User can see)         (User blocked by RLS)
```

---

## 📝 Admin Action Flow

### Example: Admin Adds a New Family Member

```
1. Admin fills form and submits
            │
            ▼
2. Frontend: POST /api/family/members
            │
            ▼
3. Backend: Verify JWT token
            │
            ▼
4. Backend: INSERT INTO family_members (...)
            │
            ▼
5. Supabase RLS: Check "members_insert_policy"
            │
            ▼
6. Policy checks: Is requester an admin?
            │
            ▼
   EXISTS (
     SELECT 1 FROM family_members
     WHERE user_id = auth.uid()
       AND family_id = [target_family]
       AND is_admin = true
   )
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
  TRUE            FALSE
    │               │
    ▼               ▼
7. Insert       Return Error:
   succeeds     "RLS policy violation"
    │
    ▼
8. Send email notification to new member
    │
    ▼
9. Return success to frontend
```

---

## 💬 Message Sending Flow with Ban Check

```
1. User types message and clicks send
            │
            ▼
2. Frontend: POST /api/messages/send
            │
            ▼
3. Backend: INSERT INTO family_messages (...)
            │
            ▼
4. Supabase RLS: Check "messages_insert_policy"
            │
            ▼
5. Policy checks: Is user banned?
            │
            ▼
   EXISTS (
     SELECT 1 FROM family_members
     WHERE id = sender_id
       AND user_id = auth.uid()
       AND id NOT IN (
         SELECT member_id FROM family_banned_members
         WHERE is_active = true
       )
   )
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
NOT BANNED       BANNED
    │               │
    ▼               ▼
6. Insert       Return Error:
   succeeds     "Cannot send messages"
    │
    ▼
7. Realtime broadcast to all family members
    │
    ▼
8. Message appears in chat
```

---

## 🚫 Ban/Kick Flow

### Banning a Member

```
Admin clicks "Ban Member"
        │
        ▼
Frontend: POST /api/admin/ban-member
        │
        ▼
Backend: Call ban_family_member() function
        │
        ▼
Function checks:
1. Is requester an admin? ──────────────┐
2. Is target the primary admin? ────────┤
                                        │
                    ┌───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    VALID                   INVALID
        │                       │
        ▼                       ▼
Insert into                 Raise Exception
family_banned_members       "Cannot ban primary admin"
        │                   or "Not an admin"
        ▼
Log action in
family_admin_actions
        │
        ▼
Send system message
to family chat
        │
        ▼
Return success
```

### Kicking a Member

```
Admin clicks "Kick Member"
        │
        ▼
Frontend: POST /api/admin/kick-member
        │
        ▼
Backend: Call kick_family_member() function
        │
        ▼
Function checks:
1. Is requester an admin?
2. Is target the primary admin?
        │
        ▼
    VALID?
        │
    ┌───┴───┐
    │       │
    ▼       ▼
  YES      NO
    │       │
    ▼       └──> Raise Exception
Log action
    │
    ▼
DELETE FROM family_members
WHERE id = target_id
    │
    ▼
Send system message
    │
    ▼
Return success
```

---

## 🔄 Realtime Message Flow

```
User A sends message
        │
        ▼
Message inserted in family_messages
        │
        ▼
Supabase Realtime detects INSERT
        │
        ▼
Broadcast to all subscribed clients
        │
        ├──────────┬──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
    User A     User B     User C     User D
    (sender)   (online)   (online)   (offline)
        │          │          │          │
        ▼          ▼          ▼          └──> Will see on next login
    Updates    Receives   Receives
    UI         message    message
               instantly  instantly
```

---

## 🎯 Permission Matrix

| Action | Regular Member | Admin | Primary Admin |
|--------|---------------|-------|---------------|
| View family data | ✅ | ✅ | ✅ |
| Send messages | ✅ (if not banned) | ✅ | ✅ |
| Add members | ❌ | ✅ | ✅ |
| Edit members | ❌ | ✅ | ✅ |
| Remove members | ❌ | ✅ (except primary) | ✅ (except self) |
| Ban members | ❌ | ✅ (except primary) | ✅ (except self) |
| Delete messages | ❌ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ |
| Promote to admin | ❌ | ❌ | ✅ |
| Update family settings | ❌ | ❌ | ✅ |
| Manage subscription | ❌ | ❌ | ✅ |

---

## 🔍 Debugging Authentication Issues

### Issue: User can't see family data

```
Debug Flow:
1. Check: Is user authenticated?
   → SELECT auth.uid();
   → Should return UUID, not NULL

2. Check: Is user in family_members?
   → SELECT * FROM family_members WHERE user_id = auth.uid();
   → Should return at least one row

3. Check: Is RLS enabled?
   → SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   → All should show rowsecurity = true

4. Check: Are policies active?
   → SELECT * FROM pg_policies WHERE schemaname = 'public';
   → Should see policies for each table
```

### Issue: Admin can't add members

```
Debug Flow:
1. Check: Is user marked as admin?
   → SELECT is_admin FROM family_members WHERE user_id = auth.uid();
   → Should return true

2. Check: Is user in correct family?
   → SELECT family_id FROM family_members WHERE user_id = auth.uid();
   → Should match target family_id

3. Check: Is policy correct?
   → Review "members_insert_policy"
   → Verify EXISTS clause is working

4. Check: Browser console
   → Look for RLS policy violation errors
   → Check network tab for API errors
```

---

## ✅ Security Checklist

- [x] RLS enabled on all tables
- [x] Policies prevent cross-family data access
- [x] Admin permissions properly enforced
- [x] Primary admin cannot be removed
- [x] Banned users cannot send messages
- [x] All admin actions are logged
- [x] JWT tokens are validated
- [x] Service role key is kept secret
- [x] OAuth credentials are secure
- [x] Storage policies are restrictive

---

**This flow ensures your ApnaParivar app is secure, scalable, and follows best practices!** 🔒
