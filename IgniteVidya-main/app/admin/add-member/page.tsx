"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Users,
  CheckCircle2,
  Sparkles,
  Save,
  ArrowLeft,
  Phone,
  Camera,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useFamilyContext } from "@/contexts/FamilyContext";

export default function AddMemberPage() {
  const router = useRouter();
  const { refreshMembers } = useFamilyContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    relation: "",
    phone: "",
    photo: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const relations = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Spouse",
    "Grandfather",
    "Grandmother",
    "Uncle",
    "Aunt",
    "Cousin",
    "Nephew",
    "Niece",
    "Husband",
    "Wife",
    "Father-in-law",
    "Mother-in-law",
    "Son-in-law",
    "Daughter-in-law",
    "Brother-in-law",
    "Sister-in-law",
    "Other",
  ];

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phone.trim() === '' || phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only allow specific image MIME types
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, PNG, GIF, or WEBP)");
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Validate file extension as additional security
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        toast.error("Invalid file extension. Please upload JPG, PNG, GIF, or WEBP files only.");
        return;
      }
      
      setFormData({ ...formData, photo: file });
      
      // Create preview securely
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreview(e.target.result as string);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (!formData.relation) {
      toast.error("Please select a relation");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email.trim().toLowerCase(),
        relation: formData.relation,
        phone: formData.phone.trim() || "",
        customFields: {},
        addedAt: new Date().toISOString(),
      };

      if (formData.photo) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Photo = reader.result as string;
          await submitMemberData({ ...submitData, photo: base64Photo });
        };
        reader.readAsDataURL(formData.photo);
      } else {
        await submitMemberData(submitData);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add member. Please try again.");
      setLoading(false);
    }
  };

  const submitMemberData = async (data: any) => {
    try {
      const res = await fetch("/api/add-member", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-name": "Family Member",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSuccess(true);
        
        // Show success message with email status
        if (result.emailSent) {
          toast.success(
            `${formData.name} has been added to the database! ✅ An invitation email has been sent to ${formData.email}.`,
            { duration: 6000 }
          );
        } else {
          toast.success(
            `${formData.name} has been added to the database! ✅ Note: Email service may need configuration.`,
            { duration: 6000 }
          );
        }
        
        // Clear form
        setFormData({
          name: "",
          email: "",
          relation: "",
          phone: "",
          photo: null,
        });
        setPhotoPreview(null);
        
        // Refresh the family members list immediately
        refreshMembers();
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('familyMemberAdded', {
          detail: { 
            member: {
              id: result.memberId,
              name: formData.name,
              email: formData.email,
              relation: formData.relation,
              phone: formData.phone,
              addedAt: new Date().toISOString()
            }
          }
        }));
        
        // Redirect to family tree after successful addition
        setTimeout(() => {
          setSuccess(false);
          // Redirect to family tree with refresh parameter
          router.push('/family-tree?refresh=true');
        }, 2000);
      } else {
        toast.error(result.message || "Failed to add member");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
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
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-30 w-full">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </motion.button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-2">
              Add Family Member
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Add a new member to your Apna Parivar family tree
            </p>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Card className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-black shadow-xl">
            {/* Shiny Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Subtle Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:8px_8px]" />
            </div>

            <form onSubmit={handleSubmit} className="relative p-6 sm:p-8 lg:p-10">
              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Name of Member *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Krishnappa"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                    required
                  />
                </div>

                {/* Relation */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 text-green-500" />
                    Relation to Me *
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) =>
                      setFormData({ ...formData, relation: e.target.value })
                    }
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-green-500 dark:focus:border-green-400 outline-none transition-all"
                    required
                  >
                    <option value="">Select relation</option>
                    {relations.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Member's Gmail */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 text-purple-500" />
                    Their Mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g., krishnappa@gmail.com"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-all"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    Their Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g., +91 9876543210"
                    className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                  />
                </div>

                {/* Photo Upload - Large Section */}
                <div className="pt-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    <Camera className="w-5 h-5 text-orange-500" />
                    Upload Photo
                  </label>
                  
                  {photoPreview ? (
                    <div className="relative w-full">
                      <div className="relative border-4 border-dashed border-orange-300 dark:border-orange-700 rounded-2xl p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                            <img
                              src={photoPreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            Click to change photo
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload-large"
                      />
                      <label
                        htmlFor="photo-upload-large"
                        className="flex flex-col items-center justify-center w-full h-64 sm:h-80 border-4 border-dashed border-orange-300 dark:border-orange-700 rounded-2xl p-8 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 cursor-pointer hover:border-orange-400 dark:hover:border-orange-600 transition-all group"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              Click to upload photo
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                              or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              PNG, JPG, GIF or WEBP (MAX. 5MB)
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-6 py-4 rounded-xl mb-6"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-semibold">
                      Family member added successfully!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg transition-all"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="w-6 h-6" />
                      </motion.div>
                      Adding Member...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Save
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => router.push("/family-tree")}
                  className="sm:w-auto px-8 h-14 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl flex items-center justify-center gap-3 text-lg transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  View Family Tree
                </motion.button>
              </div>
            </form>
          </Card>

          {/* Info Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm"
          >
            An email invitation will be sent automatically to the member's Gmail address
          </motion.p>
        </div>
      </div>
    </div>
  );
}
