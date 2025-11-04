'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  addedAt: string;
}

interface FamilyContextType {
  members: FamilyMember[];
  loading: boolean;
  refreshMembers: () => Promise<void>;
  addMember: (member: FamilyMember) => void;
  removeMember: (memberId: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Listen for family member events
  React.useEffect(() => {
    const handleMemberAdded = (event: CustomEvent) => {
      const newMember = event.detail.member;
      setMembers(prev => [newMember, ...prev]);
    };

    const handleMemberRemoved = (event: CustomEvent) => {
      const memberId = event.detail.memberId;
      setMembers(prev => prev.filter(member => member.id !== memberId));
    };

    window.addEventListener('familyMemberAdded', handleMemberAdded as EventListener);
    window.addEventListener('familyMemberRemoved', handleMemberRemoved as EventListener);

    return () => {
      window.removeEventListener('familyMemberAdded', handleMemberAdded as EventListener);
      window.removeEventListener('familyMemberRemoved', handleMemberRemoved as EventListener);
    };
  }, []);

  const refreshMembers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/list-members', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.members);
      } else {
        console.error('Failed to load members:', data.message);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback((member: FamilyMember) => {
    setMembers(prev => [member, ...prev]);
  }, []);

  const removeMember = useCallback((memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  }, []);

  const value = {
    members,
    loading,
    refreshMembers,
    addMember,
    removeMember,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
}