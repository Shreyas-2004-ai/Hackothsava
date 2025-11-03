# Add Family Member Feature Setup Guide

Complete setup for the "Add Family Member" functionality.

---

## 📋 What's Included

1. **Add Member Page** (`/admin/add-member`)
   - Form to add family member details
   - Photo upload functionality
   - Custom fields support
   - Email invitation system

2. **Supabase Backend**
   - Family members table
   - Custom fields storage
   - Photo storage bucket
   - Row Level Security policies

---

## 🚀 Setup Steps

### Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard**
2. **Click "Storage"** in the left sidebar
3. **Click "New bucket"**
4. **Bucket details:**
   - Name: `family-photos`
   - Public bucket: ✅ **Yes** (check this)
   - File size limit: 50MB (default)
5. **Click "Create bucket"**

### Step 2: Run Storage Policies SQL

1. **Go to SQL Editor**
2. **Copy the content from** `supabase-storage-setup.sql`
3. **Paste and Run**

This will set up:
- ✅ Public access to view photos
- ✅ Admin-only upload permissions
- ✅ Admin-only update/delete permissions

### Step 3: Test the Feature

1. **Sign in as Admin**
2. **Go to Admin Dashboard**
3. **Click "Add Family Members"**
4. **Fill in the form:**
   - Name: Required
   - Relation: Required (dropdown)
   - Email: Required
   - Photo: Optional
   - Additional fields: Optional

5. **Click "Add Family Member"**

---

## 📊 Database Structure

### family_members Table
```sql
- id: UUID (primary key)
- family_id: UUID (foreign key)
- user_id: UUID (foreign key to auth.users)
- email: VARCHAR
- first_name: VARCHAR
- last_name: VARCHAR
- relation: VARCHAR (Father, Mother, Son, etc.)
- photo_url: TEXT
- date_of_birth: DATE
- phone: VARCHAR
- address: TEXT
- is_admin: BOOLEAN
- is_primary_admin: BOOLEAN
- invited_by: UUID (foreign key to family_members)
- invitation_accepted: BOOLEAN
```

### family_custom_fields Table
```sql
- id: UUID (primary key)
- family_id: UUID (foreign key)
- field_name: VARCHAR (Birth Place, Occupation, etc.)
- field_type: VARCHAR (text, number, date, boolean)
- field_order: INTEGER
- is_required: BOOLEAN
```

### family_member_custom_values Table
```sql
- id: UUID (primary key)
- member_id: UUID (foreign key to family_members)
- field_id: UUID (foreign key to family_custom_fields)
- field_value: TEXT
```

---

## 🎯 Features

### 1. Basic Information
- ✅ Name (required)
- ✅ Relation (required dropdown)
- ✅ Email (required)
- ✅ Photo upload

### 2. Additional Information
- ✅ Birth Date
- ✅ Birth Place
- ✅ Occupation
- ✅ Education
- ✅ Phone Number
- ✅ Address
- ✅ Hobbies
- ✅ Achievements

### 3. Custom Fields
- Automatically creates custom fields if they don't exist
- Stores values in separate table
- Flexible and extensible

### 4. Photo Management
- Upload to Supabase Storage
- Automatic file naming
- Public URL generation
- Organized by family_id

---

## 🔐 Security

### Row Level Security (RLS)
- ✅ Only admins can add members
- ✅ Only family members can view other members
- ✅ Photo access controlled by policies

### Validation
- ✅ Required fields enforced
- ✅ Email format validation
- ✅ File type validation (images only)
- ✅ Authentication required

---

## 📧 Email Invitations (Future Enhancement)

The system is ready for email invitations:

1. **When member is added:**
   - Record created with `invitation_accepted: false`
   - `invited_by` field set to admin's ID

2. **Email should contain:**
   - Family name
   - Inviter's name
   - Link to sign up/sign in
   - Instructions

3. **Implementation:**
   - Use Supabase Edge Functions
   - Or integrate with SendGrid/Mailgun
   - Or use Supabase Auth email templates

---

## 🧪 Testing Checklist

- [ ] Storage bucket created
- [ ] Storage policies applied
- [ ] Can access /admin/add-member page
- [ ] Form validation works
- [ ] Can upload photo
- [ ] Photo preview shows
- [ ] Can submit form
- [ ] Member appears in dashboard
- [ ] Custom fields saved correctly
- [ ] Photo accessible via URL

---

## 🐛 Troubleshooting

### Photo Upload Fails
- Check storage bucket exists
- Check bucket is public
- Check storage policies are applied
- Check file size < 50MB

### Member Not Added
- Check admin is authenticated
- Check admin has family_id
- Check RLS policies allow insert
- Check console for errors

### Custom Fields Not Saving
- Check family_custom_fields table exists
- Check family_member_custom_values table exists
- Check foreign key constraints

---

## 🎨 Customization

### Add More Relations
Edit the `relations` array in `add-member/page.tsx`:
```typescript
const relations = [
  "Father",
  "Mother",
  // Add more...
  "Step-Father",
  "Step-Mother",
  "In-Law",
];
```

### Add More Custom Fields
Add more fields to the form and include them in the `customFields` array.

### Change Photo Storage
Modify the storage bucket name and path in the upload function.

---

## ✅ Summary

You now have a complete "Add Family Member" feature with:
- ✅ Beautiful UI form
- ✅ Photo upload to Supabase Storage
- ✅ Custom fields support
- ✅ Secure backend with RLS
- ✅ Ready for email invitations

**Next Steps:**
1. Run storage setup SQL
2. Test adding a member
3. Implement email invitations (optional)
4. Add member management features (edit/delete)

---

**ApnaParivar** - Connecting Families, Preserving Heritage 👨‍👩‍👧‍👦
