'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UserX, Ban, CheckCircle, Shield, AlertTriangle } from 'lucide-react';

interface FamilyMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  photo_url?: string;
  relation?: string;
  is_admin: boolean;
  is_primary_admin: boolean;
  created_at: string;
}

interface BannedMember {
  id: string;
  member_id: string;
  reason?: string;
  banned_at: string;
  unban_at?: string;
  is_active: boolean;
}

interface AdminMemberManagementProps {
  familyId: string;
}

export default function AdminMemberManagement({ familyId }: AdminMemberManagementProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [bannedMembers, setBannedMembers] = useState<BannedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [reason, setReason] = useState('');
  const [banDuration, setBanDuration] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadMembers();
    loadBannedMembers();
  }, [familyId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBannedMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_banned_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true);

      if (error) throw error;
      setBannedMembers(data || []);
    } catch (err) {
      console.error('Error loading banned members:', err);
    }
  };

  const handleKick = async () => {
    if (!selectedMember) return;
    setActionLoading(selectedMember.id);

    try {
      const response = await fetch('/api/admin/kick-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_member_id: selectedMember.id,
          family_id: familyId,
          reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Member kicked successfully!');
        setShowKickModal(false);
        setReason('');
        loadMembers();
      } else {
        alert(data.error || 'Failed to kick member');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async () => {
    if (!selectedMember) return;
    setActionLoading(selectedMember.id);

    try {
      const response = await fetch('/api/admin/ban-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_member_id: selectedMember.id,
          family_id: familyId,
          reason,
          duration_days: banDuration
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Member banned successfully!');
        setShowBanModal(false);
        setReason('');
        setBanDuration(null);
        loadMembers();
        loadBannedMembers();
      } else {
        alert(data.error || 'Failed to ban member');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (memberId: string) => {
    setActionLoading(memberId);

    try {
      const response = await fetch('/api/admin/unban-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_member_id: memberId,
          family_id: familyId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Member unbanned successfully!');
        loadBannedMembers();
      } else {
        alert(data.error || 'Failed to unban member');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const isMemberBanned = (memberId: string) => {
    return bannedMembers.some(b => b.member_id === memberId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          Family Members Management
        </h2>

        <div className="space-y-3">
          {members.map((member) => {
            const banned = isMemberBanned(member.id);
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  banned ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.first_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.first_name[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {member.first_name} {member.last_name}
                      </h3>
                      {member.is_admin && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                      {member.is_primary_admin && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Primary Admin
                        </span>
                      )}
                      {banned && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Banned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    {member.relation && (
                      <p className="text-xs text-gray-500">{member.relation}</p>
                    )}
                  </div>
                </div>

                {!member.is_primary_admin && (
                  <div className="flex gap-2">
                    {!banned ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowBanModal(true);
                          }}
                          disabled={actionLoading === member.id}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                          <Ban className="w-4 h-4" />
                          Ban
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowKickModal(true);
                          }}
                          disabled={actionLoading === member.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                          <UserX className="w-4 h-4" />
                          Kick
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUnban(member.id)}
                        disabled={actionLoading === member.id}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Unban
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Kick Modal */}
      {showKickModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Kick Member</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to kick <strong>{selectedMember.first_name} {selectedMember.last_name}</strong>? 
              This will permanently remove them from the family.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for kicking (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowKickModal(false);
                  setReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleKick}
                disabled={actionLoading === selectedMember.id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Kick Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-4">
              <Ban className="w-6 h-6" />
              <h3 className="text-xl font-bold">Ban Member</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Ban <strong>{selectedMember.first_name} {selectedMember.last_name}</strong> from sending messages.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for banning (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={3}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ban Duration
              </label>
              <select
                value={banDuration || ''}
                onChange={(e) => setBanDuration(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Permanent</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setReason('');
                  setBanDuration(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={actionLoading === selectedMember.id}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                Ban Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
