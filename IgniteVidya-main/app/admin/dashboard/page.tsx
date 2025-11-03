"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Users, UserPlus, Settings, LogOut, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Get family member info
    const { data: memberData } = await supabase
      .from('family_members')
      .select('*, families(*)')
      .eq('user_id', user.id)
      .single();

    if (!memberData || !memberData.is_admin) {
      router.push('/member/dashboard');
      return;
    }

    setFamily(memberData.families);
    loadMembers(memberData.family_id);
    setLoading(false);
  };

  const loadMembers = async (familyId: string) => {
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: true });

    if (data) setMembers(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
                {family?.family_name}
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Admin Dashboard
              </p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="rounded-xl"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Link href="/admin/add-member">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <UserPlus className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                Add Family Member
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Invite new members to your family
              </p>
            </div>
          </Link>

          <Link href="/admin/manage-admins">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                Manage Admins
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Promote or remove admin privileges
              </p>
            </div>
          </Link>

          <Link href="/family-tree">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <Eye className="h-8 w-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                View Family Tree
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See your complete family visualization
              </p>
            </div>
          </Link>
        </div>

        {/* Family Members List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Family Members ({members.length})
            </h2>
          </div>

          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {member.first_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black dark:text-white">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {member.relation || 'Family Member'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.is_primary_admin && (
                    <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold">
                      Primary Admin
                    </span>
                  )}
                  {member.is_admin && !member.is_primary_admin && (
                    <span className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold">
                      Admin
                    </span>
                  )}
                  {!member.invitation_accepted && (
                    <span className="px-3 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
