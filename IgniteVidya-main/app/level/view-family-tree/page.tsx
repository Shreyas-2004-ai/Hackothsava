"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Users,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Heart,
  TreePine,
  GitBranch,
  UserPlus,
  Info,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface FamilyMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  relation: string;
  email: string;
  phone?: string;
  photo?: string;
  photo_url?: string;
  generation: number;
  parentId?: string;
  spouseId?: string;
  children?: string[];
  customFields?: any;
  position?: { x: number; y: number };
}

export default function ViewFamilyTreePage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate statistics
  const totalMembers = familyMembers.length;
  const generations = Math.max(...familyMembers.map(m => m.generation), 0) + 1;
  const relationships = familyMembers.filter(m => m.parentId || m.children?.length).length;
  const marriages = familyMembers.filter(m => m.spouseId).length / 2;

  // Fetch family members from MongoDB
  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch from MongoDB via API
      const response = await fetch('/api/family-members');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Process the data: calculate generations and relationships
        const processedData = processFamilyData(result.data);
        
        // Organize by generation and calculate positions
        const organized = organizeByGeneration(processedData);
        setFamilyMembers(organized);
      } else {
        console.error("Failed to fetch family members:", result.message);
        // If no data, show empty tree
        setFamilyMembers([]);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process family data to calculate generations and relationships
  const processFamilyData = (members: FamilyMember[]): FamilyMember[] => {
    // Create a map for quick lookup
    const memberMap = new Map<string, FamilyMember>();
    members.forEach(m => memberMap.set(m.id, { ...m }));

    // Function to determine generation based on relation
    const getGenerationFromRelation = (relation: string): number => {
      const relationLower = relation.toLowerCase();
      if (relationLower.includes('grandfather') || relationLower.includes('grandmother') || 
          relationLower.includes('great')) {
        return 0; // Grandparents
      } else if (relationLower === 'father' || relationLower === 'mother' || 
                 relationLower === 'parent' || relationLower === 'husband' || 
                 relationLower === 'wife' || relationLower === 'spouse') {
        return 1; // Parents
      } else if (relationLower === 'son' || relationLower === 'daughter' || 
                 relationLower === 'child' || relationLower === 'brother' || 
                 relationLower === 'sister' || relationLower === 'uncle' || 
                 relationLower === 'aunt') {
        return 2; // Children/Relatives
      } else if (relationLower.includes('grandson') || relationLower.includes('granddaughter') || 
                 relationLower.includes('grandchild') || relationLower.includes('nephew') || 
                 relationLower.includes('niece')) {
        return 3; // Grandchildren
      }
      return 1; // Default
    };

    // Process each member
    const processed: FamilyMember[] = members.map(member => {
      // If generation is not set, calculate from relation
      const generation = member.generation !== undefined ? member.generation : getGenerationFromRelation(member.relation);
      
      // Find spouse by matching emails or explicit spouseId
      let spouseId = member.spouseId;
      if (!spouseId) {
        // Try to find spouse by relation (Husband/Wife) or by matching children
        const potentialSpouse = members.find(m => 
          m.id !== member.id && 
          ((m.relation.toLowerCase() === 'husband' && member.relation.toLowerCase() === 'wife') ||
           (m.relation.toLowerCase() === 'wife' && member.relation.toLowerCase() === 'husband') ||
           (m.relation.toLowerCase() === 'spouse' && member.relation.toLowerCase() === 'spouse'))
        );
        if (potentialSpouse) {
          spouseId = potentialSpouse.id;
        }
      }

      // Find children by checking if other members have this member as parent
      const children = members
        .filter(m => m.parentId === member.id)
        .map(m => m.id);

      return {
        ...member,
        generation,
        spouseId: spouseId || undefined,
        children: children.length > 0 ? children : member.children || [],
      };
    });

    return processed;
  };

  // Organize members by generation and calculate positions
  const organizeByGeneration = (members: FamilyMember[]): FamilyMember[] => {
    const generations = new Map<number, FamilyMember[]>();
    
    members.forEach(member => {
      if (!generations.has(member.generation)) {
        generations.set(member.generation, []);
      }
      generations.get(member.generation)!.push(member);
    });

    const organized: FamilyMember[] = [];
    const spacing = 200; // Horizontal spacing between members
    const generationSpacing = 250; // Vertical spacing between generations
    const startY = 150; // Starting Y position

    generations.forEach((genMembers, gen) => {
      const centerX = (window.innerWidth || 1200) / 2;
      const startX = centerX - ((genMembers.length - 1) * spacing) / 2;

      genMembers.forEach((member, index) => {
        organized.push({
          ...member,
          position: {
            x: startX + (index * spacing),
            y: startY + (gen * generationSpacing),
          },
        });
      });
    });

    return organized;
  };

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
  }, [searchQuery, familyMembers]);

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
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.family-tree-container')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate connection lines
  const generateConnections = () => {
    const connections: JSX.Element[] = [];
    
    familyMembers.forEach(member => {
      // Parent-child connections (blue)
      if (member.children) {
        member.children.forEach(childId => {
          const child = familyMembers.find(m => m.id === childId);
          if (child && member.position && child.position) {
            const parentX = member.position.x + 75;
            const parentY = member.position.y + 140;
            const childX = child.position.x + 75;
            const childY = child.position.y;
            
            const midY = parentY + (childY - parentY) / 2;
            
            connections.push(
              <g key={`parent-child-${member.id}-${childId}`}>
                {/* Glowing blue line for parent-child */}
                <line
                  x1={parentX}
                  y1={parentY}
                  x2={parentX}
                  y2={midY}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  opacity={0.8}
                />
                <line
                  x1={parentX}
                  y1={midY}
                  x2={childX}
                  y2={midY}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  opacity={0.8}
                />
                <line
                  x1={childX}
                  y1={midY}
                  x2={childX}
                  y2={childY}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                  opacity={0.8}
                />
                {/* Connection dots */}
                <circle
                  cx={parentX}
                  cy={parentY}
                  r="4"
                  fill="#3b82f6"
                  className="drop-shadow-[0_0_6px_rgba(59,130,246,1)]"
                />
                <circle
                  cx={childX}
                  cy={childY}
                  r="4"
                  fill="#3b82f6"
                  className="drop-shadow-[0_0_6px_rgba(59,130,246,1)]"
                />
              </g>
            );
          }
        });
      }

      // Marriage connections (red)
      if (member.spouseId) {
        const spouse = familyMembers.find(m => m.id === member.spouseId);
        if (spouse && member.position && spouse.position && member.id < spouse.id) {
          const x1 = member.position.x + 150;
          const y1 = member.position.y + 70;
          const x2 = spouse.position.x;
          const y2 = spouse.position.y + 70;
          
          connections.push(
            <g key={`marriage-${member.id}-${spouse.id}`}>
              {/* Glowing red line for marriage */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#ef4444"
                strokeWidth="4"
                className="drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]"
                opacity={0.9}
              />
              {/* Heart symbol */}
              <circle
                cx={(x1 + x2) / 2}
                cy={(y1 + y2) / 2}
                r="8"
                fill="#ef4444"
                className="drop-shadow-[0_0_8px_rgba(239,68,68,1)]"
              />
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 + 5}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                ♥
              </text>
            </g>
          );
        }
      }
    });
    
    return connections;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.3),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.3),transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-blue-500/20 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <TreePine className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Family Tree</h1>
                <p className="text-sm text-zinc-400">Hierarchical Visualization</p>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="ml-2 bg-zinc-800 text-zinc-300">
                {Math.round(zoomLevel * 100)}%
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Panel - Top Right */}
      {showSummary && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 right-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 shadow-2xl w-64"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-400" />
              Statistics
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSummary(false)}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Total Members</span>
              <span className="text-sm font-bold text-blue-400">{totalMembers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Generations</span>
              <span className="text-sm font-bold text-green-400">{generations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Relationships</span>
              <span className="text-sm font-bold text-purple-400">{relationships}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Marriages</span>
              <span className="text-sm font-bold text-red-400">{marriages}</span>
            </div>
          </div>
        </motion.div>
      )}

      {!showSummary && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSummary(true)}
          className="fixed top-20 right-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-blue-500/20 text-zinc-400 hover:text-white"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}

      {/* Legend - Top Left */}
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-20 left-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4 shadow-2xl w-64"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-400" />
              Legend
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLegend(false)}
              className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-blue-500 rounded-full drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-zinc-300">Parent → Child</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-red-500 rounded-full drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
              <span className="text-zinc-300">Marriage</span>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <p className="text-zinc-400 text-[10px]">
                Click members to view details • Drag to pan • Use zoom controls
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!showLegend && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowLegend(true)}
          className="fixed top-20 left-4 z-40 bg-zinc-900/90 backdrop-blur-xl border border-blue-500/20 text-zinc-400 hover:text-white"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}

      {/* Family Tree Visualization */}
      <div
        ref={containerRef}
        className="relative w-full h-[calc(100vh-80px)] overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connection Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <g
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {generateConnections()}
          </g>
        </svg>

        {/* Family Members */}
        <div
          className="absolute inset-0 family-tree-container"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            zIndex: 2,
          }}
        >
          {familyMembers.map((member) => {
            if (!member.position) return null;
            
            return (
              <motion.div
                key={member.id}
                className="absolute cursor-pointer"
                style={{
                  left: member.position.x,
                  top: member.position.y,
                }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMemberClick(member)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: member.generation * 0.1 }}
              >
                <Card
                  className={`w-36 h-44 border-2 transition-all duration-200 bg-zinc-900 shadow-2xl hover:shadow-blue-500/20 ${
                    selectedMember?.id === member.id
                      ? 'border-blue-500 ring-4 ring-blue-500/30'
                      : 'border-zinc-700 hover:border-blue-400'
                  }`}
                >
                  <CardContent className="p-4 text-center h-full flex flex-col items-center justify-center">
                    {/* Photo */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3 overflow-hidden shadow-lg ring-2 ring-blue-400/50">
                      {member.photo || member.photo_url ? (
                        <img
                          src={member.photo || member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-white" />
                      )}
                    </div>
                    
                    {/* Name */}
                    <h3 className="text-sm font-bold text-white truncate w-full mb-1">
                      {member.name}
                    </h3>
                    
                    {/* Relation */}
                    <Badge
                      variant="secondary"
                      className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/50 mb-2"
                    >
                      {member.relation}
                    </Badge>
                    
                    {/* Generation Indicator */}
                    <div className="text-[10px] text-zinc-400 mt-auto">
                      Gen {member.generation + 1}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Search Results Overlay */}
        {searchQuery && filteredMembers.length > 0 && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-blue-500/20 rounded-xl shadow-2xl max-w-sm z-50">
            <div className="p-3 border-b border-zinc-800">
              <h3 className="font-semibold text-white">Search Results</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800 last:border-b-0"
                  onClick={() => {
                    handleMemberClick(member);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-sm text-zinc-400">{member.relation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-blue-500/20 rounded-xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 text-zinc-400 hover:text-white"
                  onClick={() => setSelectedMember(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden ring-4 ring-blue-500/30">
                    {selectedMember.photo || selectedMember.photo_url ? (
                      <img
                        src={selectedMember.photo || selectedMember.photo_url}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedMember.name}
                    </h2>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                      {selectedMember.relation}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-400">Email</p>
                      <p className="text-sm text-white">{selectedMember.email}</p>
                    </div>
                  </div>
                  
                  {selectedMember.phone && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-400">Phone</p>
                        <p className="text-sm text-white">{selectedMember.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    <Users className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-400">Generation</p>
                      <p className="text-sm text-white">
                        {selectedMember.generation === 0 ? 'Grandparents' : 
                         selectedMember.generation === 1 ? 'Parents' : 
                         selectedMember.generation === 2 ? 'Children' : 
                         `Generation ${selectedMember.generation + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
