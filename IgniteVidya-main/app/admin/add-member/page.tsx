"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setbirthDate] = useState("");

  const relations = [
    "Father",
    "Mother",
    "Son",
    "Daughter",
    "Brother",
    "Sister",
    "Spouse",
    "Other",
  ];

  const handleSave = async () => {
    console.log("🚀 SAVE BUTTON CLICKED");

    // Validation
    if (!name || !relation || !email) {
      alert("Please fill Name, Relation, and Email");
      return;
    }

    console.log("✅ Validation passed");
    console.log("Data:", { name, relation, email, phone, birthDate });

    setLoading(true);

    try {
      // Step 1: Get current user
      console.log("📝 Step 1: Getting current user...");
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("User:", user);
      console.log("User error:", userError);

      if (userError || !user) {
        alert("Please sign in first");
        router.push("/login");
        return;
      }

      console.log("✅ User found:", user.email);

      // Step 2: Get user's family
      console.log("📝 Step 2: Getting user's family...");
      const { data: adminMember, error: familyError } = await supabase
        .from("family_members")
        .select("family_id, id")
        .eq("user_id", user.id)
        .single();

      console.log("Admin member:", adminMember);
      console.log("Family error:", familyError);

      if (familyError || !adminMember) {
        alert("Please create a family first at /admin/create-family");
        router.push("/admin/create-family");
        return;
      }

      console.log("✅ Family found:", adminMember.family_id);

      // Step 3: Insert new member
      console.log("📝 Step 3: Inserting new member...");

      const memberData = {
        family_id: adminMember.family_id,
        email: email,
        first_name: name.split(" ")[0],
        last_name: name.split(" ").slice(1).join(" ") || "",
        relation: relation,
        phone: phone || null,
        date_of_birth: birthDate || null,
        invited_by: adminMember.id,
        invitation_accepted: false,
        is_admin: false,
        is_primary_admin: false,
      };

      console.log("Data to insert:", memberData);

      const { data: newMember, error: insertError } = await supabase
        .from("family_members")
        .insert([memberData])
        .select();

      console.log("Insert result:", newMember);
      console.log("Insert error:", insertError);

      if (insertError) {
        console.error("❌ INSERT FAILED:", insertError);
        alert(`Error: ${insertError.message}\n\nCheck console for details`);
        return;
      }

      // Success!
      console.log("✅ SUCCESS! Member saved to database");
      console.log("New member:", newMember);

      alert(
        `✅ ${name} added successfully!\n\nMember ID: ${newMember[0].id}\n\nCheck Supabase table to verify!`
      );

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pt-24">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Add Family Member</h1>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="h-12"
              />
            </div>

            {/* Relation */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Relation *
              </label>
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full h-12 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              >
                <option value="">Select relation</option>
                {relations.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="h-12"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">Phone</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="h-12"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Birth Date
              </label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setbirthDate(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Family Member
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
