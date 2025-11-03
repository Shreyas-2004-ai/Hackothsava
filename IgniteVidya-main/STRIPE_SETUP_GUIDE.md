# Stripe Integration Setup Guide

## Prerequisites

Before implementing the subscription system, you need to:

### 1. Create a Stripe Account

- Go to https://stripe.com and sign up
- Complete your business profile
- Get your API keys from the Dashboard

### 2. Install Stripe Package

```bash
npm install stripe @stripe/stripe-js
```

### 3. Set Up Stripe Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Products in Stripe Dashboard

#### Option A: Manual Setup (Recommended for beginners)

1. Go to Stripe Dashboard → Products
2. Create two products:
   - **Free Trial**: Price = ₹0, Billing period = Yearly
   - **Premium**: Price = ₹500, Billing period = Yearly
3. Copy the Price IDs and update the database

#### Option B: Programmatic Setup

Run the setup script after adding your Stripe keys

### 5. Set Up Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook secret to your `.env.local`

### 6. Run Database Migration

Execute the SQL file in Supabase:

```sql
-- Run: supabase-subscription-setup.sql
```

### 7. Update Stripe Price IDs

After creating products in Stripe, update the database:

```sql
UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE name = 'Free Trial';

UPDATE subscription_plans
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE name = 'Premium';
```

## Implementation Flow

1. User signs up/logs in
2. Redirect to `/subscription` page
3. User selects Free Trial or Premium
4. For Free Trial: Activate immediately
5. For Premium: Redirect to Stripe Checkout
6. After payment: Webhook updates subscription status
7. Redirect to dashboard

## Testing

Use Stripe test cards:

- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- 3D Secure: 4000 0025 0000 3155

## Important Notes

- Always use test mode keys during development
- Never commit API keys to version control
- Set up proper error handling for payment failures
- Implement subscription status checks in middleware
- Add grace period for expired subscriptions
