"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  TrendingUp, 
  Heart, 
  Calendar, 
  Trophy, 
  Clock, 
  Star,
  UserPlus,
  Award,
  Home,
  BarChart3,
  Baby,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield,
  Activity,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Medal,
  Sparkles,
  ChevronRight,
  Eye,
  ChevronUp,
  ChevronDown,
  Timer,
  Gauge,
  TreePine,
  Gift,
  Camera,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Cake
} from "lucide-react"
import { useFamilyContext } from "@/contexts/FamilyContext"

interface FamilyMember {
  id: string
  name: string
  relation: string
  age: number
  location: string
  lastActive: string
  profilePicture: string
  isOnline: boolean
  joinedDate: string
}

interface FamilyEvent {
  id: string
  title: string
  type: 'birthday' | 'anniversary' | 'wedding' | 'memorial' | 'celebration'
  date: string
  attendees: number
  location: string
  description: string
}

interface FamilyStats {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  upcomingEvents: number
  familyTreeDepth: number
  averageAge: number
  oldestMember: string
  youngestMember: string
}

export default function FamilyDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { members: contextMembers, refreshMembers } = useFamilyContext()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [recentEvents, setRecentEvents] = useState<FamilyEvent[]>([])
  const [familyStats, setFamilyStats] = useState<FamilyStats>({
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    upcomingEvents: 0,
    familyTreeDepth: 0,
    averageAge: 0,
    oldestMember: '',
    youngestMember: ''
  })

  // Load family data from context
  useEffect(() => {
    refreshMembers()
  }, [refreshMembers])

  useEffect(() => {
    // Convert context members to dashboard format with additional properties
    const dashboardMembers: FamilyMember[] = contextMembers.map((member, index) => ({
      ...member,
      age: 25 + (index * 5), // Default ages, can be updated from database
      location: "India", // Default location
      lastActive: "Recently", // Default activity
      profilePicture: "👤", // Default avatar
      isOnline: Math.random() > 0.5, // Random online status
      joinedDate: member.addedAt
    }))

    // Sample events - these could also come from a database
    const sampleEvents: FamilyEvent[] = [
      {
        id: "1",
        title: "Family Gathering",
        type: "celebration",
        date: "2024-12-25",
        attendees: contextMembers.length,
        location: "Family Home",
        description: "Annual family celebration"
      }
    ]

    setFamilyMembers(dashboardMembers)
    setRecentEvents(sampleEvents)
    
    // Calculate family statistics
    if (dashboardMembers.length > 0) {
      const activeCount = dashboardMembers.filter(m => m.isOnline).length
      const ages = dashboardMembers.map(m => m.age)
      const avgAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0
      const oldest = dashboardMembers.reduce((prev, current) => (prev.age > current.age) ? prev : current)
      const youngest = dashboardMembers.reduce((prev, current) => (prev.age < current.age) ? prev : current)

      setFamilyStats({
        totalMembers: dashboardMembers.length,
        activeMembers: activeCount,
        newMembersThisMonth: Math.min(dashboardMembers.length, 2),
        upcomingEvents: sampleEvents.length,
        familyTreeDepth: 3,
        averageAge: Math.round(avgAge),
        oldestMember: oldest.name,
        youngestMember: youngest.name
      })
    }
  }, [contextMembers])

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'birthday': return 'text-pink-600 dark:text-pink-400'
      case 'anniversary': return 'text-red-600 dark:text-red-400'
      case 'wedding': return 'text-purple-600 dark:text-purple-400'
      case 'memorial': return 'text-gray-600 dark:text-gray-400'
      case 'celebration': return 'text-green-600 dark:text-green-400'
      default: return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday': return <Cake className="h-4 w-4" />
      case 'anniversary': return <Heart className="h-4 w-4" />
      case 'wedding': return <Crown className="h-4 w-4" />
      case 'memorial': return <Star className="h-4 w-4" />
      case 'celebration': return <Gift className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4 pt-16">
      <div className="max-w-[1600px] mx-auto">
        {/* Desktop Environment */}
        <div className="relative">
          {/* Modern Monitor Container */}
          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 p-3 rounded-t-3xl shadow-2xl">
            {/* Monitor Brand Strip */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-700 px-4 py-1 rounded-full">
                <span className="text-xs text-gray-300 font-mono tracking-wider">APNA PARIVAR DISPLAY</span>
              </div>
            </div>
            
            {/* Screen Bezel */}
            <div className="bg-black p-4 rounded-2xl mt-6 relative overflow-hidden shadow-inner">
              {/* Screen Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl -z-30"></div>
              
              {/* Active Screen */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden h-[75vh] border border-gray-700/50 shadow-2xl">
                {/* Screen Content Container */}
                <div className="relative h-full p-4 overflow-y-auto custom-scrollbar">
                  {/* Screen Glow Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-blue-500/8 pointer-events-none rounded-xl -z-10"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/30 to-transparent -z-10"></div>    
              {/* Main Content Wrapper */}
                  <div className="relative z-10">
                    {/* Professional Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="mb-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h1 className="text-2xl font-bold text-white mb-1">
                            Welcome to Your Family! 👨‍👩‍👧‍👦
                          </h1>
                          <p className="text-gray-400 text-sm">
                            Here's your family tree overview and recent activities
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Family Size</div>
                          <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                            {familyStats.totalMembers} Members
                          </Badge>
                        </div>
                      </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-4"
                    >
                      <div className="flex space-x-1 bg-gray-800 border border-gray-700 p-1 rounded-lg">
                        {[
                          { id: 'overview', label: 'Overview', icon: Home },
                          { id: 'members', label: 'Members', icon: Users },
                          { id: 'events', label: 'Events', icon: Calendar },
                          { id: 'tree', label: 'Family Tree', icon: TreePine }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              activeTab === tab.id
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                          >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>  
                  {/* Dynamic Content Based on Active Tab */}
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Family Stats Grid */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                            {/* Total Members */}
                            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                              <div className="text-center">
                                <div className="relative w-16 h-16 mx-auto mb-2">
                                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-gray-700" stroke="currentColor" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-green-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" strokeDasharray={`${(familyStats.activeMembers / familyStats.totalMembers) * 100 * 0.628}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-lg font-bold text-white">{familyStats.totalMembers}</div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-300">Total Members</div>
                              </div>
                            </div>

                            {/* Active Members */}
                            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                              <div className="flex items-center justify-between mb-1">
                                <Users className="h-4 w-4 text-green-400" />
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                              </div>
                              <div className="text-lg font-bold text-white">
                                {familyStats.activeMembers}<span className="text-gray-400 text-sm">/{familyStats.totalMembers}</span>
                              </div>
                              <div className="text-xs text-gray-300">Online Now</div>
                            </div>

                            {/* New Members */}
                            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                              <div className="flex items-center justify-between mb-1">
                                <UserPlus className="h-4 w-4 text-blue-400" />
                                <span className="text-xs text-green-400">+{familyStats.newMembersThisMonth}</span>
                              </div>
                              <div className="text-lg font-bold text-white">{familyStats.newMembersThisMonth}</div>
                              <div className="text-xs text-gray-300">New This Month</div>
                            </div>

                            {/* Upcoming Events */}
                            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                              <div className="flex items-center justify-between mb-1">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <ArrowUp className="h-3 w-3 text-green-400" />
                              </div>
                              <div className="text-lg font-bold text-white">{familyStats.upcomingEvents}</div>
                              <div className="text-xs text-gray-300">Upcoming Events</div>
                            </div>
                          </div>        
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Family Members Overview */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                            >
                              <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4 text-green-400" />
                                  Family Members
                                </h2>
                                
                                <div className="space-y-2">
                                  {familyMembers.slice(0, 4).map((member) => (
                                    <div key={member.id} className="p-2 bg-gray-700/50 rounded border border-gray-600/30">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <div className="text-2xl">{member.profilePicture}</div>
                                          <div>
                                            <h3 className="font-medium text-white text-sm">{member.name}</h3>
                                            <div className="text-xs text-gray-400">{member.relation} • {member.age} years</div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                                          <span className="text-xs text-gray-400">{member.lastActive}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Add Family Member
                                </Button>
                              </div>
                            </motion.div>

                            {/* Recent Events & Activities */}
                            <div className="space-y-3">
                              {/* Upcoming Events */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.6 }}
                              >
                                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                                  <h2 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-purple-400" />
                                    Upcoming Events
                                  </h2>
                                  
                                  <div className="space-y-1.5">
                                    {recentEvents.slice(0, 3).map((event) => (
                                      <div key={event.id} className="p-2 bg-gray-700/50 rounded border border-gray-600/30">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className={getEventTypeColor(event.type)}>
                                              {getEventIcon(event.type)}
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-white text-xs">{event.title}</h4>
                                              <div className="text-xs text-gray-400">{event.date} • {event.attendees} attending</div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>            
                  {/* Family Insights */}
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.7 }}
                              >
                                <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                                  <h2 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-blue-400" />
                                    Family Insights
                                  </h2>
                                  
                                  <div className="space-y-1.5">
                                    <div className="p-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded border border-blue-600/30">
                                      <div className="flex items-center gap-2">
                                        <TreePine className="h-4 w-4 text-blue-400" />
                                        <div className="flex-1">
                                          <h4 className="font-medium text-white text-xs">Family Tree Depth</h4>
                                          <div className="text-xs text-blue-400">{familyStats.familyTreeDepth} Generations</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="p-2 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded border border-green-600/30">
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-green-400" />
                                        <div className="flex-1">
                                          <h4 className="font-medium text-white text-xs">Average Age</h4>
                                          <div className="text-xs text-green-400">{familyStats.averageAge} years</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="p-2 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded border border-yellow-600/30">
                                      <div className="flex items-center gap-2">
                                        <Crown className="h-4 w-4 text-yellow-400" />
                                        <div className="flex-1">
                                          <h4 className="font-medium text-white text-xs">Eldest: {familyStats.oldestMember}</h4>
                                          <div className="text-xs text-yellow-400">Youngest: {familyStats.youngestMember}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.8 }}
                            className="mt-3"
                          >
                            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/50">
                              <h2 className="text-md font-bold text-white mb-3">Quick Actions</h2>
                              
                              <div className="grid grid-cols-4 gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white p-2 h-auto flex-col">
                                  <UserPlus className="h-4 w-4 mb-1" />
                                  <div className="text-xs">Add Member</div>
                                </Button>
                                
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white p-2 h-auto flex-col">
                                  <Calendar className="h-4 w-4 mb-1" />
                                  <div className="text-xs">Add Event</div>
                                </Button>
                                
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white p-2 h-auto flex-col">
                                  <TreePine className="h-4 w-4 mb-1" />
                                  <div className="text-xs">View Tree</div>
                                </Button>
                                
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white p-2 h-auto flex-col">
                                  <Camera className="h-4 w-4 mb-1" />
                                  <div className="text-xs">Memories</div>
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}     
                 {activeTab === 'members' && (
                        <motion.div
                          key="members"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              All Family Members
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {familyMembers.map((member, index) => (
                                <motion.div
                                  key={member.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/30 hover:border-green-500/50 transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="relative">
                                      <div className="text-4xl">{member.profilePicture}</div>
                                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${
                                        member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                                      }`} />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-white">{member.name}</h3>
                                      <p className="text-sm text-gray-400">{member.relation} • {member.age} years old</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs text-gray-500">{member.location}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-3 w-3 text-gray-500" />
                                        <span className="text-xs text-gray-500">Last active: {member.lastActive}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1">
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        Chat
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs">
                                        <Phone className="h-3 w-3 mr-1" />
                                        Call
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'events' && (
                        <motion.div
                          key="events"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Family Events & Celebrations
                            </h2>
                            
                            <div className="space-y-4">
                              {recentEvents.map((event, index) => (
                                <motion.div
                                  key={event.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: index * 0.1 }}
                                  className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/30"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)} bg-gray-600/50`}>
                                      {getEventIcon(event.type)}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                                      <p className="text-sm text-gray-400 mb-2">{event.description}</p>
                                      
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" />
                                          {event.date}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {event.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {event.attendees} attending
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Badge className={`capitalize ${getEventTypeColor(event.type)}`}>
                                      {event.type}
                                    </Badge>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}  
                    {activeTab === 'tree' && (
                        <motion.div
                          key="tree"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-600/50">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <TreePine className="h-5 w-5" />
                              Family Tree Overview
                            </h2>
                            
                            <div className="text-center py-8">
                              <TreePine className="h-16 w-16 mx-auto text-green-400 mb-4" />
                              <h3 className="text-xl font-semibold text-white mb-2">Interactive Family Tree</h3>
                              <p className="text-gray-400 mb-6">
                                Explore your family connections and relationships in an interactive tree view
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-400">{familyStats.familyTreeDepth}</div>
                                  <div className="text-xs text-gray-400">Generations</div>
                                </div>
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-400">{familyStats.totalMembers}</div>
                                  <div className="text-xs text-gray-400">Total Members</div>
                                </div>
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-400">{familyStats.averageAge}</div>
                                  <div className="text-xs text-gray-400">Avg Age</div>
                                </div>
                                <div className="p-3 bg-gray-700/50 rounded-lg">
                                  <div className="text-2xl font-bold text-yellow-400">5</div>
                                  <div className="text-xs text-gray-400">Branches</div>
                                </div>
                              </div>
                              
                              <Button className="bg-green-600 hover:bg-green-700 text-white">
                                <TreePine className="h-4 w-4 mr-2" />
                                Open Interactive Tree
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Screen Status Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-sm border-t border-gray-700/50 flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                      {/* Power Status */}
                      <div className="flex items-center gap-1">
                        <motion.div 
                          className="w-1.5 h-1.5 bg-green-400 rounded-full"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span className="text-xs text-green-400 font-mono">FAMILY CONNECTED</span>
                      </div>
                      
                      {/* Connection Status */}
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4].map((bar) => (
                            <motion.div
                              key={bar}
                              className="w-0.5 bg-green-400 rounded-full"
                              style={{ height: `${bar * 1.5 + 2}px` }}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: bar * 0.1 }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-green-400 font-mono">{familyStats.activeMembers}/{familyStats.totalMembers}</span>
                      </div>
                    </div>
                    
                    {/* System Info */}
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 font-mono">APNA-PARIVAR v2.1</span>
                      <span className="text-xs text-cyan-400 font-mono">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Scan Lines Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl -z-20">
                  <motion.div
                    className="absolute inset-x-0 bg-gradient-to-b from-transparent via-green-400/10 to-transparent h-3 opacity-60"
                    animate={{ y: [-12, '85vh'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                
                {/* Corner Highlights */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-tl-xl pointer-events-none -z-20"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-tr-xl pointer-events-none -z-20"></div>
              </div>
            </div>
          </div>  
        {/* Monitor Stand and Base */}
          <div className="flex flex-col items-center">
            {/* Stand Neck */}
            <div className="w-6 h-12 bg-gradient-to-b from-gray-600 to-gray-700 rounded-b-lg shadow-lg"></div>
            
            {/* Stand Base */}
            <div className="w-48 h-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full shadow-xl relative">
              {/* Base Details */}
              <div className="absolute inset-x-0 top-1 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent rounded-full"></div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Brand Label on Base */}
            <div className="mt-2">
              <span className="text-xs text-gray-500 font-mono tracking-wider">FAMILY SERIES</span>
            </div>
          </div>
          
          {/* Ambient Lighting Effects */}
          <div className="absolute -inset-8 bg-gradient-to-b from-green-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none -z-40"></div>
          
          {/* Desktop Shadow */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-96 h-8 bg-black/20 rounded-full blur-xl"></div>
        </div>
        
        {/* Custom Scrollbar Styles */}
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #374151 #1f2937;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #374151;
            border-radius: 4px;
            border: 1px solid #4b5563;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #4b5563;
          }
        `}</style>
      </div>
    </div>
  )
}