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
  Zap,
  Target,
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
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
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
  const [photoPreview, setPhotoPreview] = useState<{
    isOpen: boolean;
    photo: string;
    memberName: string;
  }>({
    isOpen: false,
    photo: '',
    memberName: '',
  });
  const [photoGallery, setPhotoGallery] = useState<{
    isOpen: boolean;
    photos: Array<{
      id: string;
      name: string;
      photo: string;
      relation: string;
    }>;
  }>({
    isOpen: false,
    photos: [],
  });
  const [showConnectionLegend, setShowConnectionLegend] = useState(false);

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

    // Calculate positions for top-down tree with better spacing
    const nodes: TreeNode[] = [];
    const sortedGenerations = Array.from(generations.keys()).sort(
      (a, b) => a - b
    );

    // Calculate total content dimensions
    const maxMembersInGeneration = Math.max(...Array.from(generations.values()).map(g => g.length));
    const totalWidth = maxMembersInGeneration * 320; // Increased spacing
    const totalHeight = sortedGenerations.length * 250; // Increased vertical spacing
    
    // Center the tree in the available space
    const containerWidth = Math.max(2000, window.innerWidth * 2);
    const containerHeight = Math.max(1500, window.innerHeight * 2);
    const offsetX = (containerWidth - totalWidth) / 2;
    const offsetY = (containerHeight - totalHeight) / 2 + 100; // Add top margin

    sortedGenerations.forEach((gen, genIndex) => {
      const genMembers = generations.get(gen)!;
      const genWidth = genMembers.length * 320;
      const startX = offsetX + (totalWidth - genWidth) / 2;

      genMembers.forEach((member, memberIndex) => {
        const x = startX + memberIndex * 320;
        const y = offsetY + genIndex * 250;

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

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    if (members.length === 0) return;
    
    // Calculate bounds of all family members
    const positions = members.map(m => m.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const contentWidth = maxX - minX + 280; // Add card width
    const contentHeight = maxY - minY + 180; // Add card height
    
    const containerWidth = window.innerWidth - 100; // Account for padding
    const containerHeight = window.innerHeight - 200; // Account for toolbar and status bar
    
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    setZoomLevel(newZoom);
    setPanOffset({
      x: (containerWidth - contentWidth * newZoom) / 2 / newZoom,
      y: (containerHeight - contentHeight * newZoom) / 2 / newZoom,
    });
  };

  // Add mouse wheel zoom functionality
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '0':
            e.preventDefault();
            handleResetView();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoom(0.1);
            break;
          case '-':
            e.preventDefault();
            handleZoom(-0.1);
            break;
          case 'f':
            e.preventDefault();
            handleFitToScreen();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [members]);

  const handleExport = (format: "pdf" | "png" | "json") => {
    // Implementation for export functionality
    console.log(`Exporting as ${format}`);
  };

  const handlePhotoUpload = (memberId: string, file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    // Show loading state
    showNotification('Uploading photo...', 'info');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
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
        showNotification('Photo uploaded successfully!', 'success');
      } catch (error) {
        console.error('Error uploading photo:', error);
        showNotification('Failed to upload photo', 'error');
      }
    };

    reader.onerror = () => {
      showNotification('Failed to read image file', 'error');
    };

    reader.readAsDataURL(file);
  };

  // Notification helper function
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : type === 'error'
        ? 'bg-red-500 text-white'
        : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('translate-x-0'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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

  // Helper function to determine relationship type and get connection style
  const getConnectionStyle = (member1: FamilyMember, member2: FamilyMember) => {
    const relation1 = member1.relation.toLowerCase();
    const relation2 = member2.relation.toLowerCase();
    
    // Parent-Child relationships
    if ((relation1.includes('father') || relation1.includes('mother')) && 
        (relation2.includes('son') || relation2.includes('daughter') || relation2.includes('child'))) {
      return {
        type: 'parent-child',
        color: '#10b981', // Green
        strokeWidth: 3,
        dashArray: 'none',
        glowColor: 'rgba(16, 185, 129, 0.4)'
      };
    }
    
    // Grandparent-Grandchild relationships
    if ((relation1.includes('grand') && (relation1.includes('father') || relation1.includes('mother'))) && 
        relation2.includes('grandchild')) {
      return {
        type: 'grandparent-grandchild',
        color: '#8b5cf6', // Purple
        strokeWidth: 2.5,
        dashArray: '8,4',
        glowColor: 'rgba(139, 92, 246, 0.4)'
      };
    }
    
    // Spouse relationships
    if ((relation1.includes('husband') || relation1.includes('wife') || relation1.includes('spouse')) ||
        (relation2.includes('husband') || relation2.includes('wife') || relation2.includes('spouse'))) {
      return {
        type: 'spouse',
        color: '#ec4899', // Pink
        strokeWidth: 4,
        dashArray: '12,6',
        glowColor: 'rgba(236, 72, 153, 0.4)'
      };
    }
    
    // Sibling relationships
    if ((relation1.includes('brother') || relation1.includes('sister')) && 
        (relation2.includes('brother') || relation2.includes('sister'))) {
      return {
        type: 'sibling',
        color: '#f59e0b', // Amber
        strokeWidth: 2.5,
        dashArray: '6,3,2,3',
        glowColor: 'rgba(245, 158, 11, 0.4)'
      };
    }
    
    // Uncle/Aunt - Nephew/Niece relationships
    if ((relation1.includes('uncle') || relation1.includes('aunt')) && 
        (relation2.includes('nephew') || relation2.includes('niece'))) {
      return {
        type: 'uncle-nephew',
        color: '#06b6d4', // Cyan
        strokeWidth: 2,
        dashArray: '4,2',
        glowColor: 'rgba(6, 182, 212, 0.4)'
      };
    }
    
    // Cousin relationships
    if (relation1.includes('cousin') && relation2.includes('cousin')) {
      return {
        type: 'cousin',
        color: '#84cc16', // Lime
        strokeWidth: 2,
        dashArray: '3,3',
        glowColor: 'rgba(132, 204, 22, 0.4)'
      };
    }
    
    // Default relationship
    return {
      type: 'family',
      color: '#6b7280', // Gray
      strokeWidth: 2,
      dashArray: 'none',
      glowColor: 'rgba(107, 114, 128, 0.3)'
    };
  };

  // Enhanced connection rendering with laser-type effects
  const renderConnections = () => {
    if (!showConnections) return null;

    const connections: JSX.Element[] = [];
    const processedPairs = new Set<string>();

    // Create connections based on actual relationships
    members.forEach((member1) => {
      members.forEach((member2) => {
        if (member1.id === member2.id || !member1.isVisible || !member2.isVisible) return;
        
        // Create unique pair identifier to avoid duplicate connections
        const pairId = [member1.id, member2.id].sort().join('-');
        if (processedPairs.has(pairId)) return;
        
        // Check if there should be a connection based on relationships
        const shouldConnect = shouldMembersConnect(member1, member2);
        if (!shouldConnect) return;
        
        processedPairs.add(pairId);
        
        const connectionStyle = getConnectionStyle(member1, member2);
        const connectionId = `connection-${member1.id}-${member2.id}`;
        
        // Calculate connection points
        const startX = member1.position.x + 140; // Center of card
        const startY = member1.position.y + 90;  // Middle of card
        const endX = member2.position.x + 140;
        const endY = member2.position.y + 90;
        
        // Calculate control points for smooth curves
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const controlOffset = Math.abs(startX - endX) * 0.3;
        
        // Create curved path
        const pathData = `M ${startX} ${startY} Q ${midX} ${midY - controlOffset} ${endX} ${endY}`;
        
        connections.push(
          <g key={connectionId}>
            {/* Glow effect */}
            <motion.path
              d={pathData}
              stroke={connectionStyle.glowColor}
              strokeWidth={connectionStyle.strokeWidth + 4}
              fill="none"
              filter="blur(3px)"
              opacity={0.6}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: Math.random() * 0.5 }}
            />
            
            {/* Main connection line */}
            <motion.path
              d={pathData}
              stroke={connectionStyle.color}
              strokeWidth={connectionStyle.strokeWidth}
              strokeDasharray={connectionStyle.dashArray}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: Math.random() * 0.5 }}
              style={{
                filter: `drop-shadow(0 0 4px ${connectionStyle.glowColor})`
              }}
            />
            
            {/* Animated pulse effect */}
            <motion.circle
              r="3"
              fill={connectionStyle.color}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                r: [2, 4, 2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href={`#${connectionId}-path`} />
              </animateMotion>
            </motion.circle>
            
            {/* Hidden path for animation */}
            <path id={`${connectionId}-path`} d={pathData} fill="none" opacity="0" />
            
            {/* Connection joints at endpoints */}
            <motion.circle
              cx={startX}
              cy={startY}
              r="4"
              fill={connectionStyle.color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{
                filter: `drop-shadow(0 0 6px ${connectionStyle.glowColor})`
              }}
            />
            <motion.circle
              cx={endX}
              cy={endY}
              r="4"
              fill={connectionStyle.color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{
                filter: `drop-shadow(0 0 6px ${connectionStyle.glowColor})`
              }}
            />
          </g>
        );
      });
    });

    return connections;
  };

  // Helper function to determine if two members should be connected
  const shouldMembersConnect = (member1: FamilyMember, member2: FamilyMember): boolean => {
    const relation1 = member1.relation.toLowerCase();
    const relation2 = member2.relation.toLowerCase();
    
    // Parent-Child connections
    if ((relation1.includes('father') || relation1.includes('mother')) && 
        (relation2.includes('son') || relation2.includes('daughter') || relation2.includes('child'))) {
      return true;
    }
    
    // Reverse parent-child
    if ((relation2.includes('father') || relation2.includes('mother')) && 
        (relation1.includes('son') || relation1.includes('daughter') || relation1.includes('child'))) {
      return true;
    }
    
    // Spouse connections
    if ((relation1.includes('husband') && relation2.includes('wife')) ||
        (relation1.includes('wife') && relation2.includes('husband')) ||
        (relation1.includes('spouse') || relation2.includes('spouse'))) {
      return true;
    }
    
    // Sibling connections (same generation, similar relations)
    if ((relation1.includes('brother') || relation1.includes('sister')) && 
        (relation2.includes('brother') || relation2.includes('sister')) &&
        member1.generation === member2.generation) {
      return true;
    }
    
    // Grandparent-Grandchild connections
    if ((relation1.includes('grand') && (relation1.includes('father') || relation1.includes('mother'))) && 
        relation2.includes('grandchild')) {
      return true;
    }
    
    // Uncle/Aunt - Nephew/Niece connections
    if ((relation1.includes('uncle') || relation1.includes('aunt')) && 
        (relation2.includes('nephew') || relation2.includes('niece'))) {
      return true;
    }
    
    // Cousin connections
    if (relation1.includes('cousin') && relation2.includes('cousin') &&
        Math.abs(member1.generation - member2.generation) <= 1) {
      return true;
    }
    
    return false;
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
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <div 
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white/30 shadow-lg cursor-pointer"
                  onClick={(e) => {
                    if (member.photo) {
                      e.stopPropagation();
                      setPhotoPreview({
                        isOpen: true,
                        photo: member.photo,
                        memberName: member.name,
                      });
                    }
                  }}
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Photo Upload Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                      <Camera className="w-5 h-5 text-white mx-auto mb-1" />
                      <span className="text-xs text-white font-medium">
                        {member.photo ? 'Change' : 'Add Photo'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(member.id, file);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title={member.photo ? 'Change photo' : 'Add photo'}
                  />
                </div>
                
                {/* Photo Upload Button - Always Visible */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handlePhotoUpload(member.id, file);
                    };
                    input.click();
                  }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors"
                  title={member.photo ? 'Change photo' : 'Add photo'}
                >
                  <Camera className="w-3 h-3 text-white" />
                </motion.button>
                
                {/* Remove Photo Button - Only show if photo exists */}
                {member.photo && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedMembers = members.map((m) =>
                        m.id === member.id
                          ? {
                              ...m,
                              photo: undefined,
                              updatedAt: new Date().toISOString(),
                            }
                          : m
                      );
                      setMembers(updatedMembers);
                      saveToHistory(updatedMembers);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3 text-white" />
                  </motion.button>
                )}
              </div>
              
              {/* Photo Upload Instructions */}
              <div className="mt-2 text-center">
                <p className="text-xs text-white/80 font-medium">
                  {member.photo ? 'Click photo to view • Click + to change' : 'Click + to add photo'}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Max 5MB • JPG, PNG, GIF
                </p>
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

          {/* Enhanced Connection Points */}
          {showConnections && (
            <>
              {/* Top connection point - for parent connections */}
              <motion.div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669)',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 12px rgba(16, 185, 129, 0.6)',
                    '0 0 20px rgba(16, 185, 129, 0.8)',
                    '0 0 12px rgba(16, 185, 129, 0.6)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </motion.div>

              {/* Bottom connection point - for child connections */}
              <motion.div 
                className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                  boxShadow: '0 0 12px rgba(59, 130, 246, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 12px rgba(59, 130, 246, 0.6)',
                    '0 0 20px rgba(59, 130, 246, 0.8)',
                    '0 0 12px rgba(59, 130, 246, 0.6)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </motion.div>

              {/* Left connection point - for sibling/spouse connections */}
              <motion.div 
                className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #ec4899, #be185d)',
                  boxShadow: '0 0 12px rgba(236, 72, 153, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 12px rgba(236, 72, 153, 0.6)',
                    '0 0 20px rgba(236, 72, 153, 0.8)',
                    '0 0 12px rgba(236, 72, 153, 0.6)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </motion.div>

              {/* Right connection point - for sibling/spouse connections */}
              <motion.div 
                className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 rounded-full border-3 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 12px rgba(245, 158, 11, 0.6)',
                    '0 0 20px rgba(245, 158, 11, 0.8)',
                    '0 0 12px rgba(245, 158, 11, 0.6)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5
                }}
              >
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </motion.div>

              {/* Center connection hub */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.8)'
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </>
          )}
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
      <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden flex items-center justify-center">
        {/* Background matching home page */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-30 dark:opacity-10">
            <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
          </div>
        </div>
        
        <motion.div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            animate={{
              textShadow: [
                "0 0 10px rgba(59, 130, 246, 0.5)",
                "0 0 20px rgba(147, 51, 234, 0.5)",
                "0 0 10px rgba(59, 130, 246, 0.5)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl font-bold text-black dark:text-white"
          >
            Loading Family Tree...
          </motion.h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Connecting your family heritage
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      {/* Global Animated Background Elements - Matching Home Page */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
        </div>

        {/* Floating Geometric Shapes */}
        {[...Array(12)].map((_, i) => {
          const initialX = Math.random() * 1200;
          const initialY = Math.random() * 800;
          const duration = Math.random() * 15 + 10;
          const delay = Math.random() * 10;

          return (
            <motion.div
              key={`bg-shape-${i}`}
              className={`absolute w-2 h-2 ${
                i % 3 === 0
                  ? "bg-blue-400/60 dark:bg-blue-400/20"
                  : i % 3 === 1
                  ? "bg-green-400/60 dark:bg-green-400/20"
                  : "bg-purple-400/60 dark:bg-purple-400/20"
              } ${i % 2 === 0 ? "rounded-full" : "rotate-45"}`}
              initial={{
                x: initialX,
                y: initialY,
              }}
              animate={{
                y: [initialY, initialY - 200, initialY],
                x: [initialX, initialX + (Math.random() * 200 - 100), initialX],
                rotate: [0, 360],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          );
        })}

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => {
          const initialX = Math.random() * 1200;
          const initialY = Math.random() * 800;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * 5;
          const moveX = Math.random() * 100 - 50;

          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-blue-400/70 dark:bg-blue-400/30 rounded-full"
              initial={{
                x: initialX,
                y: initialY,
              }}
              animate={{
                y: [initialY, initialY - 100, initialY],
                x: [initialX, initialX + moveX, initialX],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
            />
          );
        })}

        {/* Gradient Orbs */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/25 to-purple-400/25 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-green-400/25 to-blue-400/25 dark:from-green-400/10 dark:to-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-r from-purple-400/35 to-pink-400/35 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.4, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
              delay: 4,
            }}
          />
        </div>

        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-40 dark:opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.4),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.4),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.4),_transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.3),_transparent_50%),radial-gradient(circle_at_80%_20%,_rgba(255,119,198,0.3),_transparent_50%),radial-gradient(circle_at_40%_40%,_rgba(120,219,255,0.3),_transparent_50%)] animate-pulse" />
        </div>
      </div>
      {/* Advanced Toolbar - Matching Home Page Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <TreePine className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
              <motion.h1
                className="text-2xl font-bold"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 15px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.3)",
                    "0 0 12px rgba(6, 182, 212, 0.5), 0 0 25px rgba(6, 182, 212, 0.3)",
                    "0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  className="text-black dark:text-white"
                  animate={{
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.3) saturate(1.2)",
                      "brightness(1.1) saturate(1.1)",
                      "brightness(1) saturate(1)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  FAMILY
                </motion.span>
                <motion.span
                  className="text-zinc-400 dark:text-zinc-600"
                  animate={{
                    filter: [
                      "brightness(1) saturate(1)",
                      "brightness(1.4) saturate(1.3)",
                      "brightness(1.2) saturate(1.2)",
                      "brightness(1) saturate(1)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  TREE
                </motion.span>
              </motion.h1>
            </div>

            {/* Search - Matching Home Page Style */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search family members, relationships, ancestors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
              />
            </div>

            {/* Filter Toggle - Matching Home Page Style */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showFilters
                  ? "bg-blue-500 dark:bg-blue-600 text-white border-blue-500 dark:border-blue-600"
                  : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-zinc-950"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </motion.button>

            {/* Quick Generation Filter - Matching Home Page Style */}
            <select
              value={filterGeneration || ""}
              onChange={(e) =>
                setFilterGeneration(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
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

            {/* Connection Legend Toggle - Matching Home Page Style */}
            <motion.button
              onClick={() => setShowConnectionLegend(!showConnectionLegend)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showConnectionLegend
                  ? "bg-purple-500 dark:bg-purple-600 text-white border-purple-500 dark:border-purple-600"
                  : "border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:border-purple-500 dark:hover:border-purple-400 bg-white dark:bg-zinc-950"
              }`}
              title="Show Connection Legend"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              Connections
            </motion.button>
          </div>

          {/* Center Section - View Controls - Matching Home Page Style */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-2">
            <motion.button
              onClick={() => setViewMode("tree")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "tree"
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
              }`}
            >
              Tree
            </motion.button>
            <motion.button
              onClick={() => setViewMode("timeline")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "timeline"
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
              }`}
            >
              Timeline
            </motion.button>
            <motion.button
              onClick={() => setViewMode("circular")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                viewMode === "circular"
                  ? "bg-blue-500 dark:bg-blue-600 text-white"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
              }`}
            >
              Circular
            </motion.button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* History Controls - Matching Home Page Style */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
              <motion.button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 text-black dark:text-white"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 text-black dark:text-white"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Zoom Controls - Matching Home Page Style */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
              <motion.button
                onClick={() => handleZoom(-0.1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Zoom Out (Ctrl + -)"
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>
              <span className="px-2 text-sm font-medium text-black dark:text-white min-w-[50px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <motion.button
                onClick={() => handleZoom(0.1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Zoom In (Ctrl + +)"
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleResetView}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Reset View (Ctrl + 0)"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleFitToScreen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Fit to Screen (Ctrl + F)"
              >
                <Target className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Toggle Controls - Matching Home Page Style */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
              <motion.button
                onClick={() => setShowConnections(!showConnections)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded transition-colors ${
                  showConnections
                    ? "bg-blue-500 dark:bg-blue-600 text-white"
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                }`}
                title="Toggle Connections"
              >
                <Move className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => setShowPhotos(!showPhotos)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded transition-colors ${
                  showPhotos 
                    ? "bg-blue-500 dark:bg-blue-600 text-white" 
                    : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                }`}
                title="Toggle Photos"
              >
                {showPhotos ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </motion.button>
              <motion.button
                onClick={() => {
                  const membersWithPhotos = members.filter(m => m.photo);
                  if (membersWithPhotos.length === 0) {
                    showNotification('No photos found in family tree', 'info');
                    return;
                  }
                  // Show photo gallery modal
                  setPhotoGallery({
                    isOpen: true,
                    photos: membersWithPhotos.map(m => ({
                      id: m.id,
                      name: m.name,
                      photo: m.photo!,
                      relation: m.relation
                    }))
                  });
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="View Photo Gallery"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Export Controls - Matching Home Page Style */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
              <motion.button
                onClick={() => handleExport("pdf")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={() => handleExport("png")}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white"
                title="Export as Image"
              >
                <Camera className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Add Member - Matching Home Page Style */}
            <motion.button
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg font-semibold"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </motion.button>
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
            className="fixed top-20 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Relation Filter */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Relation
                  </label>
                  <select
                    value={filterRelation}
                    onChange={(e) => setFilterRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
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
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
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
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Generation Color Legend */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Actions
                  </label>
                  <motion.button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterGeneration(null);
                      setFilterRelation("");
                      setFilterAge({ min: null, max: null });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-zinc-500 dark:bg-zinc-600 text-white rounded-lg hover:bg-zinc-600 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Clear All
                  </motion.button>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
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
        className={`relative w-full h-screen overflow-auto transition-all duration-300 ${
          showFilters ? "pt-40" : "pt-20"
        }`}
        onClick={() => {
          setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null });
          setSelectedMembers(new Set());
        }}
      >
        {/* Scrollable Content Container */}
        <div
          className="relative min-w-full min-h-full"
          style={{
            width: `${Math.max(2000, window.innerWidth * 2)}px`,
            height: `${Math.max(1500, window.innerHeight * 2)}px`,
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'top left',
          }}
        >
        {/* Grid Background - Matching Home Page Style */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
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
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <TreePine className="w-32 h-32 text-zinc-400 dark:text-zinc-600 mx-auto mb-8" />
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-black dark:text-white mb-4"
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(59, 130, 246, 0.5)",
                        "0 0 20px rgba(147, 51, 234, 0.5)",
                        "0 0 10px rgba(59, 130, 246, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Start Your Advanced Family Tree
                  </motion.h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg max-w-md mx-auto">
                    Add family members and create connections to build your
                    interactive family tree
                  </p>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Search className="w-32 h-32 text-zinc-400 dark:text-zinc-600 mx-auto mb-8" />
                  </motion.div>
                  <motion.h2
                    className="text-4xl font-bold text-black dark:text-white mb-4"
                    animate={{
                      textShadow: [
                        "0 0 10px rgba(59, 130, 246, 0.5)",
                        "0 0 20px rgba(147, 51, 234, 0.5)",
                        "0 0 10px rgba(59, 130, 246, 0.5)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    No Members Match Your Filters
                  </motion.h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg max-w-md mx-auto">
                    Try adjusting your search terms or filters to see more
                    family members
                  </p>
                  <motion.button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterGeneration(null);
                      setFilterRelation("");
                      setFilterAge({ min: null, max: null });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
                  >
                    Clear All Filters
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu.isOpen && contextMenu.targetMember && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onMouseLeave={() =>
              setContextMenu({ isOpen: false, x: 0, y: 0, targetMember: null })
            }
          >
            <button
              onClick={() => handleAddChild(contextMenu.targetMember!)}
              className="w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white flex items-center gap-2"
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
              className="w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white flex items-center gap-2"
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
              className="w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-white flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Details
            </button>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file && contextMenu.targetMember) {
                    handlePhotoUpload(contextMenu.targetMember.id, file);
                  }
                };
                input.click();
                setContextMenu({
                  isOpen: false,
                  x: 0,
                  y: 0,
                  targetMember: null,
                });
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {contextMenu.targetMember?.photo ? 'Change Photo' : 'Add Photo'}
            </button>
            {contextMenu.targetMember?.photo && (
              <button
                onClick={() => {
                  if (contextMenu.targetMember) {
                    const updatedMembers = members.map((m) =>
                      m.id === contextMenu.targetMember!.id
                        ? {
                            ...m,
                            photo: undefined,
                            updatedAt: new Date().toISOString(),
                          }
                        : m
                    );
                    setMembers(updatedMembers);
                    saveToHistory(updatedMembers);
                    showNotification('Photo removed successfully', 'success');
                  }
                  setContextMenu({
                    isOpen: false,
                    x: 0,
                    y: 0,
                    targetMember: null,
                  });
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Photo
              </button>
            )}
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

      {/* Status Bar - Matching Home Page Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-6 py-3 z-40">
        <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-6">
            <span>Total Members: {members.length}</span>
            <span>Visible: {filteredMembers.length}</span>
            <span>Selected: {selectedMembers.size}</span>
            <span>
              Generations: {new Set(members.map((m) => m.generation)).size}
            </span>
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Photos: {members.filter(m => m.photo).length}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Connections: {(() => {
                let count = 0;
                const processedPairs = new Set<string>();
                members.forEach((member1) => {
                  members.forEach((member2) => {
                    if (member1.id === member2.id || !member1.isVisible || !member2.isVisible) return;
                    const pairId = [member1.id, member2.id].sort().join('-');
                    if (processedPairs.has(pairId)) return;
                    if (shouldMembersConnect(member1, member2)) {
                      processedPairs.add(pairId);
                      count++;
                    }
                  });
                });
                return count;
              })()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            <span>View: {viewMode}</span>
            {isDragging && <span className="text-blue-600 dark:text-blue-400">Dragging...</span>}
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {photoPreview.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPhotoPreview({ isOpen: false, photo: '', memberName: '' })}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  {photoPreview.memberName}'s Photo
                </h3>
                <button
                  onClick={() => setPhotoPreview({ isOpen: false, photo: '', memberName: '' })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Photo */}
              <div className="p-4">
                <img
                  src={photoPreview.photo}
                  alt={photoPreview.memberName}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Click outside to close
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Download photo
                      const link = document.createElement('a');
                      link.href = photoPreview.photo;
                      link.download = `${photoPreview.memberName.replace(/\s+/g, '_')}_photo.jpg`;
                      link.click();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Gallery Modal */}
      <AnimatePresence>
        {photoGallery.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPhotoGallery({ isOpen: false, photos: [] })}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Family Photo Gallery
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {photoGallery.photos.length} photos in your family tree
                  </p>
                </div>
                <button
                  onClick={() => setPhotoGallery({ isOpen: false, photos: [] })}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Photo Grid */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photoGallery.photos.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setPhotoPreview({
                          isOpen: true,
                          photo: member.photo,
                          memberName: member.name,
                        });
                        setPhotoGallery({ isOpen: false, photos: [] });
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end">
                        <div className="p-3 text-white">
                          <h4 className="font-semibold text-sm">{member.name}</h4>
                          <p className="text-xs text-gray-200">{member.relation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {photoGallery.photos.length === 0 && (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">
                      No Photos Yet
                    </h4>
                    <p className="text-gray-500">
                      Add photos to family members to see them here
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Click on any photo to view in full size
                </div>
                <button
                  onClick={() => setPhotoGallery({ isOpen: false, photos: [] })}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close Gallery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Legend Modal */}
      <AnimatePresence>
        {showConnectionLegend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowConnectionLegend(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Connection Legend
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Understanding family relationship connections
                  </p>
                </div>
                <button
                  onClick={() => setShowConnectionLegend(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              
              {/* Legend Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-4">
                  {/* Parent-Child */}
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-green-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'}} />
                      <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Parent-Child</h4>
                      <p className="text-sm text-green-600">Solid green line connecting parents to children</p>
                    </div>
                  </div>

                  {/* Spouse */}
                  <div className="flex items-center gap-4 p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-pink-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(236, 72, 153, 0.6)', borderTop: '2px dashed rgba(236, 72, 153, 0.8)'}} />
                      <div className="w-3 h-3 bg-pink-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-800">Spouse/Marriage</h4>
                      <p className="text-sm text-pink-600">Dashed pink line connecting married couples</p>
                    </div>
                  </div>

                  {/* Grandparent-Grandchild */}
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-purple-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)', borderTop: '1px dashed rgba(139, 92, 246, 0.8)'}} />
                      <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800">Grandparent-Grandchild</h4>
                      <p className="text-sm text-purple-600">Dashed purple line across generations</p>
                    </div>
                  </div>

                  {/* Siblings */}
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-amber-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)', borderTop: '1px dotted rgba(245, 158, 11, 0.8)'}} />
                      <div className="w-3 h-3 bg-amber-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800">Siblings</h4>
                      <p className="text-sm text-amber-600">Dotted amber line connecting brothers and sisters</p>
                    </div>
                  </div>

                  {/* Uncle/Aunt - Nephew/Niece */}
                  <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-cyan-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(6, 182, 212, 0.6)'}} />
                      <div className="w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-cyan-800">Uncle/Aunt - Nephew/Niece</h4>
                      <p className="text-sm text-cyan-600">Cyan line connecting aunts/uncles to nephews/nieces</p>
                    </div>
                  </div>

                  {/* Cousins */}
                  <div className="flex items-center gap-4 p-4 bg-lime-50 rounded-lg border border-lime-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-lime-500 rounded-full shadow-lg" style={{boxShadow: '0 0 8px rgba(132, 204, 22, 0.6)'}} />
                      <div className="w-3 h-3 bg-lime-500 rounded-full border-2 border-white shadow-lg" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lime-800">Cousins</h4>
                      <p className="text-sm text-lime-600">Lime green line connecting cousin relationships</p>
                    </div>
                  </div>
                </div>

                {/* Special Effects Info */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Special Effects
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Glow Effects:</strong> Each connection has a subtle glow matching its color</li>
                    <li>• <strong>Animated Pulses:</strong> Moving dots travel along connection lines</li>
                    <li>• <strong>Connection Joints:</strong> Glowing connection points on each family member card</li>
                    <li>• <strong>Curved Paths:</strong> Smooth bezier curves for natural-looking connections</li>
                  </ul>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Toggle connections visibility using the eye icon in the toolbar
                </div>
                <button
                  onClick={() => setShowConnectionLegend(false)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
