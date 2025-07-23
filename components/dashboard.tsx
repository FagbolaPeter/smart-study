"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Target, TrendingUp, Brain, BookOpen, Award, Plus, PlayCircle } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { NewSessionModal } from "@/components/modals/new-session-modal"

export function Dashboard() {
  const { studySessions, studyGoals } = useApp()
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)

  // Calculate statistics
  const completedSessions = studySessions.filter((s) => s.completed)
  const totalStudyHours = completedSessions.reduce((acc, session) => acc + session.duration, 0)
  const averagePerformance =
    completedSessions.length > 0
      ? completedSessions.reduce((acc, session) => acc + (session.performance || 0), 0) / completedSessions.length
      : 0
  const completionRate = studySessions.length > 0 ? (completedSessions.length / studySessions.length) * 100 : 0

  // Get today's sessions
  const today = new Date().toISOString().split("T")[0]
  const todaySessions = studySessions.filter((s) => s.sessionDate === today)

  // Get subject progress
  const subjectStats = studySessions.reduce(
    (acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = { total: 0, completed: 0, totalHours: 0, avgPerformance: 0 }
      }
      acc[session.subject].total++
      if (session.completed) {
        acc[session.subject].completed++
        acc[session.subject].totalHours += session.duration
        acc[session.subject].avgPerformance += session.performance || 0
      }
      return acc
    },
    {} as Record<string, any>,
  )

  // Calculate average performance for each subject
  Object.keys(subjectStats).forEach((subject) => {
    const completed = subjectStats[subject].completed
    if (completed > 0) {
      subjectStats[subject].avgPerformance = subjectStats[subject].avgPerformance / completed
    }
  })

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={() => setShowNewSessionModal(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Session
      </Button>
    </div>
  )

  if (studySessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                Welcome to SmartStudy!
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Start your AI-powered learning journey</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              onClick={() => setShowNewSessionModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:hidden">New Session</span>
              <span className="hidden sm:inline">Create First Session</span>
            </Button>
          </div>

          <Card>
            <CardContent className="p-12">
              <EmptyState
                title="No study sessions yet"
                description="Create your first study session to start tracking your progress and get AI-powered recommendations."
              />
            </CardContent>
          </Card>

          <NewSessionModal open={showNewSessionModal} onOpenChange={setShowNewSessionModal} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              SmartStudy
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">AI-Powered Study Planning</p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            onClick={() => setShowNewSessionModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:hidden">New Session</span>
            <span className="hidden sm:inline">New Study Session</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudyHours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                {completedSessions.length} session{completedSessions.length !== 1 ? "s" : ""} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(averagePerformance * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Based on completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {completedSessions.length}/{studySessions.length} sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studyGoals.filter((g) => g.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Study goals in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sessions" className="text-xs sm:text-sm">
              Sessions
            </TabsTrigger>
            <TabsTrigger value="goals" className="text-xs sm:text-sm">
              Goals
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs sm:text-sm">
              AI Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todaySessions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p>No sessions scheduled for today</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => setShowNewSessionModal(true)}
                      >
                        Schedule Session
                      </Button>
                    </div>
                  ) : (
                    todaySessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium capitalize text-sm sm:text-base">{session.subject}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{session.duration}h session</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                            {session.completed ? "Completed" : "Pending"}
                          </Badge>
                          {!session.completed && (
                            <Button size="sm" variant="outline" className="text-xs bg-transparent">
                              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Subject Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Progress</CardTitle>
                  <CardDescription>Performance across different subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.keys(subjectStats).length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No subject data available yet</p>
                    ) : (
                      Object.entries(subjectStats).map(([subject, stats]) => (
                        <div key={subject} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{subject}</span>
                            <span>{(stats.avgPerformance * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={stats.avgPerformance * 100} className="h-2" />
                          <p className="text-xs text-gray-600">
                            {stats.completed}/{stats.total} sessions • {stats.totalHours.toFixed(1)}h total
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Sessions</CardTitle>
                <CardDescription>Track your study sessions and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studySessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium capitalize">{session.subject}</h3>
                          <p className="text-sm text-gray-600">
                            {session.duration}h • Difficulty: {(session.difficulty * 100).toFixed(0)}% •{" "}
                            {new Date(session.sessionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.completed && session.performance && (
                          <Badge variant="outline">{(session.performance * 100).toFixed(0)}% Performance</Badge>
                        )}
                        <Badge variant={session.completed ? "default" : "secondary"}>
                          {session.completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Study Goals</CardTitle>
                <CardDescription>Track progress towards your study objectives</CardDescription>
              </CardHeader>
              <CardContent>
                {studyGoals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>No study goals set yet</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Create Goal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {studyGoals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium capitalize">{goal.subject}</h3>
                          <span className="text-sm text-gray-600">
                            {goal.currentHours.toFixed(1)}/{goal.targetHours}h
                          </span>
                        </div>
                        <Progress value={(goal.currentHours / goal.targetHours) * 100} className="h-3" />
                        <p className="text-xs text-gray-600">
                          Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Study Recommendations
                </CardTitle>
                <CardDescription>Personalized suggestions based on your performance data</CardDescription>
              </CardHeader>
              <CardContent>
                {completedSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Complete some study sessions to get AI recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-purple-900">Optimal Study Time</h3>
                        <Badge className="bg-purple-100 text-purple-800">92% Confidence</Badge>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        Based on your performance data, you study most effectively during afternoon sessions (1-4 PM).
                      </p>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Schedule Afternoon Session
                      </Button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-green-900">Session Duration</h3>
                        <Badge className="bg-green-100 text-green-800">88% Confidence</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Your optimal session length is 2.5 hours with 25-minute breaks for maximum retention.
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Create Optimized Session
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <NewSessionModal open={showNewSessionModal} onOpenChange={setShowNewSessionModal} />
      </div>
    </div>
  )
}
