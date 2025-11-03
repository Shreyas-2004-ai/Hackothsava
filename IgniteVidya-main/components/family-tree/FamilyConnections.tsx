"use client";

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

interface FamilyConnectionsProps {
  members: FamilyMember[];
}

export default function FamilyConnections({ members }: FamilyConnectionsProps) {
  const generateConnections = () => {
    const connections: JSX.Element[] = [];
    
    members.forEach(member => {
      if (member.children) {
        member.children.forEach(childId => {
          const child = members.find(m => m.id === childId);
          if (child) {
            // Calculate connection points
            const parentX = member.position.x + 56; // Center of parent node (28px * 2)
            const parentY = member.position.y + 144; // Bottom of parent node
            const childX = child.position.x + 56; // Center of child node
            const childY = child.position.y; // Top of child node
            
            // Create curved connection
            const midY = parentY + (childY - parentY) / 2;
            
            connections.push(
              <g key={`connection-${member.id}-${childId}`}>
                {/* Vertical line from parent */}
                <line
                  x1={parentX}
                  y1={parentY}
                  x2={parentX}
                  y2={midY}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="opacity-60"
                />
                
                {/* Horizontal line */}
                <line
                  x1={parentX}
                  y1={midY}
                  x2={childX}
                  y2={midY}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="opacity-60"
                />
                
                {/* Vertical line to child */}
                <line
                  x1={childX}
                  y1={midY}
                  x2={childX}
                  y2={childY}
                  stroke="#10b981"
                  strokeWidth="2"
                  className="opacity-60"
                />
                
                {/* Connection dots */}
                <circle
                  cx={parentX}
                  cy={parentY}
                  r="3"
                  fill="#10b981"
                  className="opacity-80"
                />
                <circle
                  cx={childX}
                  cy={childY}
                  r="3"
                  fill="#10b981"
                  className="opacity-80"
                />
              </g>
            );
          }
        });
      }
    });
    
    // Add marriage connections (horizontal lines between spouses)
    const marriages = [
      { spouse1: "1", spouse2: "2" }, // Krishnappa and Lakshmi
    ];
    
    marriages.forEach(marriage => {
      const spouse1 = members.find(m => m.id === marriage.spouse1);
      const spouse2 = members.find(m => m.id === marriage.spouse2);
      
      if (spouse1 && spouse2) {
        const x1 = spouse1.position.x + 112; // Right edge of spouse1
        const y1 = spouse1.position.y + 72; // Middle of spouse1
        const x2 = spouse2.position.x; // Left edge of spouse2
        const y2 = spouse2.position.y + 72; // Middle of spouse2
        
        connections.push(
          <g key={`marriage-${marriage.spouse1}-${marriage.spouse2}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ef4444"
              strokeWidth="3"
              className="opacity-70"
            />
            {/* Heart symbol for marriage */}
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 + 5}
              textAnchor="middle"
              className="text-red-500 text-lg"
              style={{ fontFamily: 'serif' }}
            >
              ♥
            </text>
          </g>
        );
      }
    });
    
    return connections;
  };

  return (
    <svg
      width="100%"
      height="100%"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {generateConnections()}
    </svg>
  );
}