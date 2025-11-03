"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, Users, CreditCard, Gift } from "lucide-react";

export default function CreateFamilyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    familyName: "",
    firstName: "",
    lastName: "",
    subscriptionType: "free_trial", // 'free_trial' or 'paid'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call the Supabase function to create family
      const { data, error } = await supabase.rpc('create_family_with_admin', {
        p_family_name: formData.familyName,
        p_first_name: formData.firstName,
        p_last_name: formData.lastName,
        p_email: user.email!,
        p_subscription_type: formData.subscriptionType,
      });

      if (error) throw error;

      // If paid subscription, redirect to payment
      if (formData.subscriptionType === 'paid') {
        router.push(`/admin/payment?family_id=${data}`);
      } else {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error("Error creating family:", error);
      alert("Failed to create family. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Create Your Family
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Start building your family tree today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Family Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Family Name *
              </label>
              <Input
                type="text"
                placeholder="e.g., Sharma Family"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Your First Name *
              </label>
              <Input
                type="text"
                placeholder="e.g., Ramesh"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Your Last Name
              </label>
              <Input
                type="text"
                placeholder="e.g., Sharma"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-12"
              />
            </div>

            {/* Subscription Type */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
                Choose Your Plan *
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Free Trial */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, subscriptionType: 'free_trial' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.subscriptionType === 'free_trial'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Gift className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500 text-white">
                      FREE
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                    Free Trial
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    1 Year Free Access
                  </p>
                </button>

                {/* Paid Subscription */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, subscriptionType: 'paid' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.subscriptionType === 'paid'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500 text-white">
                      ₹500/year
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                    Premium
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Full Access Forever
                  </p>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4">
              <h4 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                What's Included:
              </h4>
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>✓ Unlimited family members</li>
                <li>✓ 10 custom programmable fields</li>
                <li>✓ AI family assistant</li>
                <li>✓ Photo storage & management</li>
                <li>✓ Family event tracking</li>
                <li>✓ Email notifications</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Family...
                </>
              ) : (
                <>
                  Create Family
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
