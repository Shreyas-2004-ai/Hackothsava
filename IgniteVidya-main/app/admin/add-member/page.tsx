"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, UserPlus, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function AddFamilyMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    email: "",
    birthDate: "",
    birthPlace: "",
    occupation: "",
    education: "",
    phoneNumber: "",
    address: "",
    hobbies: "",
    achievements: "",
    notes: "",
    additionalInfo: "",
  });

  const relations = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Grandfather",
    "Grandmother",
    "Grandson",
    "Granddaughter",
    "Uncle",
    "Aunt",
    "Nephew",
    "Niece",
    "Cousin",
    "Spouse",
    "Other",
  ];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Current user:", user);
      if (!user) throw new Error("Not authenticated");

      // Get admin's family
      const { data: adminMember, error: adminError } = await supabase
        .from("family_members")
        .select("family_id, id")
        .eq("user_id", user.id)
        .single();

      console.log("Admin member:", adminMember);
      console.log("Admin error:", adminError);

      if (!adminMember) {
        alert(
          "⚠️ No family found!\n\nYou need to create a family first before adding members.\n\nClick OK to go to the Create Family page."
        );
        router.push("/admin/create-family");
        return;
      }

      console.log("Family ID:", adminMember.family_id);

      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        console.log("Uploading photo...");
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${adminMember.family_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("family-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
          // Don't throw error, just skip photo
          console.log("Continuing without photo...");
        } else {
          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("family-photos").getPublicUrl(filePath);

          photoUrl = publicUrl;
          console.log("Photo uploaded:", photoUrl);
        }
      }

      // Add family member
      console.log("Adding family member to database...");
      const { data: newMember, error: memberError } = await supabase
        .from("family_members")
        .insert({
          family_id: adminMember.family_id,
          email: formData.email,
          first_name: formData.name.split(" ")[0],
          last_name: formData.name.split(" ").slice(1).join(" ") || "",
          relation: formData.relation,
          photo_url: photoUrl,
          date_of_birth: formData.birthDate || null,
          phone: formData.phoneNumber || null,
          address: formData.address || null,
          invited_by: adminMember.id,
          invitation_accepted: false,
        })
        .select()
        .single();

      if (memberError) {
        console.error("Member insert error:", memberError);
        throw memberError;
      }

      console.log("Member added successfully:", newMember);

      // Add custom field values
      const customFields = [
        { field_name: "Birth Place", value: formData.birthPlace },
        { field_name: "Occupation", value: formData.occupation },
        { field_name: "Education", value: formData.education },
        { field_name: "Hobbies", value: formData.hobbies },
        { field_name: "Achievements", value: formData.achievements },
        { field_name: "Notes", value: formData.notes },
        { field_name: "Additional Info", value: formData.additionalInfo },
      ];

      for (const field of customFields) {
        if (field.value) {
          // Get or create custom field
          let { data: customField } = await supabase
            .from("family_custom_fields")
            .select("id")
            .eq("family_id", adminMember.family_id)
            .eq("field_name", field.field_name)
            .single();

          if (!customField) {
            const { data: newField } = await supabase
              .from("family_custom_fields")
              .insert({
                family_id: adminMember.family_id,
                field_name: field.field_name,
                field_type: "text",
              })
              .select()
              .single();
            customField = newField;
          }

          if (customField) {
            await supabase.from("family_member_custom_values").insert({
              member_id: newMember.id,
              field_id: customField.id,
              field_value: field.value,
            });
          }
        }
      }

      // Show success popup
      const memberName = formData.name;
      const memberEmail = formData.email;

      // Create a nice success message
      const successMessage = `✅ Success!\n\n${memberName} has been added to your family tree!\n\n📧 An invitation will be sent to ${memberEmail}\n\n👨‍👩‍👧‍👦 You can view them in your family tree now.`;

      alert(successMessage);

      // Redirect to dashboard
      router.push("/admin/dashboard");
    } catch (error: any) {
      console.error("Error adding family member:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      let errorMessage = "Failed to add family member. ";

      if (error.message) {
        errorMessage += error.message;
      }

      if (error.code) {
        errorMessage += `\nError code: ${error.code}`;
      }

      if (error.details) {
        errorMessage += `\nDetails: ${error.details}`;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
              Add Family Member
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Add a new member to your Apna Parivar family tree
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Family Member Information */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4 flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Family Member Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Krishnappa"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Relation *
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) =>
                      setFormData({ ...formData, relation: e.target.value })
                    }
                    required
                    className="w-full h-12 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-black dark:text-white"
                  >
                    <option value="">Select relation</option>
                    {relations.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Member's Gmail *
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g., krishnappa@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </label>
                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                Additional Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Birth Date
                  </label>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Birth Place
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter birth place"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Occupation
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter occupation"
                    value={formData.occupation}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Education
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter education"
                    value={formData.education}
                    onChange={(e) =>
                      setFormData({ ...formData, education: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Hobbies
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter hobbies"
                    value={formData.hobbies}
                    onChange={(e) =>
                      setFormData({ ...formData, hobbies: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Achievements
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter achievements"
                    value={formData.achievements}
                    onChange={(e) =>
                      setFormData({ ...formData, achievements: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Notes
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Additional Info
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter additional info"
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalInfo: e.target.value,
                      })
                    }
                    className="h-12"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Save Family Member
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
