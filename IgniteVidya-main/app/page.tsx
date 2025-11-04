"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  BookOpen,
  Play,
  Brain,
  Target,
  Star,
  Calculator,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Youtube,
  Facebook,
  Instagram,
  Users,
  Zap,
  Shield,
  Crown,
  Rocket,
  Atom,
  Microscope,
  Beaker,
  Gamepad2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [filteredContent, setFilteredContent] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(1247);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [familiesConnected, setFamiliesConnected] = useState(847);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [familyStats, setFamilyStats] = useState({
    mainAdminsCount: 847,
    totalFamilyMembers: 12543,
    totalAdmins: 2541,
    newFamiliesThisMonth: 23,
    averageFamilySize: 15,
  });

  // Payment Integration State
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'trial' | 'active' | 'expired' | 'grace'>('free');
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [renewalDate, setRenewalDate] = useState<Date | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [showFloatingPayment, setShowFloatingPayment] = useState(false);

  const {
    playHoverSound,
    playClickSound,
    playSearchSound,
    playTypingSound,
    playSuccessSound,
  } = useSoundEffects();

  // Payment Integration Functions
  const handleRazorpayPayment = async () => {
    setIsPaymentLoading(true);
    playClickSound();
    
    try {
      // Open Razorpay.me link for direct payment
      window.open('https://razorpay.me/@shreyassureshsanil', '_blank');
      
      // Simulate payment processing feedback
      setTimeout(() => {
        setIsPaymentLoading(false);
        playSuccessSound();
        
        // Simulate successful payment (in real app, this would be handled by webhook)
        setTimeout(() => {
          setSubscriptionStatus('active');
          localStorage.setItem('subscriptionStatus', 'active');
          const renewalDate = new Date();
          renewalDate.setFullYear(renewalDate.getFullYear() + 1);
          setRenewalDate(renewalDate);
          showPaymentFeedback('Payment successful! Premium features activated.', 'success');
        }, 3000);
        
        // Show initial payment message
        showPaymentFeedback('Payment initiated! Complete the payment to activate your subscription.', 'success');
      }, 2000);
      
    } catch (error) {
      setIsPaymentLoading(false);
      showPaymentFeedback('Payment failed. Please try again.', 'error');
    }
  };

  const showPaymentFeedback = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('translate-x-0'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  const getSubscriptionStatusColor = () => {
    switch (subscriptionStatus) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'trial': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expired': return 'text-red-600 bg-red-50 border-red-200';
      case 'grace': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSubscriptionStatusText = () => {
    switch (subscriptionStatus) {
      case 'active': return `Active until ${renewalDate?.toLocaleDateString()}`;
      case 'trial': return `${trialDaysLeft} days left in trial`;
      case 'expired': return 'Subscription expired - Renew now';
      case 'grace': return 'Grace period - Payment overdue';
      default: return 'Free plan - Upgrade for more features';
    }
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Inspirational quotes for family connections
  const quotes = [
    "Family connections for all - Apna Parivar",
    "Family is not an important thing, it's everything - Michael J. Fox",
    "The family is one of nature's masterpieces - George Santayana",
    "A family is a gift that lasts forever - Unknown",
    "Family means no one gets left behind or forgotten - Unknown",
    "The love of family and the admiration of friends is much more important than wealth - Walter Cronkite",
  ];

  useEffect(() => {
    setMounted(true);
    fetchFamilyStats();
    checkSubscriptionStatus();
  }, []);

  // Check subscription status (simulate for demo)
  const checkSubscriptionStatus = () => {
    // In a real app, this would fetch from your backend
    // For demo purposes, we'll simulate different states
    const savedStatus = localStorage.getItem('subscriptionStatus');
    if (savedStatus) {
      setSubscriptionStatus(savedStatus as any);
    }
    
    // Set renewal date for active subscriptions
    if (subscriptionStatus === 'active') {
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      setRenewalDate(renewalDate);
    }
  };

  // Fetch real-time family statistics
  const fetchFamilyStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch("/api/admin-stats");
      const result = await response.json();

      if (result.success) {
        setFamiliesConnected(result.data.mainAdminsCount);
        setFamilyStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch family stats:", error);
      // Keep default value on error
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredGrades = grades.filter((grade) =>
        grade.grade.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const filteredShortcuts = shortcuts.filter(
        (shortcut) =>
          shortcut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shortcut.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredContent([...filteredGrades, ...filteredShortcuts]);
    } else {
      setFilteredContent([]);
    }
  }, [searchQuery]);

  // Remove image slider effect - keeping for potential future use
  // const heroImages = [
  //   "/placeholder.svg?height=400&width=800&text=STEM-Students-Learning",
  //   "/placeholder.svg?height=400&width=800&text=Science-Experiments",
  //   "/placeholder.svg?height=400&width=800&text=Math-Problem-Solving",
  //   "/placeholder.svg?height=400&width=800&text=Technology-Innovation",
  //   "/placeholder.svg?height=400&width=800&text=Engineering-Projects",
  // ]

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  //   }, 2000)
  //   return () => clearInterval(interval)
  // }, [])

  // Quote rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulate online users count
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Refresh family stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFamilyStats();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Show floating payment button on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 800 && subscriptionStatus !== 'active';
      setShowFloatingPayment(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [subscriptionStatus]);

  useEffect(() => {
    // Auto-focus search bar when component mounts
    if (mounted && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mounted]);

  const educationLevels = [
    {
      level: "Add Family Members",
      grades: ["Parents", "Children"],
      gradeCount: 2,
      theme: "Family Builder",
      description: "Add and connect family members",
      icon: Rocket,
      color: "blue",
      href: "/admin/add-member",
      hasGames: true,
    },
    {
      level: "View Family Tree",
      grades: ["Ancestors", "Descendants", "Relatives"],
      gradeCount: 3,
      theme: "Heritage Explorer",
      description: "Explore family connections",
      icon: Microscope,
      color: "green",
      href: "/advanced-family-tree",
      hasGames: false,
    },
    {
      level: "Add Admins",
      grades: ["Family Admins", "Tree Managers"],
      gradeCount: 2,
      theme: "Access Manager",
      description: "Add family tree administrators",
      icon: Crown,
      color: "purple",
      href: "/level/add-admins",
      hasGames: false,
    },
  ];

  // Keep the original grades data for search functionality
  const grades = [
    {
      grade: "6th",
      subjects: 6,
      theme: "Explorer",
      description: "Connect with your family",
      icon: Rocket,
      color: "blue",
    },
    {
      grade: "7th",
      subjects: 7,
      theme: "Discoverer",
      description: "Discover the wonders of science",
      icon: Microscope,
      color: "green",
    },
    {
      grade: "8th",
      subjects: 8,
      theme: "Innovator",
      description: "Innovate with technology",
      icon: Atom,
      color: "purple",
    },
    {
      grade: "9th",
      subjects: 9,
      theme: "Creator",
      description: "Create amazing projects",
      icon: Beaker,
      color: "orange",
    },
    {
      grade: "10th",
      subjects: 10,
      theme: "Builder",
      description: "Build your future",
      icon: Target,
      color: "indigo",
    },
    {
      grade: "11th",
      subjects: 11,
      theme: "Scientist",
      description: "Master scientific concepts",
      icon: Brain,
      color: "teal",
    },
    {
      grade: "12th",
      subjects: 12,
      theme: "Leader",
      description: "Manage your family tree",
      icon: Crown,
      color: "violet",
    },
  ];

  const shortcuts = [
    {
      title: "Library",
      icon: BookOpen,
      href: "/notes",
      description: "Study materials",
    },
    {
      title: "Lectures",
      icon: Play,
      href: "/lectures",
      description: "Video lessons",
    },
    {
      title: "AI Tutor",
      icon: Brain,
      href: "/ai-tutor",
      description: "Smart learning",
      badge: "Coming Soon",
    },
    {
      title: "Quiz",
      icon: Target,
      href: "/quiz",
      description: "Test yourself",
    },
    {
      title: "Dashboard",
      icon: Star,
      href: "/dashboard",
      description: "Track progress",
    },
  ];

  const handleGetStarted = () => {
    playSuccessSound();
    const gradeSection = document.getElementById("grade-section");
    if (gradeSection) {
      gradeSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>

        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => {
          const initialX = Math.random() * 1200;
          const initialY = Math.random() * 800;
          const duration = Math.random() * 15 + 10;
          const delay = Math.random() * 10;

          return (
            <motion.div
              key={`bg-shape-${i}`}
              className={`absolute w-2 h-2 ${
                i % 3 === 0
                  ? "bg-blue-400/60 dark:bg-blue-400/20"
                  : i % 3 === 1
                  ? "bg-green-400/60 dark:bg-green-400/20"
                  : "bg-purple-400/60 dark:bg-purple-400/20"
              } ${i % 2 === 0 ? "rounded-full" : "rotate-45"}`}
              initial={{
                x: initialX,
                y: initialY,
              }}
              animate={{
                y: [initialY, initialY - 200, initialY],
                x: [initialX, initialX + (Math.random() * 200 - 100), initialX],
                rotate: [0, 360],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          );
        })}
      </div>
      {/* Pixel Font Styles */}
      <style jsx>{`
        .pixel-font {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 1px 1px 0px rgba(59, 130, 246, 0.3),
            2px 2px 0px rgba(59, 130, 246, 0.2),
            3px 3px 0px rgba(59, 130, 246, 0.1);
        }
        .pixel-text {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 1px 1px 0px rgba(59, 130, 246, 0.2);
        }
        .pixel-badge {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          text-shadow: 0.5px 0.5px 0px rgba(0, 255, 255, 0.3);
        }
      `}</style>
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-24 pb-8 md:pb-16 px-2 md:px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 dark:from-gray-900/50 dark:via-black dark:to-purple-900/50" />

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const initialX = Math.random() * 1200;
            const initialY = Math.random() * 800;
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            const moveX = Math.random() * 100 - 50;

            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-blue-400/70 dark:bg-blue-400/30 rounded-full"
                initial={{
                  x: initialX,
                  y: initialY,
                }}
                animate={{
                  y: [initialY, initialY - 100, initialY],
                  x: [initialX, initialX + moveX, initialX],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              />
            );
          })}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/25 to-purple-400/25 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
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
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-400/25 to-blue-400/25 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
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
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-r from-purple-400/35 to-pink-400/35 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
              delay: 4,
            }}
          />
        </div>

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.4),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.4),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.4),_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.3),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.3),_transparent_50%)] animate-pulse" />
        </div>

        {/* SuperBrain Image - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -100, rotate: -10 }}
          animate={{
            opacity: 1,
            x: 0,
            rotate: [0, 2, -2, 0],
            y: [0, -15, 0, -15, 0],
          }}
          transition={{
            duration: 2,
            rotate: {
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            },
            y: {
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut",
            },
          }}
          className="absolute left-2 md:left-4 lg:left-8 xl:left-12 top-1/4 transform -translate-y-1/4 z-20 hidden lg:block"
        >
          <div className="relative group">
            {/* Enhanced glow effect with circular shape */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-500/30 to-cyan-400/20 rounded-full blur-3xl transition-all duration-500 group-hover:blur-[40px] group-hover:scale-110" />

            {/* Brain image - Left positioned with rounded borders */}
            <img
              src="/superBrain.png"
              alt="Super Brain"
              className="relative z-10 w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-cover object-center drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 rounded-3xl"
              style={{
                objectPosition: "center center",
              }}
            />

            {/* Enhanced sparkle effects around the image */}
            <div className="absolute -inset-4 opacity-70">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30 * (Math.PI / 180);
                const radius = 120 + (i % 3) * 20; // Varying distances
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`sparkle-${i}`}
                    className={`absolute ${
                      i % 4 === 0
                        ? "w-3 h-3 bg-gradient-to-r from-yellow-300 to-yellow-500"
                        : i % 4 === 1
                        ? "w-2 h-2 bg-gradient-to-r from-blue-300 to-blue-500"
                        : i % 4 === 2
                        ? "w-2.5 h-2.5 bg-gradient-to-r from-purple-300 to-purple-500"
                        : "w-1.5 h-1.5 bg-gradient-to-r from-cyan-300 to-cyan-500"
                    } rounded-full shadow-lg`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.3, 1.2, 0.3],
                      rotate: [0, 180, 360],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2 + (i % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                );
              })}

              {/* Additional floating sparkles */}
              {[...Array(8)].map((_, i) => {
                const initialX = (Math.random() - 0.5) * 300;
                const initialY = (Math.random() - 0.5) * 300;

                return (
                  <motion.div
                    key={`float-sparkle-${i}`}
                    className="absolute w-1 h-1 bg-gradient-to-r from-white to-yellow-200 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: [initialX, initialX + 50, initialX - 50, initialX],
                      y: [initialY, initialY - 30, initialY + 30, initialY],
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Brain Rocket Image - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotate: 10 }}
          animate={{
            opacity: 1,
            x: 0,
            rotate: [0, 2, -2, 0],
            y: [0, -15, 0, -15, 0],
          }}
          transition={{
            duration: 2,
            rotate: {
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut",
            },
            y: {
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut",
            },
          }}
          className="absolute right-2 md:right-4 lg:right-8 xl:right-12 top-1/3 transform -translate-y-1/3 z-20 hidden lg:block"
        >
          <div className="relative group">
            {/* Enhanced glow effect with circular shape */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-red-500/30 to-yellow-400/20 rounded-full blur-3xl transition-all duration-500 group-hover:blur-[40px] group-hover:scale-110" />

            {/* Brain Rocket image - Right positioned with rounded borders */}
            <img
              src="/brain-rocket.png"
              alt="Brain Rocket"
              className="relative z-10 w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 object-cover object-center drop-shadow-2xl group-hover:scale-105 transition-transform duration-300 rounded-3xl"
              style={{
                objectPosition: "center center",
              }}
            />

            {/* Enhanced sparkle effects around the image */}
            <div className="absolute -inset-4 opacity-70">
              {[...Array(12)].map((_, i) => {
                const angle = i * 30 * (Math.PI / 180);
                const radius = 120 + (i % 3) * 20; // Varying distances
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`sparkle-${i}`}
                    className={`absolute ${
                      i % 4 === 0
                        ? "w-3 h-3 bg-gradient-to-r from-orange-300 to-red-500"
                        : i % 4 === 1
                        ? "w-2 h-2 bg-gradient-to-r from-yellow-300 to-orange-500"
                        : i % 4 === 2
                        ? "w-2.5 h-2.5 bg-gradient-to-r from-red-300 to-pink-500"
                        : "w-1.5 h-1.5 bg-gradient-to-r from-amber-300 to-yellow-500"
                    } rounded-full shadow-lg`}
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                    animate={{
                      opacity: [0.2, 1, 0.2],
                      scale: [0.3, 1.2, 0.3],
                      rotate: [0, 180, 360],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 2 + (i % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                );
              })}

              {/* Additional floating sparkles */}
              {[...Array(8)].map((_, i) => {
                const initialX = (Math.random() - 0.5) * 300;
                const initialY = (Math.random() - 0.5) * 300;

                return (
                  <motion.div
                    key={`float-sparkle-${i}`}
                    className="absolute w-1 h-1 bg-gradient-to-r from-orange-200 to-red-300 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: [initialX, initialX + 50, initialX - 50, initialX],
                      y: [initialY, initialY - 30, initialY + 30, initialY],
                      opacity: [0, 1, 1, 0],
                      scale: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="relative z-30 w-full flex justify-center">
          <div className="max-w-6xl text-center">
            {/* Families Connected Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-2"
            >
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              <Users className="h-2 w-2 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {isLoadingStats ? (
                  <span className="inline-flex items-center gap-1">
                    <div className="w-2 h-2 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `${familiesConnected.toLocaleString()} families connected`
                )}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 md:mb-6"
            >
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 mb-2">
                <Sparkles className="h-2 w-2 text-zinc-600 dark:text-zinc-400" />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  Your Family Heritage Companion
                </span>
              </div>

              <motion.h1
                className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-wider mb-3 md:mb-4 font-mono pixel-font"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 15px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3)",
                    "0 0 12px rgba(6, 182, 212, 0.5), 0 0 25px rgba(6, 182, 212, 0.3)",
                    "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  className="text-black dark:text-white"
                  animate={{
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.3) saturate(1.2)",
                      "brightness(1.1) saturate(1.1)",
                      "brightness(1) saturate(1)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  APNA
                </motion.span>
                <motion.span
                  className="text-zinc-400 dark:text-zinc-600"
                  animate={{
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.4) saturate(1.3)",
                      "brightness(1.2) saturate(1.2)",
                      "brightness(1) saturate(1)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  PARIVAR
                </motion.span>
              </motion.h1>

              <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2">
                Family connections for all. Interactive family tree management
                with secure authentication, multi-generational mapping, and
                personalized relationship tracking.
              </p>

              {/* Rotating Quotes */}
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-4 md:mt-6"
              >
                <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-500 italic max-w-4xl mx-auto px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                  "{quotes[currentQuote]}"
                </p>
              </motion.div>

              {/* Family Stats */}
              {!isLoadingStats && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6 flex justify-center gap-6 md:gap-8 text-xs md:text-sm"
                >
                  <div className="text-center">
                    <div className="font-bold text-black dark:text-white">
                      {familyStats.totalFamilyMembers.toLocaleString()}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-500">
                      Members
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-black dark:text-white">
                      {familyStats.averageFamilySize}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-500">
                      Avg Family Size
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      +{familyStats.newFamiliesThisMonth}
                    </div>
                    <div className="text-zinc-500 dark:text-zinc-500">
                      This Month
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-2xl mx-auto mb-6 md:mb-12"
            >
              <div className="relative">
                <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-3 w-3 md:h-4 md:w-4" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search family members, relationships, ancestors..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 0) {
                      playTypingSound();
                    }
                  }}
                  onFocus={() => playSearchSound()}
                  className="pl-8 md:pl-10 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
              {searchQuery && filteredContent.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 md:mt-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg md:rounded-xl shadow-2xl z-10 max-h-48 md:max-h-64 overflow-y-auto"
                >
                  {filteredContent.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 md:p-3 hover:bg-zinc-50 dark:hover:bg-zinc-950 cursor-pointer border-b border-zinc-100 dark:border-zinc-900 last:border-b-0"
                      onClick={() => {
                        playClickSound("secondary");
                        if ("grade" in item) {
                          window.location.href = `/grade/${item.grade.replace(
                            /[^0-9]/g,
                            ""
                          )}`;
                        } else {
                          window.location.href = item.href;
                        }
                        setSearchQuery("");
                      }}
                      onMouseEnter={() => playHoverSound("card")}
                    >
                      <div className="font-medium text-black dark:text-white text-xs md:text-sm">
                        {"grade" in item ? `Grade ${item.grade}` : item.title}
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        {"subjects" in item
                          ? `${item.subjects} subjects`
                          : item.description}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grade Cards */}
      <section id="grade-section" className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-4 md:mb-8"
          >
            <h2 className="text-xl md:text-3xl font-extrabold text-black dark:text-white mb-1 md:mb-2 font-serif tracking-wide">
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent">
                Choose Your Family Action
              </span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Select your family management action to organize your family tree
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {educationLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className=""
              >
                <Link href={level.href}>
                  <Card
                    className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer h-40 md:h-48 bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black shadow-lg hover:shadow-xl"
                    onClick={() => playClickSound("card")}
                    onMouseEnter={() => playHoverSound("card")}
                  >
                    {/* Shiny Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 opacity-5 dark:opacity-10">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
                    </div>

                    <div className="relative p-4 md:p-6 text-center h-full flex flex-col justify-center">
                      {/* Games Available Badge */}
                      {level.hasGames && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-sm animate-pulse">
                          <Gamepad2 className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-bold text-green-500">
                            Games
                          </span>
                        </div>
                      )}

                      {/* Hero Badge with Icon - Enhanced Shiny Effect */}
                      <div
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br ${
                          level.color === "blue"
                            ? "from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600"
                            : level.color === "green"
                            ? "from-green-500 to-green-700 dark:from-green-400 dark:to-green-600"
                            : "from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600"
                        } flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-xl`}
                      >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <level.icon className="text-white dark:text-black h-6 w-6 md:h-8 md:w-8 relative z-10" />
                      </div>

                      <h3 className="font-bold text-black dark:text-white mb-2 text-sm md:text-lg group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                        {level.level}
                      </h3>

                      <div className="flex justify-center gap-1 mb-2">
                        {level.grades.map((grade, gradeIndex) => (
                          <span
                            key={gradeIndex}
                            className={`text-xs px-2 py-1 rounded-full ${
                              level.color === "blue"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : level.color === "green"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                            }`}
                          >
                            {grade}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors mb-1">
                        {level.description}
                      </p>

                      <p className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                        {level.theme}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-6 md:py-12 px-2 md:px-4 bg-zinc-50 dark:bg-zinc-950 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-4 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">
              Quick Access
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
              Jump straight to what you need
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {shortcuts.map((shortcut, index) => (
              <motion.div
                key={shortcut.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`${
                  // Wave pattern: middle highest (index 2), nearby lower (index 1,3), outer lowest (index 0,4)
                  index === 2
                    ? "md:mt-0" // Middle card - highest
                    : index === 1 || index === 3
                    ? "md:mt-4" // Cards next to middle - slightly lower
                    : "md:mt-8" // Outer cards - lowest
                }`}
              >
                {shortcut.badge ? (
                  <Card
                    className="group relative border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-not-allowed h-full opacity-75"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("AI Tutor is coming soon! Stay tuned for updates.");
                    }}
                    onMouseEnter={() => playHoverSound("card")}
                  >
                    <div className="absolute top-0.5 right-0.5 px-1 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center group-hover:bg-blue-500/30 group-hover:border-blue-500/60 transition-all duration-300 group-hover:scale-110">
                      <span className="text-[7px] md:text-[9px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {shortcut.badge}
                      </span>
                    </div>
                    <div className="p-2 md:p-4 text-center">
                      <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 md:mb-2 group-hover:bg-blue-500 dark:group-hover:bg-blue-500 transition-colors">
                        <shortcut.icon className="h-3 w-3 md:h-5 md:w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-black dark:text-white mb-0.5 text-xs md:text-sm">
                        {shortcut.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {shortcut.description}
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Link href={shortcut.href}>
                    <Card
                      className="group relative border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer h-full"
                      onClick={() => playClickSound("card")}
                      onMouseEnter={() => playHoverSound("card")}
                    >
                      <div className="p-2 md:p-4 text-center">
                        <div className="w-6 h-6 md:w-10 md:h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-1 md:mb-2 group-hover:bg-black dark:group-hover:bg-white transition-colors">
                          <shortcut.icon className="h-3 w-3 md:h-5 md:w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-white dark:group-hover:text-black transition-colors" />
                        </div>
                        <h3 className="font-semibold text-black dark:text-white mb-0.5 text-xs md:text-sm">
                          {shortcut.title}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {shortcut.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center mb-6 md:mb-8"
          >
            <h2 className="text-lg md:text-2xl font-bold text-black dark:text-white mb-1 md:mb-2">
              Family Events & Updates
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Stay connected with your family's latest milestones and
              celebrations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Family Event 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 h-full"
                onClick={() => playClickSound("card")}
                onMouseEnter={() => playHoverSound("card")}
              >
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:bg-blue-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Rajesh & Priya's Wedding Anniversary
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Celebrating 25 years of love and togetherness! The
                        family gathered to commemorate this special milestone
                        with joy and blessings.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>2 days ago</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          Anniversary
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Family Event 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 h-full"
                onClick={() => playClickSound("card")}
                onMouseEnter={() => playHoverSound("card")}
              >
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 group-hover:bg-green-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        Little Arjun's First Birthday
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Our youngest family member turned one! A joyful
                        celebration filled with laughter, cake, and precious
                        memories for the whole family.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>5 days ago</span>
                        <span className="text-green-600 dark:text-green-400">
                          Birthday
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Family Event 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 h-full"
                onClick={() => playClickSound("card")}
                onMouseEnter={() => playHoverSound("card")}
              >
                <div className="p-4 md:p-6 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 group-hover:bg-purple-400 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white text-sm md:text-base mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Grandma's 80th Birthday Celebration
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                        Three generations came together to celebrate our beloved
                        matriarch's milestone birthday with traditional
                        festivities and heartfelt blessings.
                      </p>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500">
                        <span>1 week ago</span>
                        <span className="text-purple-600 dark:text-purple-400">
                          Milestone
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-lg md:text-3xl font-bold text-black dark:text-white mb-2 md:mb-4 font-mono tracking-wide pixel-font">
              READY TO CONNECT YOUR FAMILY?
            </h2>
            <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400 mb-4 md:mb-6 max-w-2xl mx-auto px-2 font-mono tracking-wide pixel-text">
              JOIN THOUSANDS OF FAMILIES WHO ARE ALREADY USING APNA PARIVAR TO
              PRESERVE THEIR HERITAGE AND STRENGTHEN FAMILY BONDS.
            </p>
            <Button
              onClick={handleGetStarted}
              onMouseEnter={() => playHoverSound("button")}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-mono font-bold tracking-widest pixel-text"
            >
              GET STARTED
              <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Payment Integration Card */}
      <section className="py-8 md:py-12 px-2 md:px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-black dark:to-purple-950/20">
        <div className="max-w-6xl mx-auto">
          {/* Subscription Status Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex justify-center"
          >
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getSubscriptionStatusColor()}`}>
              <div className={`w-2 h-2 rounded-full ${
                subscriptionStatus === 'active' ? 'bg-green-500 animate-pulse' :
                subscriptionStatus === 'trial' ? 'bg-blue-500 animate-pulse' :
                subscriptionStatus === 'expired' ? 'bg-red-500' :
                subscriptionStatus === 'grace' ? 'bg-orange-500 animate-pulse' :
                'bg-gray-500'
              }`} />
              <span className="text-sm font-medium">
                {getSubscriptionStatusText()}
              </span>
            </div>
          </motion.div>

          {/* Payment Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Free Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Free Plan</h3>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400">
                    Current
                  </div>
                </div>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹0</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/forever</span>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Up to 10 family members
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Basic family tree
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    50MB photo storage
                  </li>
                </ul>

                <button
                  onClick={() => setShowPaymentCard(false)}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Current Plan
                </button>
              </div>
            </motion.div>

            {/* Premium Plan Card - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:scale-105 relative"
            >
              {/* Popular Badge */}
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold transform rotate-12">
                POPULAR
              </div>
              
              <div className="p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Premium Plan</h3>
                  <Crown className="w-6 h-6 text-yellow-300" />
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">₹999</span>
                  <span className="text-indigo-200 ml-2">/year</span>
                  <div className="text-sm text-indigo-200 mt-1">Save 60% vs monthly</div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Unlimited family members
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Advanced family tree with filters
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    10GB photo & document storage
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Family chat & messaging
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-4 h-4 bg-white/20 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Priority support
                  </li>
                </ul>

                <button
                  onClick={handleRazorpayPayment}
                  disabled={isPaymentLoading}
                  className="w-full py-3 px-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPaymentLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Upgrade Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Enterprise Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Enterprise</h3>
                  <Shield className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹2999</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">/year</span>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">For large families</div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Everything in Premium
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Multiple family trees
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    100GB storage
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Custom branding
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3 flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    24/7 dedicated support
                  </li>
                </ul>

                <button
                  onClick={() => window.open('mailto:support@apnaparivar.com?subject=Enterprise Plan Inquiry', '_blank')}
                  className="w-full py-3 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>

          {/* Payment Methods & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Secure payments powered by Razorpay</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-xs font-medium text-blue-700 dark:text-blue-300">
                  UPI
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded text-xs font-medium text-green-700 dark:text-green-300">
                  Cards
                </div>
                <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs font-medium text-purple-700 dark:text-purple-300">
                  Net Banking
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
              All payments are processed securely. Your subscription will be activated immediately after successful payment. 
              Cancel anytime with full refund within 7 days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-6 md:py-12 px-2 md:px-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="space-y-3 md:space-y-4"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                <img
                  src="/superBrain.png"
                  alt="Apna Parivar SuperBrain"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-sm md:text-lg font-bold text-black dark:text-white">
                  Apna Parivar
                </h3>
                <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400">
                  Family Tree Management Platform
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Family connections for all
                </p>
              </div>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto px-2">
              Apna Parivar was created to help families stay connected, preserve
              their heritage, and strengthen bonds across generations through
              digital family tree management.
            </p>

            <div className="flex justify-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => {
                  playClickSound("secondary");
                  window.open(
                    "https://www.youtube.com/@Apna Parivar",
                    "_blank"
                  );
                }}
                onMouseEnter={() => playHoverSound("button")}
              >
                <Youtube className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Family Stories
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => {
                  playClickSound("secondary");
                  window.open(
                    "https://www.facebook.com/Apna Parivar",
                    "_blank"
                  );
                }}
                onMouseEnter={() => playHoverSound("button")}
              >
                <Facebook className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Community
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-zinc-200 dark:border-zinc-800 bg-transparent text-xs px-2 py-1 md:px-3 md:py-2"
                onClick={() => {
                  playClickSound("secondary");
                  window.open(
                    "https://www.instagram.com/Apna Parivar",
                    "_blank"
                  );
                }}
                onMouseEnter={() => playHoverSound("button")}
              >
                <Instagram className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Memories
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mb-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            2024 Apna Parivar. Created by{" "}
            <span className="font-semibold text-black dark:text-white">
              Apna Parivar Team
            </span>
            . All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Payment Trigger Button */}
      <AnimatePresence>
        {showFloatingPayment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={handleRazorpayPayment}
              disabled={isPaymentLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 10px 30px rgba(99, 102, 241, 0.3)",
                  "0 15px 40px rgba(147, 51, 234, 0.4)",
                  "0 10px 30px rgba(99, 102, 241, 0.3)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              {isPaymentLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span>Upgrade to Premium</span>
                  <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    ₹999/year
                  </div>
                </>
              )}
            </motion.button>

            {/* Floating notification for trial users */}
            {subscriptionStatus === 'trial' && trialDaysLeft <= 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -top-12 right-0 bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
              >
                Trial expires in {trialDaysLeft} days!
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-500" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
