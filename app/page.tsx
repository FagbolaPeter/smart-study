"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard"
import { StudySession } from "@/components/study-session"
import { ProgressAnalytics } from "@/components/progress-analytics"
import { CalendarIntegration } from "@/components/calendar-integration"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Calendar, BarChart3, Play, Settings, LogOut } from "lucide-react"
import { AppProvider, useApp } from "@/contexts/app-context"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { SettingsModal } from "@/components/modals/settings-modal"

function SmartStudyAppContent() {
  const { user, loading } = useApp()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p>Loading SmartStudy...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onSuccess={() => {}} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">SmartStudy</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">AI-Powered Study Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:block">Welcome, {user.email}</span>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)} className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)} className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:flex bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="sm:hidden bg-transparent">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Study Session</span>
              <span className="sm:hidden">Study</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Calendar</span>
              <span className="sm:hidden">Cal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="session" className="space-y-6">
            <StudySession />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <ProgressAnalytics />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarIntegration />
          </TabsContent>
        </Tabs>
        <SettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2 text-sm sm:text-base">SmartStudy - Increase your study efficiency by up to 30%</p>
            <p className="text-xs sm:text-sm">Powered by AI • Real-time sync • Personalized recommendations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function SmartStudyApp() {
  return (
    <AppProvider>
      <SmartStudyAppContent />
    </AppProvider>
  )
}
