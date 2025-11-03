import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        status: 'active',
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (subError) throw subError;

    // Record payment
    await supabase.from('payment_history').insert({
      user_id: user.id,
      amount: plan.price,
      currency: 'INR',
      status: 'succeeded',
      payment_method: 'razorpay',
      stripe_payment_intent_id: razorpay_payment_id, // Reusing this field for Razorpay payment ID
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
