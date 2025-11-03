"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  email: string;
  phone?: string;
  photo?: string;
  generation: number;
  position: { x: number; y: number };
}

interface FamilyTreeNodeProps {
  member: FamilyMember;
  onClick: (member: FamilyMember) => void;
  isSelected?: boolean;
}

export default function FamilyTreeNode({ member, onClick, isSelected = false }: FamilyTreeNodeProps) {
  const getGenerationColor = (generation: number) => {
    switch (generation) {
      case 0: return "from-blue-400 to-blue-600"; // Parents
      case 1: return "from-green-400 to-green-600"; // Children
      case 2: return "from-purple-400 to-purple-600"; // Grandchildren
      default: return "from-gray-400 to-gray-600";
    }
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: member.position.x,
        top: member.position.y,
      }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(member)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: member.generation * 0.1 }}
    >
      <Card 
        className={`w-28 h-36 border-2 transition-all duration-200 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl ${
          isSelected 
            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800' 
            : 'border-zinc-200 dark:border-zinc-800 hover:border-green-300 dark:hover:border-green-600'
        }`}
      >
        <CardContent className="p-3 text-center h-full flex flex-col items-center justify-center">
          {/* Photo */}
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getGenerationColor(member.generation)} flex items-center justify-center mb-2 overflow-hidden shadow-md`}>
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-7 w-7 text-white" />
            )}
          </div>
          
          {/* Name */}
          <h3 className="text-sm font-semibold text-black dark:text-white truncate w-full mb-1">
            {member.name}
          </h3>
          
          {/* Relation */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate w-full">
            {member.relation}
          </p>
          
          {/* Generation Indicator */}
          <div className="mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getGenerationColor(member.generation)} text-white font-medium`}>
              Gen {member.generation + 1}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}