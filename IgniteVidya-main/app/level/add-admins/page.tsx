"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Crown, User, Mail, Shield, ShieldCheck, ShieldX, UserCheck, UserX, Search, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  photo?: string;
  isAdmin: boolean;
  isMainAdmin: boolean;
  addedDate: string;
}

export default function AddAdminsPage() {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'promote' | 'demote'>('promote');
  const [targetMember, setTargetMember] = useState<FamilyMember | null>(null);

  // Sample family members data - in a real app, this would come from your database
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Ramesh",
      relation: "Self",
      email: "ramesh@gmail.com",
      phone: "+91 98765 43200",
      isAdmin: true,
      isMainAdmin: true,
      addedDate: "2024-01-01"
    },
    {
      id: "2",
      name: "Krishnappa",
      relation: "Father",
      email: "krishnappa@gmail.com",
      phone: "+91 98765 43210",
      isAdmin: false,
      isMainAdmin: false,
      addedDate: "2024-01-15"
    },
    {
      id: "3",
      name: "Ramya",
      relation: "Sister",
      email: "ramya@gmail.com",
      phone: "+91 98765 43211",
      isAdmin: true,
      isMainAdmin: false,
      addedDate: "2024-01-20"
    },
    {
      id: "4",
      name: "Lakshmi",
      relation: "Mother",
      email: "lakshmi@gmail.com",
      phone: "+91 98765 43212",
      isAdmin: false,
      isMainAdmin: false,
      addedDate: "2024-01-25"
    },
    {
      id: "5",
      name: "Priya",
      relation: "Wife",
      email: "priya@gmail.com",
      phone: "+91 98765 43213",
      isAdmin: false,
      isMainAdmin: false,
      addedDate: "2024-02-01"
    },
    {
      id: "6",
      name: "Arjun",
      relation: "Son",
      email: "arjun@gmail.com",
      phone: "+91 98765 43214",
      isAdmin: false,
      isMainAdmin: false,
      addedDate: "2024-02-10"
    }
  ]);

  // Current user (main admin)
  const currentUser = familyMembers.find(member => member.isMainAdmin);
  
  // Filter members based on search query
  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get non-admin members for promotion
  const nonAdminMembers = familyMembers.filter(member => !member.isAdmin && !member.isMainAdmin);
  
  // Get admin members (excluding main admin) for demotion
  const adminMembers = familyMembers.filter(member => member.isAdmin && !member.isMainAdmin);
  
  // Admin limit constants
  const MAX_ADMINS = 2;
  const currentAdminCount = adminMembers.length;
  const canPromoteMore = currentAdminCount < MAX_ADMINS;

  const handlePromoteToAdmin = (member: FamilyMember) => {
    if (!canPromoteMore) {
      toast.error(`Maximum of ${MAX_ADMINS} admins allowed. Please remove an existing admin first.`);
      return;
    }
    setTargetMember(member);
    setActionType('promote');
    setShowConfirmDialog(true);
  };

  const handleRemoveAdmin = (member: FamilyMember) => {
    setTargetMember(member);
    setActionType('demote');
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!targetMember) return;

    setIsProcessing(true);
    setShowConfirmDialog(false);

    try {
      const response = await fetch('/api/manage-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: targetMember.id,
          action: actionType,
          adminName: currentUser?.name || 'Main Admin',
          currentAdminCount: currentAdminCount
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the member's admin status
        setFamilyMembers(prev => prev.map(member => 
          member.id === targetMember.id 
            ? { ...member, isAdmin: actionType === 'promote' }
            : member
        ));

        if (actionType === 'promote') {
          toast.success(`${targetMember.name} has been promoted to admin! They will receive an email notification.`);
        } else {
          toast.success(`${targetMember.name}'s admin privileges have been removed. They have been notified via email.`);
        }

        setTargetMember(null);
        setSelectedMemberId("");
      } else {
        toast.error(result.message || "Failed to update admin status");
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to update admin status. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getAdminBadgeColor = (member: FamilyMember) => {
    if (member.isMainAdmin) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    if (member.isAdmin) return "bg-gradient-to-r from-blue-500 to-purple-500";
    return "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">
              Manage Family Admins
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Promote family members to admin or remove admin privileges
            </p>
          </motion.div>
        </div>

        {/* Current Admin Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              You are logged in as <strong>{currentUser?.name}</strong> (Main Admin). 
              You have full control over admin privileges for all family members.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Promote to Admin Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={`${canPromoteMore ? 'border-green-200 dark:border-green-800' : 'border-orange-200 dark:border-orange-800'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${canPromoteMore ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
                  <UserCheck className="h-5 w-5" />
                  Promote to Admin
                  <Badge variant={canPromoteMore ? "secondary" : "destructive"} className="ml-2">
                    {currentAdminCount}/{MAX_ADMINS} Admins
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!canPromoteMore && (
                  <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <AlertDescription className="text-orange-800 dark:text-orange-200">
                      <strong>Admin Limit Reached:</strong> Maximum of {MAX_ADMINS} admins allowed. 
                      Remove an existing admin to promote a new member.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black dark:text-white">
                    Select Family Member to Promote
                  </label>
                  <Select 
                    value={selectedMemberId} 
                    onValueChange={setSelectedMemberId}
                    disabled={!canPromoteMore}
                  >
                    <SelectTrigger className={!canPromoteMore ? "opacity-50 cursor-not-allowed" : ""}>
                      <SelectValue placeholder={canPromoteMore ? "Choose a family member..." : "Admin limit reached"} />
                    </SelectTrigger>
                    <SelectContent>
                      {nonAdminMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                              <User className="h-3 w-3 text-white" />
                            </div>
                            <div>
                              <span className="font-medium">{member.name}</span>
                              <span className="text-sm text-zinc-500 ml-2">({member.relation})</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMemberId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    {(() => {
                      const selectedMember = nonAdminMembers.find(m => m.id === selectedMemberId);
                      return selectedMember ? (
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-black dark:text-white">{selectedMember.name}</h3>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedMember.relation}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-zinc-500" />
                              <span className="text-zinc-600 dark:text-zinc-400">{selectedMember.email}</span>
                            </div>
                            {selectedMember.phone && (
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-500">📞</span>
                                <span className="text-zinc-600 dark:text-zinc-400">{selectedMember.phone}</span>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={() => handlePromoteToAdmin(selectedMember)}
                            disabled={isProcessing || !canPromoteMore}
                            className={`w-full mt-4 text-white ${
                              canPromoteMore 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            {canPromoteMore ? 'Make Admin' : 'Admin Limit Reached'}
                          </Button>
                        </div>
                      ) : null;
                    })()}
                  </motion.div>
                )}

                {nonAdminMembers.length === 0 && canPromoteMore && (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">
                    <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>All family members are already admins</p>
                  </div>
                )}
                
                {nonAdminMembers.length > 0 && !canPromoteMore && (
                  <div className="text-center py-8 text-orange-500 dark:text-orange-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Admin limit reached ({MAX_ADMINS}/{MAX_ADMINS})</p>
                    <p className="text-sm mt-1">Remove an admin to promote new members</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Remove Admin Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <UserX className="h-5 w-5" />
                  Remove Admin Privileges
                  <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
                    {currentAdminCount} Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAdminCount >= MAX_ADMINS && (
                  <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      <strong>Admin Limit Reached:</strong> You have reached the maximum of {MAX_ADMINS} admins. 
                      Consider removing an admin before promoting new members.
                    </AlertDescription>
                  </Alert>
                )}
                
                {adminMembers.length > 0 ? (
                  <div className="space-y-3">
                    {adminMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                              <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                                {member.name}
                                <Badge className={`${getAdminBadgeColor(member)} text-white text-xs`}>
                                  Admin {adminMembers.indexOf(member) + 1}/{MAX_ADMINS}
                                </Badge>
                              </h3>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.relation}</p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-500">{member.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveAdmin(member)}
                            disabled={isProcessing}
                          >
                            <ShieldX className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-500">
                    <ShieldX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No other admins to manage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* All Family Members Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Family Members
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search family members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAdminBadgeColor(member)} flex items-center justify-center`}>
                        {member.isMainAdmin ? (
                          <Crown className="h-5 w-5 text-white" />
                        ) : member.isAdmin ? (
                          <ShieldCheck className="h-5 w-5 text-white" />
                        ) : (
                          <User className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                          {member.name}
                          {member.isMainAdmin && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                              Main Admin
                            </Badge>
                          )}
                          {member.isAdmin && !member.isMainAdmin && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                              Admin
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.relation}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-zinc-500" />
                        <span className="text-zinc-600 dark:text-zinc-400 truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">📞</span>
                          <span className="text-zinc-600 dark:text-zinc-400">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && targetMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  actionType === 'promote' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {actionType === 'promote' ? (
                    <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    {actionType === 'promote' ? 'Promote to Admin' : 'Remove Admin Privileges'}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {targetMember.name} ({targetMember.relation})
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-zinc-700 dark:text-zinc-300">
                  {actionType === 'promote' 
                    ? `Are you sure you want to promote ${targetMember.name} to admin? They will receive full administrative privileges and an email notification.`
                    : `Are you sure you want to remove admin privileges from ${targetMember.name}? They will no longer be able to manage family members or settings.`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={isProcessing}
                  className={`flex-1 ${
                    actionType === 'promote' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'promote' ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Promote to Admin
                        </>
                      ) : (
                        <>
                          <ShieldX className="h-4 w-4 mr-2" />
                          Remove Admin
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}