'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DebugFamilyPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkEverything();
  }, []);

  const checkEverything = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      const info: any = {
        currentUser: user ? {
          id: user.id,
          email: user.email,
        } : null,
        userError: userError?.message,
      };

      if (user) {
        // Check family_members for this user
        const { data: members, error: membersError } = await supabase
          .from('family_members')
          .select('*')
          .eq('user_id', user.id);

        info.familyMembers = members;
        info.membersError = membersError?.message;

        // Get all family members (to see what's in the table)
        const { data: allMembers, error: allMembersError } = await supabase
          .from('family_members')
          .select('*');

        info.allFamilyMembers = allMembers;
        info.allMembersError = allMembersError?.message;

        // Get all families
        const { data: families, error: familiesError } = await supabase
          .from('families')
          .select('*');

        info.allFamilies = families;
        info.familiesError = familiesError?.message;
      }

      setDebugInfo(info);
    } catch (err: any) {
      setDebugInfo({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Family Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo?.currentUser, null, 2)}
          </pre>
          {debugInfo?.userError && (
            <p className="text-red-600 mt-2">Error: {debugInfo.userError}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Family Memberships</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo?.familyMembers, null, 2)}
          </pre>
          {debugInfo?.membersError && (
            <p className="text-red-600 mt-2">Error: {debugInfo.membersError}</p>
          )}
          {debugInfo?.familyMembers?.length === 0 && (
            <p className="text-yellow-600 mt-2">
              ⚠️ No family memberships found for your user ID. This is why chat doesn't work!
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">All Family Members in Database</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm max-h-96">
            {JSON.stringify(debugInfo?.allFamilyMembers, null, 2)}
          </pre>
          {debugInfo?.allMembersError && (
            <p className="text-red-600 mt-2">Error: {debugInfo.allMembersError}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">All Families in Database</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(debugInfo?.allFamilies, null, 2)}
          </pre>
          {debugInfo?.familiesError && (
            <p className="text-red-600 mt-2">Error: {debugInfo.familiesError}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-2">How to Fix:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Copy your current user ID from above</li>
            <li>Go to Supabase Dashboard → Table Editor → family_members</li>
            <li>Find the row for your account</li>
            <li>Update the <code className="bg-gray-200 px-1 rounded">user_id</code> field to match your current user ID</li>
            <li>Refresh this page to verify</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
