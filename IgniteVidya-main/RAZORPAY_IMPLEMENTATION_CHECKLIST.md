# Razorpay Subscription Implementation Checklist

## What You Need to Do:

### 1. Install Required Packages
```bash
npm install razorpay
```

### 2. Create Razorpay Account & Get API Keys
- [ ] Sign up at https://razorpay.com
- [ ] Complete your business profile
- [ ] Go to Settings → API Keys
- [ ] Generate Test Keys
- [ ] Copy your Key ID (starts with `rzp_test_`)
- [ ] Copy your Key Secret

### 3. Update Environment Variables
Add these to your `.env.local` file:
```env
# Razorpay Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migration
- [ ] Open Supabase SQL Editor
- [ ] Copy and paste the contents of `supabase-subscription-setup.sql`
- [ ] Click "Run" to execute

### 5. Verify Database Setup
The plans are already created in the database with the SQL migration.
No additional setup needed in Razorpay dashboard for simple payments.

### 6. Update Login Flow
The login page should now redirect to `/subscription` after successful login.
Users must select a plan before accessing the dashboard.

### 7. Test the Flow
- [ ] Sign up as a new user
- [ ] You should be redirected to `/subscription`
- [ ] Try selecting "Free Trial" - should activate immediately
- [ ] Try selecting "Premium" - should open Razorpay checkout modal
- [ ] Use test card: 4111 1111 1111 1111 (any CVV, future expiry)
- [ ] Or use UPI/NetBanking test options
- [ ] After payment, should redirect to success page
- [ ] Verify subscription in Supabase `user_subscriptions` table

## Flow Diagram:
```
User Signs Up/Logs In
        ↓
Redirect to /subscription
        ↓
User Selects Plan
        ↓
    ┌───────┴───────┐
    ↓               ↓
Free Trial      Premium
    ↓               ↓
Activate        Razorpay Modal
Immediately         ↓
    ↓           Payment
    ↓               ↓
    └───────┬───────┘
            ↓
    Success Page
            ↓
    Dashboard Access
```

## Important Notes:
- Always use TEST mode keys during development (rzp_test_)
- Never commit API keys to Git
- Free trial activates immediately without payment
- Premium opens Razorpay modal for payment
- Payment verification happens on backend for security
- Middleware checks subscription status before allowing dashboard access
- Users without active subscription are redirected to `/subscription`
- Razorpay supports UPI, Cards, NetBanking, Wallets

## Razorpay Test Payment Methods:
- **Cards**: 4111 1111 1111 1111 (Success), 4111 1111 1111 1234 (Failure)
- **UPI**: success@razorpay (Success), failure@razorpay (Failure)
- **NetBanking**: Select any bank in test mode
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Troubleshooting:
- Check browser console for Razorpay script loading errors
- Verify API keys are correct in `.env.local`
- Check Supabase logs for RLS policy errors
- Ensure payment verification signature matches
- Test with Razorpay test credentials only in development

## Why Razorpay for India?
- Native UPI support (most popular payment method in India)
- All major Indian banks integrated
- Lower transaction fees for Indian cards
- INR as native currency
- Better success rates for Indian payments
- Local payment methods: Paytm, PhonePe, Google Pay
- No need for complex webhook setup for simple flows
