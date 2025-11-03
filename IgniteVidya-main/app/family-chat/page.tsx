'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import FamilyChat from '@/components/family-chat';
import { MessageCircle, Users } from 'lucide-react';

export default function FamilyChatPage() {
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

      // Get user's family membership
      const { data: member, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, is_admin')
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        // User is not part of a family yet
        setLoading(false);
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

  // Show message if user is not part of a family
  if (!familyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Family Chat!
            </h1>
            <p className="text-gray-600 mb-6">
              You need to be part of a family to use the chat feature.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/create-family')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
              >
                Create Your Family
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <MessageCircle className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ApnaParivar Chat
            </h1>
          </div>
          <p className="text-gray-600">Connect with your family in real-time</p>
        </div>

        {/* Navigation */}
        <div className="mb-6 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/family-chat')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            Chat
          </button>
          {isAdmin && (
            <button
              onClick={() => router.push('/admin/manage-members')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Manage Members
            </button>
          )}
        </div>

        {/* Chat Component */}
        <FamilyChat familyId={familyId} isAdmin={isAdmin} />

        {/* Info Card */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-bold text-lg mb-2">Chat Guidelines</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be respectful to all family members</li>
            <li>• Keep conversations family-friendly</li>
            <li>• Admins can moderate messages and manage members</li>
            <li>• Messages are visible to all family members</li>
            <li>• Report any issues to family admins</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
