'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Script from 'next/script';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: {
    max_members: string;
    photo_storage: string;
    features: string[];
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setProcessingPlan(plan.id);

    try {
      if (plan.price === 0) {
        await activateFreeTrial(plan);
      } else {
        await initiateRazorpayPayment(plan);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to process subscription. Please try again.');
      setProcessingPlan(null);
    }
  };

  const activateFreeTrial = async (plan: Plan) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user!.id,
        plan_id: plan.id,
        status: 'trial',
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
      });

    if (error) throw error;

    showSuccessToast('Free trial activated successfully!');
    setTimeout(() => router.push('/admin/dashboard'), 1500);
  };

  const initiateRazorpayPayment = async (plan: Plan) => {
    // Create order on backend
    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: plan.price,
        planId: plan.id,
      }),
    });

    const { orderId, error } = await response.json();

    if (error) {
      throw new Error(error);
    }

    // Open Razorpay checkout
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: plan.price * 100, // Amount in paise
      currency: 'INR',
      name: 'ApnaParivar',
      description: `${plan.name} Subscription`,
      order_id: orderId,
      handler: async function (response: any) {
        // Verify payment on backend
        await verifyPayment(response, plan);
      },
      prefill: {
        email: user!.email,
      },
      theme: {
        color: '#4F46E5',
      },
      modal: {
        ondismiss: function () {
          setProcessingPlan(null);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (paymentResponse: any, plan: Plan) => {
    try {
      const response = await fetch('/api/verify-razorpay-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          planId: plan.id,
        }),
      });

      const { success, error } = await response.json();

      if (success) {
        showSuccessToast('Payment successful! Subscription activated.');
        setTimeout(() => router.push('/subscription/success'), 1500);
      } else {
        throw new Error(error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">Loading plans...</div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600">
              Start managing your family connections today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                  plan.price > 0 ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {plan.price > 0 && (
                  <div className="bg-indigo-500 text-white text-center py-2 text-sm font-semibold">
                    RECOMMENDED
                  </div>
                )}
                
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">/year</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">
                        {plan.features.max_members === 'unlimited' ? 'Unlimited' : `Up to ${plan.features.max_members}`} family members
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{plan.features.photo_storage} photo storage</span>
                    </li>
                    {plan.features.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.price > 0
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPlan === plan.id
                      ? 'Processing...'
                      : plan.price === 0
                      ? 'Start Free Trial'
                      : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-gray-600">
            <p>Secure payments powered by Razorpay</p>
            <p className="mt-2">All major payment methods accepted: UPI, Cards, Net Banking</p>
          </div>
        </div>
      </div>
    </>
  );
}
