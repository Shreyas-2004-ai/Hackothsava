'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import AdminMemberManagement from '@/components/admin-member-management';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ManageMembersPage() {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Get user's family membership and admin status
      const { data: member, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, is_admin')
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        alert('You are not part of any family.');
        router.push('/admin/create-family');
        return;
      }

      if (!member.is_admin) {
        alert('Admin access required to manage members.');
        router.push('/family-chat');
        return;
      }

      setFamilyId(member.family_id);
      setIsAdmin(member.is_admin);
    } catch (err) {
      console.error('Auth error:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!familyId || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/family-chat')}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">Manage family members and maintain a healthy community</p>
        </div>

        {/* Admin Controls Info */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-3">Admin Powers</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">🚫 Ban Member</h3>
              <p className="opacity-90">Temporarily or permanently restrict a member from sending messages. They can still view messages but cannot participate.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">👢 Kick Member</h3>
              <p className="opacity-90">Permanently remove a member from the family. This action cannot be undone and they will lose all access.</p>
            </div>
          </div>
        </div>

        {/* Member Management Component */}
        <AdminMemberManagement familyId={familyId} />

        {/* Warning */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>⚠️ Important:</strong> Use these powers responsibly. Kicking or banning members should only be done for valid reasons such as harassment, spam, or violation of family guidelines. The primary admin cannot be kicked or banned.
          </p>
        </div>
      </div>
    </div>
  );
}
