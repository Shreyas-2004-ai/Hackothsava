"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
  TreePine,
  Shield,
  CheckCircle2,
  X,
  Chrome,
} from "lucide-react";
import { toast } from "sonner";

type UserType = "admin" | "member" | null;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google sign in error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match!");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters!");
          setIsLoading(false);
          return;
        }

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

        toast.success("Account created successfully! Please check your email to verify your account.");
        setIsSignUp(false);
        setFormData({ ...formData, password: "", confirmPassword: "" });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error("Sign in error:", error);
          if (error.message === "Email not confirmed") {
            toast.error("Please check your email and click the confirmation link before signing in.");
            setIsLoading(false);
            return;
          }
          if (error.message === "Invalid login credentials") {
            toast.error("Invalid email or password. Please check your credentials and try again.");
            setIsLoading(false);
            return;
          }
          throw error;
        }

        toast.success("Signed in successfully!");
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to authenticate. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -40, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </motion.button>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <TreePine className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome to Apna Parivar
              </h1>
              <p className="text-xl text-white/80">
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
                className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  >
                    <UserPlus className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Admin Access
                  </h2>
                  
                  <p className="text-white/70 mb-6">
                    Create and manage your family tree
                  </p>

                  <div className="w-full bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                    <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      As Admin, you can:
                    </h3>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Create and manage family tree
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Add family members
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Promote other admins
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Manage family events
                      </li>
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
                className="group relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 cursor-pointer hover:scale-105 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Users className="h-10 w-10 text-white" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3">
                    Family Member
                  </h2>
                  
                  <p className="text-white/70 mb-6">
                    Access your family tree and connect
                  </p>

                  <div className="w-full bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                    <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      As Member, you can:
                    </h3>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        View complete family tree
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        See family relationships
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        Chat with AI assistant
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        View family events
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetForm}
                className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`w-16 h-16 ${userType === "admin" ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-green-500 to-teal-600"} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                {userType === "admin" ? (
                  <UserPlus className="h-8 w-8 text-white" />
                ) : (
                  <Users className="h-8 w-8 text-white" />
                )}
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignUp ? "Create Account" : "Sign In"}
              </h1>
              <p className="text-white/60">
                {userType === "admin" ? "Admin Access" : "Family Member"}
              </p>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-14 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Chrome className="w-5 h-5" />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 text-white/60 backdrop-blur-sm">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-white/80 mb-2 block">
                      First Name *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-white/80 mb-2 block">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                  <Lock className="h-4 w-4" />
                  Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/80 mb-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full h-14 ${userType === "admin" ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"} text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-between text-sm pt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className={`${userType === "admin" ? "text-blue-300" : "text-green-300"} hover:underline font-semibold`}
                >
                  {isSignUp ? "Already have an account?" : "Create new account"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
