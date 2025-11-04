"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Users,
  CheckCircle2,
  Sparkles,
  Phone,
  Home,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Building,
  Heart,
  Trophy,
  FileText,
  Info,
  X,
  Save,
  ArrowLeft,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function AddMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    relation: "",
    phone: "",
    photo: null as File | null,
    customFields: {
      birthDate: "",
      birthPlace: "",
      occupation: "",
      education: "",
      address: "",
      hobbies: "",
      achievements: "",
      notes: "",
      additionalInfo: "",
      emergencyContact: "",
    },
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData({ ...formData, photo: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  const handleCustomFieldChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [field]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        relation: formData.relation,
        phone: formData.phone || formData.customFields.emergencyContact || "",
        customFields: formData.customFields,
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success(`${formData.firstName} ${formData.lastName} has been added successfully!`);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          relation: "",
          phone: "",
          photo: null,
          customFields: {
            birthDate: "",
            birthPlace: "",
            occupation: "",
            education: "",
            address: "",
            hobbies: "",
            achievements: "",
            notes: "",
            additionalInfo: "",
            emergencyContact: "",
          },
        });
        setPhotoPreview(null);
        setTimeout(() => setSuccess(false), 3000);
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
              {/* Basic Information Section */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="e.g., Krishnappa"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="e.g., Kumar"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Mail className="w-4 h-4 text-purple-500" />
                      Member's Gmail *
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

                  {/* Relation */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Users className="w-4 h-4 text-green-500" />
                      Relation *
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

                  {/* Photo Upload */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Camera className="w-4 h-4 text-orange-500" />
                      Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-xl"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload Photo</span>
                      </label>
                      {photoPreview && (
                        <div className="relative group">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Additional Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Birth Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 text-red-500" />
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={formData.customFields.birthDate}
                      onChange={(e) =>
                        handleCustomFieldChange("birthDate", e.target.value)
                      }
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-red-500 dark:focus:border-red-400 outline-none transition-all"
                    />
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 text-pink-500" />
                      Birth Place
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.birthPlace}
                      onChange={(e) =>
                        handleCustomFieldChange("birthPlace", e.target.value)
                      }
                      placeholder="Enter birth place"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-pink-500 dark:focus:border-pink-400 outline-none transition-all"
                    />
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Briefcase className="w-4 h-4 text-amber-500" />
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.occupation}
                      onChange={(e) =>
                        handleCustomFieldChange("occupation", e.target.value)
                      }
                      placeholder="Enter occupation"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-amber-500 dark:focus:border-amber-400 outline-none transition-all"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <GraduationCap className="w-4 h-4 text-teal-500" />
                      Education
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.education}
                      onChange={(e) =>
                        handleCustomFieldChange("education", e.target.value)
                      }
                      placeholder="Enter education"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-teal-500 dark:focus:border-teal-400 outline-none transition-all"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || formData.customFields.emergencyContact}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Building className="w-4 h-4 text-indigo-500" />
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.address}
                      onChange={(e) =>
                        handleCustomFieldChange("address", e.target.value)
                      }
                      placeholder="Enter address"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>

                  {/* Hobbies */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Hobbies
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.hobbies}
                      onChange={(e) =>
                        handleCustomFieldChange("hobbies", e.target.value)
                      }
                      placeholder="Enter hobbies"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-rose-500 dark:focus:border-rose-400 outline-none transition-all"
                    />
                  </div>

                  {/* Achievements */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Achievements
                    </label>
                    <input
                      type="text"
                      value={formData.customFields.achievements}
                      onChange={(e) =>
                        handleCustomFieldChange("achievements", e.target.value)
                      }
                      placeholder="Enter achievements"
                      className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-yellow-500 dark:focus:border-yellow-400 outline-none transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Notes
                    </label>
                    <textarea
                      value={formData.customFields.notes}
                      onChange={(e) =>
                        handleCustomFieldChange("notes", e.target.value)
                      }
                      placeholder="Enter any additional notes"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-gray-500 dark:focus:border-gray-400 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Info className="w-4 h-4 text-cyan-500" />
                      Additional Info
                    </label>
                    <textarea
                      value={formData.customFields.additionalInfo}
                      onChange={(e) =>
                        handleCustomFieldChange("additionalInfo", e.target.value)
                      }
                      placeholder="Enter any additional information"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-cyan-500 dark:focus:border-cyan-400 outline-none transition-all resize-none"
                    />
                  </div>
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
                      Add Family Member
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
                  <Home className="w-5 h-5" />
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
