# Razorpay Integration Setup Guide

## Prerequisites

### 1. Create a Razorpay Account
- Go to https://razorpay.com and sign up
- Complete KYC verification (required for live mode)
- Get your API keys from the Dashboard

### 2. Install Razorpay Package
```bash
npm install razorpay
```

### 3. Set Up Razorpay Environment Variables

Add these to your `.env.local` file:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migration

Execute the SQL file in Supabase:
```sql
-- Run: supabase-subscription-setup.sql
```

This creates:
- `subscription_plans` table (Free Trial & Premium plans)
- `user_subscriptions` table (tracks subscriptions)
- `payment_history` table (payment records)

### 5. Update Razorpay Plan IDs (Optional)

If you want to use Razorpay's subscription plans:
1. Go to Razorpay Dashboard → Subscriptions → Plans
2. Create plans for Free Trial and Premium
3. Update the database with plan IDs

For simple one-time payments (recommended for yearly subscriptions), you don't need this.

## Implementation Flow

1. User signs up/logs in
2. Redirect to `/subscription` page
3. User selects Free Trial or Premium
4. **Free Trial**: Activate immediately (no payment)
5. **Premium**: 
   - Create Razorpay order
   - Open Razorpay checkout modal
   - User completes payment
   - Verify payment on backend
   - Activate subscription
6. Redirect to dashboard

## Testing

Use Razorpay test cards:
- Success: 4111 1111 1111 1111
- Failure: 4111 1111 1111 1234
- Any CVV and future expiry date

## Important Notes

- Use test mode keys during development (rzp_test_)
- Never commit API keys to version control
- Razorpay checkout works without webhooks for simple flows
- For production, enable webhooks for payment status updates
- Free trial activates immediately without payment
- Premium requires Razorpay payment completion

## Razorpay vs Stripe

Razorpay advantages for India:
- Better UPI support
- Netbanking integration
- Lower fees for Indian cards
- INR as native currency
- Better local payment methods (Paytm, PhonePe, etc.)
