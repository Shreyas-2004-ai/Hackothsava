'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Database, Users, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relation: string;
  phone?: string;
  created_at: string;
  added_at: string;
}

interface TestData {
  success: boolean;
  message: string;
  totalMembers: number;
  members: FamilyMember[];
  collectionStats: {
    count: number;
    size: number;
    avgObjSize: number;
  };
}

export default function TestFamilyMembersPage() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-family-members');
      const data = await response.json();
      
      if (data.success) {
        setTestData(data);
      } else {
        setError(data.message || 'Failed to load test data');
      }
    } catch (err) {
      setError('Network error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  const clearAllMembers = async () => {
    if (!confirm('Are you sure you want to clear ALL family members? This cannot be undone!')) {
      return;
    }
    
    setClearing(true);
    
    try {
      const response = await fetch('/api/test-family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        loadTestData(); // Reload data
      } else {
        alert('Failed to clear members: ' + data.message);
      }
    } catch (err) {
      alert('Error clearing members: ' + String(err));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            🧪 Family Members Test Page
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test MongoDB connection and family member functionality
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadTestData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </motion.button>

          <Link href="/admin/add-member">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg"
            >
              <Users className="w-5 h-5" />
              Add Test Member
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllMembers}
            disabled={clearing}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
            {clearing ? 'Clearing...' : 'Clear All'}
          </motion.button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Success Display */}
        {testData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Connection Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  MongoDB Connection Status
                </h2>
              </div>
              <p className="text-green-600 dark:text-green-400 font-semibold">
                ✅ {testData.message}
              </p>
            </div>

            {/* Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Database Statistics
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {testData.totalMembers}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Collection Size</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(testData.collectionStats.size / 1024)} KB
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Object Size</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(testData.collectionStats.avgObjSize)} bytes
                  </p>
                </div>
              </div>
            </div>

            {/* Family Members List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Family Members ({testData.members.length})
                </h2>
              </div>
              
              {testData.members.length > 0 ? (
                <div className="space-y-4">
                  {testData.members.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {member.relation}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.email}
                          </p>
                          {member.phone && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              📞 {member.phone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Added: {new Date(member.added_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            ID: {member.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No family members found in database
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    Add some members to test the functionality
                  </p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-2 text-yellow-800 dark:text-yellow-200">
                🧪 Testing Instructions:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Click "Add Test Member" to add a new family member</li>
                <li>After adding, you should see the member appear here immediately</li>
                <li>Go to the Family Tree page to see if it updates dynamically</li>
                <li>Use "Refresh Data" to manually reload the data</li>
                <li>Use "Clear All" to reset the database for testing</li>
              </ol>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}