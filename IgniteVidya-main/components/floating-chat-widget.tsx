'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import FamilyChat from './family-chat';

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUserFamily();
  }, []);

  const checkUserFamily = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: member } = await supabase
        .from('family_members')
        .select('family_id, is_admin')
        .eq('user_id', user.id)
        .single();

      if (member) {
        setFamilyId(member.family_id);
        setIsAdmin(member.is_admin);
      }
    } catch (err) {
      console.error('Error checking family:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show widget if user is not part of a family
  if (isLoading || !familyId) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open family chat"
        >
          <MessageCircle className="w-7 h-7" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 right-6 w-80'
              : 'bottom-6 right-6 w-96 h-[600px]'
          }`}
        >
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-bold">Family Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <FamilyChat familyId={familyId} isAdmin={isAdmin} />
              </div>
            )}

            {/* Minimized State */}
            {isMinimized && (
              <div className="p-4 text-center text-gray-600 text-sm">
                Click to expand chat
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
