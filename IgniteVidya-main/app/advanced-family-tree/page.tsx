"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useDragControls,
  PanInfo,
} from "framer-motion";
import {
  Users,
  UserPlus,
  Crown,
  Heart,
  Baby,
  User,
  Edit3,
  Trash2,
  Save,
  X,
  Plus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  Settings,
  Move,
  Grip,
  Eye,
  EyeOff,
  Camera,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Copy,
  Scissors,
  Clipboard,
  Undo,
  Redo,
  TreePine,
  Sparkles,
  Star,
  Award,
  Shield,
} from "lucide-react";
import { useFamilyContext } from "@/contexts/FamilyContext";

// Import the base type from context
type BaseFamilyMember = {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  addedAt: string;
};

// Advanced Types - Extended FamilyMember for this component
interface FamilyMember extends BaseFamilyMember {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  occupation?: string;
  photo?: string;
  notes?: string;
  customFields: Record<string, any>;
  position: { x: number; y: number };
  generation: number;
  parentIds: string[];
  childrenIds: string[];
  spouseIds: string[];
  isVisible: boolean;
  color?: string;
  role?: "admin" | "editor" | "viewer";
  createdAt: string;
  updatedAt: string;
}

interface TreeNode {
  member: FamilyMember;
  children: TreeNode[];
  level: number;
  x: number;
  y: number;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetMember: FamilyMember | null;
}

interface EditingState {
  memberId: string | null;
  field: string | null;
  value: string;
}

interface HistoryState {
  members: FamilyMember[];
  timestamp: number;
}

export default function AdvancedFamilyTreePage() {
  // Core State
  const {
    members: contextMembers,
    loading,
    refreshMembers,
  } = useFamilyContext();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [editingState, setEditingState] = useState<EditingState>({
    memberId: null,
    field: null,
    value: "",
  });

  // UI State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"tree" | "timeline" | "circular">(
    "tree"
  );
  const [showConnections, setShowConnections] = useState(true);
  const [showPhotos, setShowPhotos] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGeneration, setFilterGeneration] = useState<number | null>(null);
  const [filterRelation, setFilterRelation] = useState<string>("");
  const [filterAge, setFilterAge] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });
  const [showFilters, setShowFilters] = useState(false);

  // Interaction State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetMember: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
  });

  // History State
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize
  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    if (contextMembers.length > 0) {
      const enhancedMembers: FamilyMember[] = contextMembers.map(
        (member, index) => ({
          ...member,
          firstName: member.name?.split(" ")[0] || "",
          lastName: member.name?.split(" ").slice(1).join(" ") || "",
          generation: calculateGeneration(member.relation),
          position: calculateInitialPosition(index), // Always calculate since base type doesn't have position
          parentIds: [],
          childrenIds: [],
          spouseIds: [],
          isVisible: true,
          customFields: {},
          role: "viewer" as const,
          createdAt: member.addedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
      setMembers(enhancedMembers);
      buildTreeStructure(enhancedMembers);
      saveToHistory(enhancedMembers);
    }
  }, [contextMembers]);

  // Helper Functions
  const calculateGeneration = (relation: string): number => {
    const rel = relation.toLowerCase();
    if (rel.includes("great-great-grand")) return 0;
    if (rel.includes("great-grand")) return 1;
    if (rel.includes("grand")) return 2;
    if (
      rel.includes("parent") ||
      rel.includes("father") ||
      rel.includes("mother")
    )
      return 3;
    if (rel === "self" || rel.includes("spouse") || rel.includes("partner"))
      return 4;
    if (
      rel.includes("child") ||
      rel.includes("son") ||
      rel.includes("daughter")
    )
      return 5;
    if (rel.includes("grandchild")) return 6;
    if (rel.includes("great-grandchild")) return 7;
    return 4; // Default to self generation
  };

  const calculateInitialPosition = (index: number) => {
    const cols = 4;
    const spacing = 300;
    return {
      x: (index % cols) * spacing + 200,
      y: Math.floor(index / cols) * 200 + 150,
    };
  };

  const buildTreeStructure = (members: FamilyMember[]) => {
    // Group by generation
    const generations = new Map<number, FamilyMember[]>();
    members.forEach((member) => {
      if (!generations.has(member.generation)) {
        generations.set(member.generation, []);
      }
      generations.get(member.generation)!.push(member);
    });

    // Calculate positions for top-down tree
    const nodes: TreeNode[] = [];
    const sortedGenerations = Array.from(generations.keys()).sort(
      (a, b) => a - b
    );

    sortedGenerations.forEach((gen, genIndex) => {
      const genMembers = generations.get(gen)!;
      const genWidth = genMembers.length * 280;
      const startX = (window.innerWidth - genWidth) / 2;

      genMembers.forEach((member, memberIndex) => {
        const x = startX + memberIndex * 280;
        const y = genIndex * 200 + 100;

        // Update member position
        member.position = { x, y };

        nodes.push({
          member,
          children: [], // Will be populated based on relationships
          level: genIndex,
          x,
          y,
        });
      });
    });

    setTreeNodes(nodes);
  };

  const saveToHistory = (newMembers: FamilyMember[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      members: JSON.parse(JSON.stringify(newMembers)),
      timestamp: Date.now(),
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Event Handlers
  const handleNodeDoubleClick = (member: FamilyMember, field: string) => {
    setEditingState({
      memberId: member.id,
      field,
      value: (member as any)[field] || "",
    });
  };

  const handleEditSave = () => {
    if (!editingState.memberId || !editingState.field) return;

    const updatedMembers = members.map((member) =>
      member.id === editingState.memberId
        ? {
            ...member,
            [editingState.field!]: editingState.value,
            updatedAt: new Date().toISOString(),
          }
        : member
    );

    setMembers(updatedMembers);
    saveToHistory(updatedMembers);
    setEditingState({ memberId: null, field: null, value: "" });
  };

  const handleEditCancel = () => {
    setEditingState({ memberId: null, field: null, value: "" });
  };

  const handleContextMenu = (e: React.MouseEvent, member: FamilyMember) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      targetMember: member,
    });
  };

  const handleAddChild = (parentMember: FamilyMember) => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name: "New Child",
      relation: "Child",
      email: "",
      addedAt: new Date().toISOString(),
      position: {
        x: parentMember.position.x,
        y: parentMember.position.y + 200,
      },
      generation: parentMember.generation + 1,
      parentIds: [parentMember.id],
      childrenIds: [],
      spouseIds: [],
      isVisible: true,
      customFields: {},
      role: "viewer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedMembers = [...members, newMember].map((member) =>
      member.id === parentMember.id
        ? { ...member, childrenIds: [...member.childrenIds, newMember.id] }
        : member
    );

    setMembers(updatedMembers);
    buildTreeStructure(updatedMembers);
    saveToHistory(updatedMembers);
    setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null });
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm("Are you sure you want to delete this family member?")) {
      const updatedMembers = members.filter((member) => member.id !== memberId);
      setMembers(updatedMembers);
      buildTreeStructure(updatedMembers);
      saveToHistory(updatedMembers);
    }
    setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null });
  };

  const handleDragEnd = (memberId: string, info: PanInfo) => {
    const updatedMembers = members.map((member) =>
      member.id === memberId
        ? {
            ...member,
            position: {
              x: member.position.x + info.offset.x / zoomLevel,
              y: member.position.y + info.offset.y / zoomLevel,
            },
            updatedAt: new Date().toISOString(),
          }
        : member
    );

    setMembers(updatedMembers);
    saveToHistory(updatedMembers);
    setDraggedMember(null);
    setIsDragging(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousState = history[historyIndex - 1];
      setMembers(previousState.members);
      buildTreeStructure(previousState.members);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setMembers(nextState.members);
      buildTreeStructure(nextState.members);
    }
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + delta)));
  };

  const handleExport = (format: "pdf" | "png" | "json") => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`);
  };

  const handlePhotoUpload = (memberId: string, file: File) => {
    // Implementation for photo upload
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedMembers = members.map((member) =>
        member.id === memberId
          ? {
              ...member,
              photo: e.target?.result as string,
              updatedAt: new Date().toISOString(),
            }
          : member
      );
      setMembers(updatedMembers);
      saveToHistory(updatedMembers);
    };
    reader.readAsDataURL(file);
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      !searchQuery ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.relation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.occupation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.birthPlace?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGeneration =
      filterGeneration === null || member.generation === filterGeneration;

    const matchesRelation =
      !filterRelation ||
      member.relation.toLowerCase().includes(filterRelation.toLowerCase());

    const matchesAge = (() => {
      if (!member.birthDate)
        return filterAge.min === null && filterAge.max === null;
      const age =
        new Date().getFullYear() - new Date(member.birthDate).getFullYear();
      const minMatch = filterAge.min === null || age >= filterAge.min;
      const maxMatch = filterAge.max === null || age <= filterAge.max;
      return minMatch && maxMatch;
    })();

    return (
      matchesSearch &&
      matchesGeneration &&
      matchesRelation &&
      matchesAge &&
      member.isVisible
    );
  });

  // Render Connection Lines
  const renderConnections = () => {
    if (!showConnections) return null;

    const connections: JSX.Element[] = [];

    members.forEach((member) => {
      // Parent-child connections
      member.childrenIds.forEach((childId) => {
        const child = members.find((m) => m.id === childId);
        if (child && member.isVisible && child.isVisible) {
          const startX = member.position.x + 140;
          const startY = member.position.y + 180;
          const endX = child.position.x + 140;
          const endY = child.position.y + 20;

          connections.push(
            <motion.path
              key={`parent-${member.id}-${childId}`}
              d={`M ${startX} ${startY} Q ${startX} ${
                (startY + endY) / 2
              } ${endX} ${endY}`}
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          );
        }
      });

      // Spouse connections
      member.spouseIds.forEach((spouseId) => {
        const spouse = members.find((m) => m.id === spouseId);
        if (
          spouse &&
          member.isVisible &&
          spouse.isVisible &&
          member.id < spouseId
        ) {
          const startX = member.position.x + 280;
          const startY = member.position.y + 90;
          const endX = spouse.position.x;
          const endY = spouse.position.y + 90;

          connections.push(
            <motion.line
              key={`spouse-${member.id}-${spouseId}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke="#ec4899"
              strokeWidth="3"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          );
        }
      });
    });

    return connections;
  };

  // Render Family Member Node
  const renderFamilyNode = (member: FamilyMember) => {
    const isSelected = selectedMembers.has(member.id);
    const isEditing = editingState.memberId === member.id;
    const isDraggedNode = draggedMember === member.id;

    return (
      <motion.div
        key={member.id}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => {
          setIsDragging(true);
          setDraggedMember(member.id);
        }}
        onDragEnd={(_, info) => handleDragEnd(member.id, info)}
        initial={{
          x: member.position.x,
          y: member.position.y,
          scale: 0,
          opacity: 0,
        }}
        animate={{
          x: member.position.x,
          y: member.position.y,
          scale: isDraggedNode ? 1.1 : 1,
          opacity: 1,
        }}
        whileHover={{ scale: 1.05, y: member.position.y - 5 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={`absolute cursor-grab active:cursor-grabbing ${
          isDraggedNode ? "z-50" : "z-10"
        } ${isSelected ? "ring-4 ring-blue-500" : ""}`}
        style={{ width: "280px" }}
        onContextMenu={(e) => handleContextMenu(e, member)}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            const newSelected = new Set(selectedMembers);
            if (newSelected.has(member.id)) {
              newSelected.delete(member.id);
            } else {
              newSelected.add(member.id);
            }
            setSelectedMembers(newSelected);
          } else {
            setSelectedMembers(new Set([member.id]));
          }
        }}
      >
        {/* Node Card */}
        <motion.div
          className={`relative bg-gradient-to-br ${getGenerationColor(
            member.generation
          )} p-6 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm`}
          style={{
            boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 20px ${getGenerationShadowColor(
              member.generation
            )}`,
          }}
          whileHover={{
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 30px ${getGenerationShadowColor(
              member.generation
            )}`,
            borderColor: "rgba(255, 255, 255, 0.5)",
            scale: 1.02,
          }}
        >
          {/* Generation Badge */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-sm font-bold text-gray-700">
            {member.generation}
          </div>

          {/* Role Badge */}
          {member.role === "admin" && (
            <div className="absolute -top-2 -right-2">
              <Crown className="w-6 h-6 text-yellow-500" />
            </div>
          )}

          {/* Photo Section */}
          {showPhotos && (
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(member.id, file);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Name Section */}
          <div className="text-center mb-4">
            {isEditing && editingState.field === "name" ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editingState.value}
                  onChange={(e) =>
                    setEditingState({ ...editingState, value: e.target.value })
                  }
                  className="flex-1 px-2 py-1 rounded bg-white/20 text-white placeholder-white/70"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave();
                    if (e.key === "Escape") handleEditCancel();
                  }}
                  autoFocus
                />
                <button
                  onClick={handleEditSave}
                  className="p-1 bg-green-500 rounded"
                >
                  <Save className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 bg-red-500 rounded"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <h3
                className="text-lg font-bold text-white cursor-pointer hover:bg-white/10 rounded px-2 py-1"
                onDoubleClick={() => handleNodeDoubleClick(member, "name")}
              >
                {member.name || "Unknown"}
              </h3>
            )}

            {isEditing && editingState.field === "relation" ? (
              <div className="flex gap-2 mt-2">
                <select
                  value={editingState.value}
                  onChange={(e) =>
                    setEditingState({ ...editingState, value: e.target.value })
                  }
                  className="flex-1 px-2 py-1 rounded bg-white/20 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditSave();
                    if (e.key === "Escape") handleEditCancel();
                  }}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Cousin">Cousin</option>
                </select>
                <button
                  onClick={handleEditSave}
                  className="p-1 bg-green-500 rounded"
                >
                  <Save className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="p-1 bg-red-500 rounded"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <p
                className="text-white/80 text-sm cursor-pointer hover:bg-white/10 rounded px-2 py-1"
                onDoubleClick={() => handleNodeDoubleClick(member, "relation")}
              >
                {member.relation || "Unknown"}
              </p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span
                className="truncate cursor-pointer hover:bg-white/10 rounded px-1"
                onDoubleClick={() => handleNodeDoubleClick(member, "email")}
              >
                {member.email || "No email"}
              </span>
            </div>
            {member.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <span
                  className="cursor-pointer hover:bg-white/10 rounded px-1"
                  onDoubleClick={() => handleNodeDoubleClick(member, "phone")}
                >
                  {member.phone}
                </span>
              </div>
            )}
            {member.birthDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{new Date(member.birthDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Drag Handle */}
          <div className="absolute top-2 right-2">
            <Grip className="w-4 h-4 text-white/50" />
          </div>

          {/* Connection Points */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
          <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
        </motion.div>
      </motion.div>
    );
  };

  const getGenerationColor = (generation: number) => {
    const colors = [
      "from-purple-500 to-purple-700", // Great-great-grandparents
      "from-indigo-500 to-indigo-700", // Great-grandparents
      "from-blue-500 to-blue-700", // Grandparents
      "from-green-500 to-green-700", // Parents
      "from-yellow-500 to-yellow-700", // Self/Spouse
      "from-orange-500 to-orange-700", // Children
      "from-red-500 to-red-700", // Grandchildren
      "from-pink-500 to-pink-700", // Great-grandchildren
    ];
    return colors[generation] || "from-gray-500 to-gray-700";
  };

  const getGenerationShadowColor = (generation: number) => {
    const colors = [
      "rgba(147, 51, 234, 0.4)", // Purple
      "rgba(99, 102, 241, 0.4)", // Indigo
      "rgba(59, 130, 246, 0.4)", // Blue
      "rgba(34, 197, 94, 0.4)", // Green
      "rgba(234, 179, 8, 0.4)", // Yellow
      "rgba(249, 115, 22, 0.4)", // Orange
      "rgba(239, 68, 68, 0.4)", // Red
      "rgba(236, 72, 153, 0.4)", // Pink
    ];
    return colors[generation] || "rgba(107, 114, 128, 0.4)";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 overflow-hidden">
      {/* Advanced Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TreePine className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Advanced Family Tree
              </h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, relation, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-gray-300 hover:border-blue-500"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Quick Generation Filter */}
            <select
              value={filterGeneration || ""}
              onChange={(e) =>
                setFilterGeneration(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="">All Generations</option>
              {Array.from(new Set(members.map((m) => m.generation)))
                .sort()
                .map((gen) => (
                  <option key={gen} value={gen}>
                    Generation {gen}
                  </option>
                ))}
            </select>
          </div>

          {/* Center Section - View Controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-2">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "tree"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "timeline"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode("circular")}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "circular"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              Circular
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* History Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-2 rounded hover:bg-gray-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-sm font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-2 rounded hover:bg-gray-200"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShowConnections(!showConnections)}
                className={`p-2 rounded transition-colors ${
                  showConnections
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                }`}
                title="Toggle Connections"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPhotos(!showPhotos)}
                className={`p-2 rounded transition-colors ${
                  showPhotos ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`}
                title="Toggle Photos"
              >
                {showPhotos ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Export Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleExport("pdf")}
                className="p-2 rounded hover:bg-gray-200"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleExport("png")}
                className="p-2 rounded hover:bg-gray-200"
                title="Export as Image"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Add Member */}
            <button
              onClick={() => {
                const newMember: FamilyMember = {
                  id: `member-${Date.now()}`,
                  name: "New Member",
                  relation: "Family Member",
                  email: "",
                  addedAt: new Date().toISOString(),
                  position: { x: 400, y: 300 },
                  generation: 4,
                  parentIds: [],
                  childrenIds: [],
                  spouseIds: [],
                  isVisible: true,
                  customFields: {},
                  role: "viewer",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                const updatedMembers = [...members, newMember];
                setMembers(updatedMembers);
                buildTreeStructure(updatedMembers);
                saveToHistory(updatedMembers);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Relation Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relation
                  </label>
                  <select
                    value={filterRelation}
                    onChange={(e) => setFilterRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="">All Relations</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Cousin">Cousin</option>
                  </select>
                </div>

                {/* Age Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterAge.min || ""}
                      onChange={(e) =>
                        setFilterAge((prev) => ({
                          ...prev,
                          min: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterAge.max || ""}
                      onChange={(e) =>
                        setFilterAge((prev) => ({
                          ...prev,
                          max: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Generation Color Legend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generation Colors
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from(new Set(members.map((m) => m.generation)))
                      .sort()
                      .map((gen) => (
                        <div key={gen} className="flex items-center gap-1">
                          <div
                            className={`w-4 h-4 rounded-full bg-gradient-to-br ${getGenerationColor(
                              gen
                            )}`}
                            style={{
                              boxShadow: `0 0 8px ${getGenerationShadowColor(
                                gen
                              )}`,
                            }}
                          />
                          <span className="text-xs">{gen}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actions
                  </label>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterGeneration(null);
                      setFilterRelation("");
                      setFilterAge({ min: null, max: null });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                  <div className="text-sm text-gray-600">
                    Showing {filteredMembers.length} of {members.length} members
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas */}
      <div
        ref={containerRef}
        className={`relative w-full h-screen overflow-hidden transition-all duration-300 ${
          showFilters ? "pt-40" : "pt-20"
        }`}
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
        onClick={() => {
          setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null });
          setSelectedMembers(new Set());
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Connection Lines */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ transform: `scale(${1 / zoomLevel})` }}
        >
          {renderConnections()}
        </svg>

        {/* Family Nodes */}
        <AnimatePresence>
          {filteredMembers.map(renderFamilyNode)}
        </AnimatePresence>

        {/* Selection Box */}
        {isSelecting && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-40"
            style={{
              left: Math.min(selectionBox.start.x, selectionBox.end.x),
              top: Math.min(selectionBox.start.y, selectionBox.end.y),
              width: Math.abs(selectionBox.end.x - selectionBox.start.x),
              height: Math.abs(selectionBox.end.y - selectionBox.start.y),
            }}
          />
        )}

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              {members.length === 0 ? (
                <>
                  <TreePine className="w-32 h-32 text-gray-400 mx-auto mb-8" />
                  <h2 className="text-4xl font-bold text-gray-600 mb-4">
                    Start Your Advanced Family Tree
                  </h2>
                  <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                    Add family members and create connections to build your
                    interactive family tree
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-32 h-32 text-gray-400 mx-auto mb-8" />
                  <h2 className="text-4xl font-bold text-gray-600 mb-4">
                    No Members Match Your Filters
                  </h2>
                  <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                    Try adjusting your search terms or filters to see more
                    family members
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterGeneration(null);
                      setFilterRelation("");
                      setFilterAge({ min: null, max: null });
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.isOpen && contextMenu.targetMember && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseLeave={() =>
              setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null })
            }
          >
            <button
              onClick={() => handleAddChild(contextMenu.targetMember!)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Child
            </button>
            <button
              onClick={() => {
                // Add spouse logic
                setContextMenu({
                  isOpen: false,
                  x: 0,
                  y: 0,
                  targetMember: null,
                });
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Add Spouse
            </button>
            <button
              onClick={() => {
                // Edit member logic
                setContextMenu({
                  isOpen: false,
                  x: 0,
                  y: 0,
                  targetMember: null,
                });
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Details
            </button>
            <hr className="my-1" />
            <button
              onClick={() => handleDeleteMember(contextMenu.targetMember!.id)}
              className="w-full px-4 py-2 text-left hover:bg-red-100 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Member
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-6 py-3 z-40">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>Total Members: {members.length}</span>
            <span>Visible: {filteredMembers.length}</span>
            <span>Selected: {selectedMembers.size}</span>
            <span>
              Generations: {new Set(members.map((m) => m.generation)).size}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            <span>View: {viewMode}</span>
            {isDragging && <span className="text-blue-600">Dragging...</span>}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedMembers.size === 1) {
            const memberId = Array.from(selectedMembers)[0];
            handlePhotoUpload(memberId, file);
          }
        }}
      />
    </div>
  );
}
