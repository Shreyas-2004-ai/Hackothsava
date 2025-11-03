# ApnaParivar Authentication Setup Guide

Complete guide to set up authentication with Admin and Family Member roles.

---

## 📋 Table of Contents

1. [Supabase Database Setup](#1-supabase-database-setup)
2. [Google OAuth Configuration](#2-google-oauth-configuration)
3. [Environment Variables](#3-environment-variables)
4. [Testing the System](#4-testing-the-system)
5. [User Flows](#5-user-flows)

---

## 1. Supabase Database Setup

### Step 1: Run the SQL Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-apnaparivar-auth-setup.sql`
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create:
- ✅ 7 database tables (families, family_members, events, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Helper functions
- ✅ Triggers for auto-updates

### Step 2: Verify Tables Created

Check that these tables exist in your database:
- `families`
- `family_members`
- `family_custom_fields`
- `family_member_custom_values`
- `family_events`
- `family_relationships`
- `family_invitations`

---

## 2. Google OAuth Configuration

### Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - App name: **ApnaParivar**
   - User support email: Your email
   - Developer contact: Your email
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: **ApnaParivar Web Client**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase Authentication

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** provider
3. Enable it
4. Paste your **Client ID** and **Client Secret**
5. Click **Save**

### Step 3: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the invitation email template
3. Add your branding and messaging

---

## 3. Environment Variables

Your `.env.local` file should have:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini AI API Key
GOOGLE_AI_API_KEY=AIzaSyADZ0n_KKImOXMx_XqRztC4mK7c-bO_E4I
```

---

## 4. Testing the System

### Test Admin Flow

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Go to login page:**
   ```
   http://localhost:3000/login
   ```

3. **Click "Sign up with Google" under "Create a Family"**

4. **Complete the flow:**
   - Sign in with Google
   - Fill in family details
   - Choose subscription plan
   - Create family

5. **You should be redirected to Admin Dashboard**

### Test Member Flow

1. **As Admin, add a family member** (feature to be implemented)

2. **Member receives email invitation**

3. **Member clicks invitation link**

4. **Member signs in with Google**

5. **Member is redirected to Member Dashboard**

---

## 5. User Flows

### 🔵 Admin Signup Flow

```
1. Visit /login
2. Click "Create a Family" (Admin)
3. Sign in with Google OAuth
4. Redirected to /admin/create-family
5. Fill in:
   - Family Name
   - Your Name
   - Subscription Plan (Free Trial or Paid)
6. Submit form
7. Family created in database
8. User marked as Primary Admin
9. Redirected to /admin/dashboard
```

### 🟢 Family Member Login Flow

```
1. Admin invites member via email
2. Member receives invitation email
3. Member visits /login
4. Click "Join Your Family" (Member)
5. Sign in with Google OAuth
6. System checks for invitation
7. If invitation exists:
   - Member added to family
   - Redirected to /member/dashboard
8. If no invitation:
   - Redirected to /member/no-invitation
```

### 🟣 Admin Capabilities

**Admin Dashboard Features:**
- ✅ View all family members
- ✅ Add new family members
- ✅ Promote members to admin
- ✅ Remove admin privileges
- ✅ View family tree
- ✅ Manage custom fields
- ✅ Post family events
- ✅ Manage subscription

### 🟡 Member Capabilities

**Member Dashboard Features:**
- ✅ View family tree (read-only)
- ✅ See all family members
- ✅ View family events
- ✅ Chat with AI assistant
- ✅ View family photos
- ✅ Access educational content

---

## 📁 Files Created

### Database Schema
- `supabase-apnaparivar-auth-setup.sql` - Complete database schema

### Authentication Pages
- `app/login/page.tsx` - Main login page with Admin/Member options
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/admin/create-family/page.tsx` - Family creation form
- `app/admin/dashboard/page.tsx` - Admin dashboard

### Components Updated
- `components/navigation.tsx` - Updated news ticker with family events

---

## 🔐 Security Features

1. **Row Level Security (RLS)**
   - Users can only see their own family data
   - Admins have additional permissions
   - Primary admin has full control

2. **Google OAuth Only**
   - No password management needed
   - Secure authentication via Google
   - Email verification handled by Google

3. **Role-Based Access Control**
   - Primary Admin (creator)
   - Additional Admins (promoted by primary)
   - Family Members (read-only)

4. **Invitation System**
   - Token-based invitations
   - Expiration dates
   - One-time use tokens

---

## 🚀 Next Steps

### Features to Implement

1. **Add Family Member Page** (`/admin/add-member`)
   - Form to add member details
   - Send email invitation
   - Generate invitation token

2. **Manage Admins Page** (`/admin/manage-admins`)
   - List all members
   - Promote to admin button
   - Remove admin button

3. **Member Dashboard** (`/member/dashboard`)
   - View-only family tree
   - Family member list
   - AI chatbot integration

4. **Family Tree Visualization** (`/family-tree`)
   - Interactive tree diagram
   - Click to see member details
   - Relationship lines

5. **Payment Integration** (`/admin/payment`)
   - Razorpay integration
   - Subscription management
   - Invoice generation

6. **Email Notifications**
   - Welcome emails
   - Invitation emails
   - Event notifications
   - Subscription reminders

---

## 📞 Support

If you encounter any issues:

1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are set
4. Ensure Google OAuth is configured correctly
5. Check RLS policies are enabled

---

## ✅ Checklist

Before going live:

- [ ] SQL schema executed successfully
- [ ] Google OAuth configured
- [ ] Environment variables set
- [ ] Test admin signup flow
- [ ] Test member login flow
- [ ] RLS policies working
- [ ] Email templates customized
- [ ] Storage buckets created (for photos)
- [ ] Payment gateway integrated (if using paid plan)
- [ ] Domain configured in Google OAuth
- [ ] SSL certificate installed

---

**ApnaParivar** - Connecting Families, Preserving Heritage 👨‍👩‍👧‍👦
