'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetupTestFamilyPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, message]);
  };

  const setupTestFamily = async () => {
    setLoading(true);
    setStatus([]);
    setError('');
    setSuccess(false);

    try {
      addStatus('🔍 Checking current user...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to set up a test family');
      }

      addStatus(`✅ Found user: ${user.email}`);

      // Check if user already has a family
      addStatus('🔍 Checking existing family membership...');
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        addStatus('⚠️ You already have a family! Redirecting to chat...');
        setTimeout(() => router.push('/family-chat'), 2000);
        return;
      }

      // Create a test family
      addStatus('🏠 Creating test family...');
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          family_name: 'Test Family',
          created_by: user.id,
          subscription_type: 'free_trial',
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (familyError) throw familyError;
      addStatus(`✅ Created family: ${family.family_name} (ID: ${family.id})`);

      // Create primary admin (current user)
      addStatus('👤 Creating your admin account...');
      const { data: adminMember, error: adminError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          email: user.email || 'admin@test.com',
          first_name: 'Admin',
          last_name: 'User',
          relation: 'Primary Admin',
          is_admin: true,
          is_primary_admin: true,
          invitation_accepted: true
        })
        .select()
        .single();

      if (adminError) throw adminError;
      addStatus(`✅ Created admin member: ${adminMember.first_name} ${adminMember.last_name}`);

      // Create test family member 1
      addStatus('👤 Creating test member 1...');
      const { error: member1Error } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: null, // No auth user linked
          email: 'john@test.com',
          first_name: 'John',
          last_name: 'Doe',
          relation: 'Father',
          is_admin: false,
          is_primary_admin: false,
          invitation_accepted: true
        });

      if (member1Error) throw member1Error;
      addStatus('✅ Created test member: John Doe (Father)');

      // Create test family member 2
      addStatus('👤 Creating test member 2...');
      const { error: member2Error } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: null, // No auth user linked
          email: 'jane@test.com',
          first_name: 'Jane',
          last_name: 'Doe',
          relation: 'Mother',
          is_admin: false,
          is_primary_admin: false,
          invitation_accepted: true
        });

      if (member2Error) throw member2Error;
      addStatus('✅ Created test member: Jane Doe (Mother)');

      // Create test family member 3
      addStatus('👤 Creating test member 3...');
      const { error: member3Error } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: null, // No auth user linked
          email: 'alice@test.com',
          first_name: 'Alice',
          last_name: 'Doe',
          relation: 'Daughter',
          is_admin: false,
          is_primary_admin: false,
          invitation_accepted: true
        });

      if (member3Error) throw member3Error;
      addStatus('✅ Created test member: Alice Doe (Daughter)');

      // Send a welcome message
      addStatus('💬 Sending welcome message...');
      const { error: messageError } = await supabase
        .from('family_messages')
        .insert({
          family_id: family.id,
          sender_id: adminMember.id,
          message_text: 'Welcome to the Test Family chat! 🎉',
          message_type: 'text',
          is_admin_message: true
        });

      if (messageError) throw messageError;
      addStatus('✅ Sent welcome message');

      addStatus('🎉 Setup complete! Redirecting to chat...');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/family-chat');
      }, 3000);

    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to set up test family');
      addStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Setup Test Family
            </h1>
            <p className="text-gray-600">
              Create a test family with sample members to try out the chat feature
            </p>
          </div>

          {/* Info Box */}
          {!loading && !success && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-2">What will be created:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✅ A test family named "Test Family"</li>
                <li>✅ You as the primary admin</li>
                <li>✅ 3 test family members (John, Jane, Alice)</li>
                <li>✅ A welcome message in the chat</li>
              </ul>
            </div>
          )}

          {/* Status Messages */}
          {status.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
              <h3 className="font-bold mb-2">Setup Progress:</h3>
              <div className="space-y-1 text-sm font-mono">
                {status.map((msg, idx) => (
                  <div key={idx} className="text-gray-700">
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">Success!</h3>
                <p className="text-sm text-green-700">
                  Test family created successfully. Redirecting to chat...
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={setupTestFamily}
              disabled={loading || success}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? 'Setting up...' : success ? 'Redirecting...' : 'Create Test Family'}
            </button>

            <button
              onClick={() => router.push('/')}
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all"
            >
              Back to Home
            </button>
          </div>

          {/* Debug Link */}
          <div className="mt-6 text-center">
            <a
              href="/debug-family"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              View Debug Information
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
