'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/admin/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for subscribing to ApnaParivar. Your subscription is now active
          and you have full access to all features.
        </p>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            Redirecting to dashboard in <span className="font-bold text-blue-600">{countdown}</span> seconds...
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/admin/dashboard"
            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <Link
            href="/admin/add-member"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Add Family Members
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
