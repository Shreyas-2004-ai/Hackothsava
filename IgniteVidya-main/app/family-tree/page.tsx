"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  UserPlus,
  Edit,
  Trash2,
  Save,
  MoreVertical,
  Crown,
  Shield,
  Settings,
  Link as LinkIcon,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";

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
  role?: string;
}

export default function ProfessionalFamilyTreePage() {
  const HEADER_HEIGHT = 72; // keep canvas below fixed header
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isStaticLayout, setIsStaticLayout] = useState(true);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; member: FamilyMember } | null>(null);
  const [connectMode, setConnectMode] = useState<{ sourceId: string; type: 'child' | 'spouse' } | null>(null);
  const rafPending = useRef(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedMember, setDraggedMember] = useState<string | null>(null);
  const [isCanvasDragging, setIsCanvasDragging] = useState(false);
  const [canvasDragStart, setCanvasDragStart] = useState({ x: 0, y: 0 });
  const lastMouseRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const inertiaRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [newMemberPosition, setNewMemberPosition] = useState<{ x: number; y: number } | null>(null);

  const roles = ["Admin", "Member", "Guest", "Moderator"];

  // Fetch family members
  useEffect(() => {
    fetchFamilyMembers();
    
    const interval = setInterval(() => {
      fetchFamilyMembers(false);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchFamilyMembers = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      const response = await fetch(`/api/family-members?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        let members: FamilyMember[] = result.data;
        if (isStaticLayout) {
          members = applyStaticLayout(members);
        } else {
          // Restore saved positions or random fallback for freestyle mode
          members = members.map((m: FamilyMember) => ({
            ...m,
            position: m.position || { x: Math.random() * 800 + 100, y: Math.random() * 600 + 100 },
          }));
        }
        setFamilyMembers(members);
      }
    } catch (error) {
      console.error("Error fetching family members:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Arrange by generation in a beautiful grid (static layout)
  const applyStaticLayout = (members: FamilyMember[]): FamilyMember[] => {
    // Group by generation
    const genMap = new Map<number, FamilyMember[]>();
    members.forEach(m => {
      const g = typeof m.generation === 'number' ? m.generation : 1;
      if (!genMap.has(g)) genMap.set(g, []);
      genMap.get(g)!.push(m);
    });

    // Sort each generation alphabetically to keep structure predictable
    for (const [g, arr] of genMap.entries()) {
      arr.sort((a,b) => a.name.localeCompare(b.name));
      genMap.set(g, arr);
    }

    const spacingX = 220;
    const spacingY = 220;
    const startY = 60; // inside canvas (pre-transform)

    // Determine max generation to center vertically a bit if needed (we use pan fit later)
    const laid: FamilyMember[] = [];
    const gens = Array.from(genMap.keys()).sort((a,b) => a-b);
    gens.forEach((g) => {
      const row = genMap.get(g)!;
      const rowWidth = (row.length - 1) * spacingX;
      const startX = -rowWidth / 2; // centered around x=0; fit will center canvas later
      row.forEach((m, i) => {
        laid.push({
          ...m,
          position: { x: startX + i * spacingX, y: startY + g * spacingY },
        });
      });
    });
    return laid;
  };

  // Handle canvas click to add member
  const handleCanvasClick = (e: React.MouseEvent) => {
    // avoid click-to-add when we were dragging/panning or connecting
    if (isCanvasDragging || connectMode) return;
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('.whiteboard-canvas')) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - panOffset.x) / zoomLevel;
        const y = (e.clientY - rect.top - panOffset.y) / zoomLevel;
        setNewMemberPosition({ x, y });
        setShowAddModal(true);
      }
    }
  };

  // Handle member drag
  const handleMemberDragStart = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedMember(memberId);
    const member = familyMembers.find(m => m.id === memberId);
    if (member && member.position && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - (member.position.x * zoomLevel + panOffset.x),
        y: e.clientY - (member.position.y * zoomLevel + panOffset.y),
      });
    }
  };

  const handleMemberDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedMember || !canvasRef.current) return;

    // Smooth drag (throttled by requestAnimationFrame)
    if (rafPending.current) return;
    rafPending.current = true;

    const doUpdate = () => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const newX = (e.clientX - rect.left - panOffset.x - dragStart.x) / zoomLevel;
      const newY = (e.clientY - rect.top - panOffset.y - dragStart.y) / zoomLevel;

      setFamilyMembers(prev => prev.map(m =>
        m.id === draggedMember
          ? { ...m, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : m
      ));
      rafPending.current = false;
    };
    requestAnimationFrame(doUpdate);
  }, [isDragging, draggedMember, zoomLevel, panOffset, dragStart]);

  const handleMemberDragEnd = useCallback(async () => {
    if (draggedMember) {
      const member = familyMembers.find(m => m.id === draggedMember);
      if (member && member.position) {
        // Save position to database
        await updateMemberPosition(draggedMember, member.position);
      }
    }
    setIsDragging(false);
    setDraggedMember(null);
  }, [draggedMember, familyMembers]);

  // Update member position in database
  const updateMemberPosition = async (memberId: string, position: { x: number; y: number }) => {
    try {
      await fetch('/api/update-member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, position }),
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  // Handle right-click context menu
  const handleRightClick = (e: React.MouseEvent, member: FamilyMember) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, member });
  };

  // Delete member
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const response = await fetch(`/api/delete-member?id=${memberId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success('Member deleted successfully');
        setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
        setContextMenu(null);
        setSelectedMember(null);
      } else {
        toast.error(result.message || 'Failed to delete member');
      }
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  // Save edited member
  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    try {
      const response = await fetch('/api/update-member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMember),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Member updated successfully');
        setFamilyMembers(prev => prev.map(m => 
          m.id === editingMember.id ? editingMember : m
        ));
        setEditingMember(null);
      } else {
        toast.error(result.message || 'Failed to update member');
      }
    } catch (error) {
      toast.error('Failed to update member');
    }
  };

  // Canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Left or middle mouse starts panning (and right as well for convenience)
    if ((e.button === 0 || e.button === 1 || e.button === 2) && !draggedMember) {
      setIsCanvasDragging(true);
      setCanvasDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      lastMouseRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      // cancel any existing inertia
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current);
        inertiaRef.current = null;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isCanvasDragging) {
      setPanOffset({
        x: e.clientX - canvasDragStart.x,
        y: e.clientY - canvasDragStart.y,
      });
      // track velocity for inertia
      const now = performance.now();
      const last = lastMouseRef.current;
      if (last) {
        const dt = Math.max(1, now - last.t);
        velocityRef.current = {
          vx: (e.clientX - last.x) / dt,
          vy: (e.clientY - last.y) / dt,
        };
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY, t: now };
    }
    if (isDragging && draggedMember) {
      handleMemberDrag(e);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsCanvasDragging(false);
    if (isDragging) {
      handleMemberDragEnd();
    }
    // apply inertia (ease-out) to panning
    const friction = 0.94;
    const step = () => {
      const { vx, vy } = velocityRef.current;
      // stop when velocity is small
      if (Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
        inertiaRef.current = null;
        return;
      }
      setPanOffset(prev => ({ x: prev.x + vx * 16, y: prev.y + vy * 16 }));
      velocityRef.current = { vx: vx * friction, vy: vy * friction };
      inertiaRef.current = requestAnimationFrame(step);
    };
    // start if we had any velocity
    if (Math.abs(velocityRef.current.vx) > 0.01 || Math.abs(velocityRef.current.vy) > 0.01) {
      inertiaRef.current = requestAnimationFrame(step);
    }
  };

  // Wheel zoom centered on cursor
  const handleWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = -e.deltaY; // up = zoom in
    const zoomFactor = 1 + Math.sign(delta) * 0.08;
    const newZoom = Math.min(2, Math.max(0.5, zoomLevel * zoomFactor));

    // adjust pan so zoom focuses around cursor position
    const worldX = (mouseX - panOffset.x) / zoomLevel;
    const worldY = (mouseY - panOffset.y) / zoomLevel;
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    setZoomLevel(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  // Draw connections
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    familyMembers.forEach(member => {
      // Parent-child connections
      if (member.children) {
        member.children.forEach(childId => {
          const child = familyMembers.find(m => m.id === childId);
          if (child && member.position && child.position) {
            const x1 = member.position.x + 75;
            const y1 = member.position.y + 140;
            const x2 = child.position.x + 75;
            const y2 = child.position.y;
            
            connections.push(
              <line
                key={`parent-${member.id}-child-${childId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3b82f6"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
        });
      }
      
      // Marriage connections
      if (member.spouseId) {
        const spouse = familyMembers.find(m => m.id === member.spouseId);
        if (spouse && member.position && spouse.position && member.id < spouse.id) {
          const x1 = member.position.x + 150;
          const y1 = member.position.y + 70;
          const x2 = spouse.position.x;
          const y2 = spouse.position.y + 70;
          
          connections.push(
            <line
              key={`marriage-${member.id}-${spouse.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          );
        }
      }
    });
    
    return connections;
  };

  // Handle connect mode click on a target member
  const tryConnectToTarget = async (target: FamilyMember) => {
    if (!connectMode) return;
    const source = familyMembers.find(m => m.id === connectMode.sourceId);
    if (!source || source.id === target.id) {
      setConnectMode(null);
      return;
    }

    try {
      if (connectMode.type === 'child') {
        // Add target as child of source
        const newChildren = Array.from(new Set([...(source.children || []), target.id]));
        await fetch('/api/update-relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: source.id, children: newChildren })
        });
        // Update child's parentId too
        await fetch('/api/update-relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: target.id, parentId: source.id })
        });
        toast.success('Connected as parent → child');
      } else if (connectMode.type === 'spouse') {
        await fetch('/api/update-relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: source.id, spouseId: target.id })
        });
        toast.success('Connected as spouses');
      }
      // Refresh data
      fetchFamilyMembers(false);
    } catch (err) {
      toast.error('Failed to create connection');
    } finally {
      setConnectMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Professional Family Tree
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button
              variant={isStaticLayout ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setIsStaticLayout(true);
                setFamilyMembers(prev => applyStaticLayout(prev));
              }}
            >
              Auto Layout
            </Button>
            <Button
              variant={!isStaticLayout ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsStaticLayout(false)}
            >
              Freestyle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // fit to screen: center content roughly at origin
                setZoomLevel(1);
                setPanOffset({ x: window.innerWidth/2, y: 140 });
              }}
            >
              Fit to Screen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoomLevel(1)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">{Math.round(zoomLevel * 100)}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Whiteboard Canvas */}
      <div
        ref={canvasRef}
        className="whiteboard-canvas relative w-full overflow-hidden cursor-move"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)`, marginTop: HEADER_HEIGHT }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
          }}
        />
        
        {/* SVG for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>

        {/* Family Members */}
        <div
          className="absolute"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0',
          }}
        >
          {familyMembers.map((member) => (
            <div
              key={member.id}
              className={`absolute cursor-move transition-shadow ${
                selectedMember?.id === member.id ? 'ring-2 ring-blue-500 z-10' : ''
              } ${draggedMember === member.id ? 'scale-105 shadow-2xl' : ''}`}
              style={{
                left: member.position?.x || 0,
                top: member.position?.y || 0,
              }}
              onMouseDown={(e) => {
                if (isStaticLayout) return; // disable node drag in static layout
                e.stopPropagation();
                if (e.button === 0) {
                  handleMemberDragStart(e, member.id);
                }
              }}
              onContextMenu={(e) => handleRightClick(e, member)}
              onClick={(e) => {
                e.stopPropagation();
                if (connectMode) {
                  tryConnectToTarget(member);
                } else {
                  setSelectedMember(member);
                }
              }}
              className="select-none"
            >
              <Card className="w-[160px] bg-gradient-to-b from-zinc-900 to-black border-zinc-800 shadow-lg hover:shadow-blue-500/20 hover:shadow-2xl transition-all rounded-2xl">
                <div className="p-3">
                  {/* Connect menu (plus icon) */}
                  <div className="absolute -top-3 -right-3 flex gap-1">
                    <button
                      title="Connect as child"
                      className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow disabled:opacity-50"
                      disabled={!!connectMode}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectMode({ sourceId: member.id, type: 'child' });
                        toast.message('Select a member to connect as Child');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      title="Connect as spouse"
                      className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow disabled:opacity-50"
                      disabled={!!connectMode}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectMode({ sourceId: member.id, type: 'spouse' });
                        toast.message('Select a member to connect as Spouse');
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    {member.photo_url ? (
                      <img
                        src={member.photo_url}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover mx-auto mb-2 ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold mx-auto mb-2 shadow-inner">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-center mb-1 truncate text-white">
                    {member.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs mb-1 w-full justify-center bg-zinc-800 text-zinc-200">
                    {member.relation}
                  </Badge>
                  {member.role && (
                    <Badge 
                      variant={member.role === 'Admin' ? 'default' : 'outline'} 
                      className="text-xs w-full justify-center"
                    >
                      {member.role === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                      {member.role}
                    </Badge>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              onClick={() => {
                setEditingMember(contextMenu.member);
                setContextMenu(null);
              }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              onClick={() => {
                setConnectMode({ sourceId: contextMenu.member.id, type: 'child' });
                setContextMenu(null);
                toast.message('Select a member to connect as Child');
              }}
            >
              <LinkIcon className="h-4 w-4" />
              Connect → Child
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
              onClick={() => {
                setConnectMode({ sourceId: contextMenu.member.id, type: 'spouse' });
                setContextMenu(null);
                toast.message('Select a member to connect as Spouse');
              }}
            >
              <LinkIcon className="h-4 w-4" />
              Connect ↔ Spouse
            </button>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-red-600"
              onClick={() => handleDeleteMember(contextMenu.member.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Relation</Label>
                  <Input
                    value={editingMember.relation}
                    onChange={(e) => setEditingMember({ ...editingMember, relation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editingMember.role || 'Member'}
                    onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-500 mb-4">
              Fill the form and click Save. The member will be added to the canvas.
            </p>
            <Button
              onClick={() => {
                setShowAddModal(false);
                window.location.href = '/admin/add-member';
              }}
              className="w-full"
            >
              Open Add Member Form
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
