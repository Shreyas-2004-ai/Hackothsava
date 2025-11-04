"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, UserPlus, Mail, Phone } from "lucide-react";
import Link from "next/link";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  addedAt: string;
}

export default function FamilyTreePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      const response = await fetch('/api/list-members');
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading family tree...</p>
        </div>
      </div>
    );
  }

  // Group members by relation
  const groupedMembers = members.reduce((acc, member) => {
    const relation = member.relation || 'Other';
    if (!acc[relation]) {
      acc[relation] = [];
    }
    acc[relation].push(member);
    return acc;
  }, {} as Record<string, FamilyMember[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
            🌳 Apna Parivar Family Tree
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {members.length} family members connected with love
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/admin/add-member">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                Add Member
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Family Members Grid */}
        {members.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedMembers).map(([relation, relationMembers]) => (
              <motion.div
                key={relation}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                  <Users className="w-7 h-7 text-blue-600" />
                  {relation}s ({relationMembers.length})
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relationMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600"
                    >
                      {/* Avatar */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                            {member.relation}
                          </p>
                        </div>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 text-purple-500" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Added Date */}
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Added {new Date(member.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-12 shadow-xl text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Start Your Family Tree
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Add your first family member to begin building your beautiful family tree
            </p>
            <Link href="/admin/add-member">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto shadow-lg"
              >
                <UserPlus className="w-6 h-6" />
                Add First Member
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
