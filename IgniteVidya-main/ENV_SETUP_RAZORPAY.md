# Environment Variables Setup for Razorpay

Add these lines to your `.env.local` file:

```env
# Razorpay Configuration
# Get these from: https://dashboard.razorpay.com/app/keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Razorpay Keys:

1. Go to https://razorpay.com and sign up
2. Complete your business profile
3. Navigate to Settings → API Keys
4. Click "Generate Test Key" (for development)
5. Copy the Key ID (starts with `rzp_test_`)
6. Copy the Key Secret (click "Show" to reveal)
7. Paste them in your `.env.local` file

## Important:
- Use TEST keys (`rzp_test_`) during development
- Use LIVE keys (`rzp_live_`) only in production
- Never commit `.env.local` to Git
- Keep your Key Secret confidential

## Your Complete .env.local Should Look Like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ojhqcdslkypqcfpboxdq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI API Key
GOOGLE_AI_API_KEY=AIzaSyADZ0n_KKImOXMx_XqRztC4mK7c-bO_E4I

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
