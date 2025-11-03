"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Users, X, Eye, ZoomIn, ZoomOut, RotateCcw, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import FamilyTreeNode from "@/components/family-tree/FamilyTreeNode";
import FamilyConnections from "@/components/family-tree/FamilyConnections";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  photo?: string;
  generation: number;
  position: { x: number; y: number };
  parentId?: string;
  children?: string[];
}

export default function ViewFamilyTreePage() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);

  // Sample family data - in a real app, this would come from your database
  const familyMembers: FamilyMember[] = [
    {
      id: "1",
      name: "Krishnappa",
      relation: "Father",
      email: "krishnappa@gmail.com",
      phone: "+91 98765 43210",
      photo: "/api/placeholder/100/100",
      generation: 0,
      position: { x: 400, y: 100 },
      children: ["3", "4"]
    },
    {
      id: "2",
      name: "Lakshmi",
      relation: "Mother",
      email: "lakshmi@gmail.com",
      phone: "+91 98765 43211",
      photo: "/api/placeholder/100/100",
      generation: 0,
      position: { x: 600, y: 100 },
      children: ["3", "4"]
    },
    {
      id: "3",
      name: "Rajesh",
      relation: "Son",
      email: "rajesh@gmail.com",
      phone: "+91 98765 43212",
      photo: "/api/placeholder/100/100",
      generation: 1,
      position: { x: 300, y: 300 },
      parentId: "1",
      children: ["5", "6"]
    },
    {
      id: "4",
      name: "Priya",
      relation: "Daughter",
      email: "priya@gmail.com",
      phone: "+91 98765 43213",
      photo: "/api/placeholder/100/100",
      generation: 1,
      position: { x: 700, y: 300 },
      parentId: "1"
    },
    {
      id: "5",
      name: "Arjun",
      relation: "Grandson",
      email: "arjun@gmail.com",
      phone: "+91 98765 43214",
      photo: "/api/placeholder/100/100",
      generation: 2,
      position: { x: 200, y: 500 },
      parentId: "3"
    },
    {
      id: "6",
      name: "Ananya",
      relation: "Granddaughter",
      email: "ananya@gmail.com",
      phone: "+91 98765 43215",
      photo: "/api/placeholder/100/100",
      generation: 2,
      position: { x: 400, y: 500 },
      parentId: "3"
    }
  ];

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = familyMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers([]);
    }
  }, [searchQuery]);

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate connection lines between family members
  const generateConnections = () => {
    const connections: JSX.Element[] = [];
    
    familyMembers.forEach(member => {
      if (member.children) {
        member.children.forEach(childId => {
          const child = familyMembers.find(m => m.id === childId);
          if (child) {
            connections.push(
              <line
                key={`${member.id}-${childId}`}
                x1={member.position.x + 50}
                y1={member.position.y + 100}
                x2={child.position.x + 50}
                y2={child.position.y}
                stroke="#e5e7eb"
                strokeWidth="2"
                className="dark:stroke-zinc-700"
              />
            );
          }
        });
      }
    });
    
    return connections;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black dark:text-white">
                  Family Tree
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Interactive family visualization
                </p>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search family members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="ml-2">
                {Math.round(zoomLevel * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Family Tree Visualization */}
      <div className="relative overflow-hidden h-[calc(100vh-80px)]">
        <div
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Connection Lines */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center'
            }}
          >
            <FamilyConnections members={familyMembers} />
          </div>

          {/* Family Members */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              zIndex: 2
            }}
          >
            {familyMembers.map((member) => (
              <FamilyTreeNode
                key={member.id}
                member={member}
                onClick={handleMemberClick}
                isSelected={selectedMember?.id === member.id}
              />
            ))}
          </div>
        </div>

        {/* Search Results Overlay */}
        {searchQuery && filteredMembers.length > 0 && (
          <div className="absolute top-20 left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-w-sm z-40">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-black dark:text-white">Search Results</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  onClick={() => {
                    handleMemberClick(member);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white">{member.name}</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.relation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 shadow-lg max-w-sm">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <strong>Instructions:</strong> Click on family members to view details • Drag to pan • Use zoom controls • Search to find specific members
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Family Connection</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-500">♥</span>
              <span>Marriage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => setSelectedMember(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden">
                    {selectedMember.photo ? (
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <CardTitle className="text-xl text-black dark:text-white">
                      {selectedMember.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {selectedMember.relation}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <Mail className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Email</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedMember.email}</p>
                  </div>
                </div>
                
                {/* Phone */}
                {selectedMember.phone && (
                  <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <Phone className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Phone</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedMember.phone}</p>
                    </div>
                  </div>
                )}
                
                {/* Generation */}
                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <Users className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">Generation</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedMember.generation === 0 ? 'Parents' : 
                       selectedMember.generation === 1 ? 'Children' : 
                       selectedMember.generation === 2 ? 'Grandchildren' : 
                       `Generation ${selectedMember.generation + 1}`}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}