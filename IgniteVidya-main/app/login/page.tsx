"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Users, UserPlus, ArrowLeft, Loader2 } from "lucide-react";

type UserType = "admin" | "member" | null;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up new user
        if (formData.password !== formData.confirmPassword) {
          alert("Passwords don't match!");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert("Password must be at least 6 characters!");
          setIsLoading(false);
          return;
        }

        console.log("Attempting to sign up with:", formData.email);
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: userType,
            },
          },
        });

        if (error) {
          console.error("Signup error:", error);
          throw error;
        }

        console.log("Signup successful:", data);
        alert("Account created successfully! You can now sign in.");
        setIsSignUp(false);
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else {
        // Sign in existing user
        console.log("Attempting to sign in with:", formData.email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error("Sign in error:", error);
          if (error.message === "Email not confirmed") {
            alert("Please check your email and click the confirmation link before signing in.");
            setIsLoading(false);
            return;
          }
          if (error.message === "Invalid login credentials") {
            alert("Invalid email or password. Please check your credentials and try again.");
            setIsLoading(false);
            return;
          }
          throw error;
        }

        // Successfully signed in - redirect to home page
        console.log("Sign in successful:", data);
        console.log("Redirecting to home page...");
        
        // Use window.location for a hard redirect to ensure middleware runs
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUserType(null);
    setIsSignUp(false);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    });
  };

  // Initial selection screen
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-6 hover:bg-white/50 dark:hover:bg-zinc-900/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-black text-black dark:text-white mb-4">
              Welcome to ApnaParivar
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Connect with your family, preserve your heritage
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setUserType("admin")}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <UserPlus className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-black dark:text-white mb-3">
                  Admin Access
                </h2>
                
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Create and manage your family tree
                </p>

                <div className="w-full bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    As Admin, you can:
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
                    <li>✓ Create and manage family tree</li>
                    <li>✓ Add family members</li>
                    <li>✓ Promote other admins</li>
                    <li>✓ Post family events</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Member Option */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => setUserType("member")}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-3xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold text-black dark:text-white mb-3">
                  Family Member
                </h2>
                
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  Access your family tree and connect
                </p>

                <div className="w-full bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    As Member, you can:
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
                    <li>✓ View complete family tree</li>
                    <li>✓ See family relationships</li>
                    <li>✓ Chat with AI assistant</li>
                    <li>✓ View family events</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-black dark:to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${userType === "admin" ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-green-500 to-teal-600"} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              {userType === "admin" ? (
                <UserPlus className="h-8 w-8 text-white" />
              ) : (
                <Users className="h-8 w-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              {isSignUp ? "Create Account" : "Sign In"}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              {userType === "admin" ? "Admin Access" : "Family Member"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-12"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Password *
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Confirm Password *
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 ${userType === "admin" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"} text-white font-semibold rounded-xl`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>{isSignUp ? "Create Account" : "Sign In"}</>
              )}
            </Button>

            <div className="flex items-center justify-between text-sm pt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className={`${userType === "admin" ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"} hover:underline font-semibold`}
              >
                {isSignUp ? "Already have an account?" : "Create new account"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="text-zinc-600 dark:text-zinc-400 hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
