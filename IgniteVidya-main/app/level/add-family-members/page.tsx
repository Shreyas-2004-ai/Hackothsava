"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, User, Mail, Camera, Save, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";

export default function AddFamilyMembersPage() {
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    email: "",
    photo: null as File | null,
    customFields: {
      field1: "",
      field2: "",
      field3: "",
      field4: "",
      field5: "",
      field6: "",
      field7: "",
      field8: "",
      field9: "",
      field10: "",
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Helper function to refresh family tree after adding member
  const refreshFamilyTree = async (familyId: string) => {
    try {
      await fetch('/api/family-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh_stats',
          familyId: familyId
        }),
      });
    } catch (error) {
      console.error('Failed to refresh family tree:', error);
    }
  };

  const relationOptions = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
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
    "Other"
  ];

  const customFieldLabels = [
    "Birth Date",
    "Birth Place",
    "Occupation",
    "Education",
    "Phone Number",
    "Address",
    "Hobbies",
    "Achievements",
    "Notes",
    "Additional Info"
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomFieldChange = (fieldKey: string, value: string) => {
    setFormData({
      ...formData,
      customFields: {
        ...formData.customFields,
        [fieldKey]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.relation || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, get current user from auth context
      const currentUser = {
        id: 'user-123', // This would come from authentication
        name: 'Ramesh Kumar', // This would come from user profile
        email: 'ramesh@gmail.com'
      };

      const response = await fetch('/api/add-family-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          addedBy: currentUser.name,
          addedById: currentUser.id,
          phone: formData.customFields.field5 || '', // Phone number from custom fields
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${formData.name} has been added to your family tree! An invitation email has been sent to ${formData.email}`);
        
        // Refresh family tree statistics
        await refreshFamilyTree(currentUser.id);
        
        // Reset form
        setFormData({
          name: "",
          relation: "",
          email: "",
          photo: null,
          customFields: {
            field1: "", field2: "", field3: "", field4: "", field5: "",
            field6: "", field7: "", field8: "", field9: "", field10: ""
          }
        });
        setPhotoPreview(null);
        
        // Show additional success information
        toast.success(`Family tree updated! ${formData.name} can now access the family tree at ApnaParivar.com`, {
          duration: 5000
        });
      } else {
        toast.error(result.message || "Failed to add family member");
      }
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to add family member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Add Family Member
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Add a new member to your Apna Parivar family tree
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Family Member Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Krishnappa"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Relation */}
                  <div className="space-y-2">
                    <Label htmlFor="relation">Relation *</Label>
                    <Select value={formData.relation} onValueChange={(value) => setFormData({ ...formData, relation: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationOptions.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Member's Gmail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g., krishnappa@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('photo')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Upload Photo
                      </Button>
                      {photoPreview && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFieldLabels.map((label, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`field${index + 1}`}>{label}</Label>
                        <Input
                          id={`field${index + 1}`}
                          type="text"
                          placeholder={`Enter ${label.toLowerCase()}`}
                          value={formData.customFields[`field${index + 1}` as keyof typeof formData.customFields]}
                          onChange={(e) => handleCustomFieldChange(`field${index + 1}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Family Member
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Automatic Email Notification
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    After saving, the family member will automatically receive an email notification 
                    informing them that they have been added to your Apna Parivar family tree. 
                    The email will include a link to sign in at ApnaParivar.com with their Google account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}