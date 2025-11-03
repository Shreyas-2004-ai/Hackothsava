# ApnaParivar 👨‍👩‍👧‍👦

A comprehensive family tree management platform that helps families stay connected, organized, and preserve their heritage for generations.

## ✨ Features

- **👨‍👩‍👧‍👦 Family Tree Visualization**: Interactive family tree with customizable fields
- **👥 Multi-Admin Support**: Promote family members to admin roles
- **🔐 Google OAuth**: Secure authentication with Google accounts only
- **🤖 AI Family Assistant**: Context-aware chatbot that understands family relationships
- **📸 Photo Management**: Upload and manage family member photos
- **💳 Subscription Management**: Free trial and paid plans
- **📧 Automatic Notifications**: Email invitations for new family members
- **📱 Responsive Design**: Works perfectly on mobile and desktop

---

## 🔑 User Roles & Workflows

### 1. The Roles

- **SuperAdmin**: The owner of the "ApnaParivar" platform. They build the platform, manage payments, and create the main website.
- **Family Admin (admin1)**: The first person from a family to sign up (e.g., Ramesh). They manage their family's subscription and data.
- **Family Member**: A person added to the family by an admin (e.g., Krishnappa, Ramya). They have read-only access.
- **Additional Admins (admin2, admin3)**: Family Members who are "promoted" to admin status by admin1.

---

### 2. 🚀 Admin Signup Flow (Ramesh, admin1)

This flow is for the first admin of a new family.

1. **Landing Page**: Ramesh visits ApnaParivar.com. He sees two options: "Create a Family (Admin)" and "Sign In (Member)."
2. **Start Signup**: He clicks "Create a Family (Admin)".
3. **Authentication**: The only option presented is "Sign up with Google". There is no email/password form.
4. **Google OAuth**: He clicks the button, and a Google pop-up asks him to choose his Gmail account (e.g., ramesh@gmail.com).
5. **Plan Selection**: After successfully signing in, he is taken to the subscription page. He chooses either:
   - Free Trial (1 Year)
   - Subscription (Rs 500/year)
   and completes the payment.
6. **Dashboard**: He is now the admin1 for his newly created family and lands on the Admin Dashboard.

---

### 3. ⚙️ Admin Dashboard Flow (Ramesh, admin1)

The Admin Dashboard has three options:

#### A. Add Family Members

1. Ramesh clicks "Add Family Members."
2. He fills out a form with:
   - Name (e.g., "Krishnappa")
   - Relation (e.g., selects "Father" from a dropdown)
   - Photo (uploads an image)
   - Member's Gmail: krishnappa@gmail.com
   - The 10 custom programmable fields.
3. He clicks "Save."
4. **Automatic Notification**: The system automatically sends an email to krishnappa@gmail.com saying, "Ramesh has added you to the ApnaParivar family. You can sign in at ApnaParivar.com with your Google account."
   - **Crucially: No Family ID or Password is ever sent.**

#### B. Add Admin (Promoting a Member)

1. Ramesh clicks "Add Admin."
2. He sees a dropdown list of all existing family members he has already added (e.g., "Ramya," "Krishnappa").
3. He selects "Ramya" from the list and clicks "Make Admin."
4. Ramya is now an admin2. The "Main Admin" (Ramesh, admin1) also has the option to "Remove Admin" from this same screen.

#### C. View Family Tree

1. Ramesh clicks "View Family Tree."
2. He sees the complete, interactive visualization of his family and can click on members to see their details.

---

### 4. 👓 Family Member Login Flow (Krishnappa)

1. **Notification**: Krishnappa receives the email from the system.
2. **Landing Page**: He goes to ApnaParivar.com and clicks "Sign In (Member)".
3. **Authentication**: The only option is "Sign in with Google".
4. **Google OAuth**: He clicks the button and signs in with his krishnappa@gmail.com account.
5. **Validation**: The system checks its database. It sees that krishnappa@gmail.com is registered as a "Family Member" for Ramesh's family.
6. **Dashboard**: Krishnappa is successfully logged in and lands on the Family Member Dashboard.

---

### 5. 📖 Family Member Dashboard Flow (Krishnappa)

This dashboard is **read-only**. Krishnappa sees:

- **View Family Tree**: He can view the entire family visualization, just like the admin.
- **Understanding Relations**: He can access the educational section to learn about different family relationships.
- **AI Chatbot**:
  - The chatbot is already aware of who is logged in (Krishnappa).
  - When Krishnappa asks, "What is my brother's name?" the AI queries the family graph from his perspective and provides the correct answer.
  - When Ramesh logs in and asks the same question, the AI will give Ramesh's brother's name.

---

### 6. 🛠️ Additional Admin Login Flow (Ramya, admin2)

1. Ramya's login process is identical to Krishnappa's (Sign in with Google).
2. However, when the system validates her Gmail (ramya@gmail.com), it sees she has "Admin" permissions.
3. Therefore, after logging in, Ramya is directed to the Admin Dashboard, not the read-only Member Dashboard. She can now add members and edit details, just like Ramesh.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google Cloud Project with OAuth 2.0 configured
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ApnaParivar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Google Gemini AI API Key
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

This application uses **Supabase** for data persistence and authentication.

### Database Structure
- `families` - Family information and subscription details
- `family_members` - Individual family member profiles
- `family_admins` - Admin role assignments
- `custom_fields` - Programmable custom fields per family

### Setting up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Run the SQL scripts in the `supabase-setup.sql` file
3. Enable Google OAuth in Authentication settings
4. Copy your project URL and API keys to `.env.local`

## 🔧 API Endpoints

### Family Management
- `GET /api/family` - Fetch family details
- `POST /api/family/members` - Add a new family member
- `PUT /api/family/members/:id` - Update family member details
- `DELETE /api/family/members/:id` - Remove family member

### Admin Management
- `POST /api/family/admins` - Promote member to admin
- `DELETE /api/family/admins/:id` - Remove admin privileges

### AI Features
- `POST /api/family-assistant` - Context-aware family chatbot
- `POST /api/describe-family` - Analyze family photos and relationships

## 🎯 Getting API Keys

### Google AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs
6. Configure in Supabase Authentication settings

## 📁 Project Structure

```
ApnaParivar/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard
│   ├── family-tree/       # Family tree visualization
│   ├── describe-family/   # AI family photo analyzer
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── supabase-database.ts  # Database helpers
└── public/               # Static assets
```

## 🛠️ Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0 via Supabase
- **AI**: Google Gemini API (Vision & Text)
- **Icons**: Lucide React
- **Payments**: Razorpay (for subscriptions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## � SuAbscription Plans

- **Free Trial**: 1 Year free access to all features
- **Annual Subscription**: Rs 500/year
  - Unlimited family members
  - 10 custom programmable fields
  - AI family assistant
  - Photo storage
  - Email notifications

## 🔒 Security & Privacy

- **Google OAuth Only**: No passwords to remember or manage
- **Role-Based Access**: Admin and member roles with appropriate permissions
- **Data Privacy**: Family data is isolated and secure
- **No Shared Credentials**: Each member uses their own Google account

---

## 👨‍💻 Author

Building tools to help families stay connected and preserve their heritage.

---

**ApnaParivar** - Connecting Families, Preserving Heritage 👨‍👩‍👧‍👦
