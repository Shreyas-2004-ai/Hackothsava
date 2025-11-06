import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Dynamic import to prevent build-time issues
const getRazorpay = async () => {
  const Razorpay = (await import('razorpay')).default;
  return Razorpay;
};

export async function GET() {
  return NextResponse.json({ message: 'Razorpay order creation endpoint' });
}

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay credentials are available and not placeholder values
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes('your_key_id') || keySecret.includes('your_razorpay_secret')) {
      return NextResponse.json(
        { error: 'Razorpay credentials not configured. Please set up your Razorpay API keys.' },
        { status: 503 }
      );
    }

    // Initialize Razorpay dynamically
    const Razorpay = await getRazorpay();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, planId } = await request.json();

    if (!amount || !planId) {
      return NextResponse.json(
        { error: 'Amount and plan ID are required' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        user_id: user.id,
        plan_id: planId,
        email: user.email || '',
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
