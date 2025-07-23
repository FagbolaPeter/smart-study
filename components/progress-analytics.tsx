"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Calendar, Award, Target, Clock, BookOpen } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function ProgressAnalytics() {
  const { studySessions, studyGoals } = useApp()

  const analytics = useMemo(() => {
    const completedSessions = studySessions.filter((s) => s.completed)
    const totalHours = completedSessions.reduce((sum, session) => sum + session.duration, 0)
    const avgPerformance =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, session) => sum + (session.performance || 0), 0) / completedSessions.length
        : 0

    // Weekly data (last 7 days)
    const weeklyData = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const daySessions = completedSessions.filter((s) => s.sessionDate === dateStr)
      const dayHours = daySessions.reduce((sum, s) => sum + s.duration, 0)
      const dayPerformance =
        daySessions.length > 0 ? daySessions.reduce((sum, s) => sum + (s.performance || 0), 0) / daySessions.length : 0

      weeklyData.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: dateStr,
        hours: dayHours,
        performance: dayPerformance,
        sessions: daySessions.length,
      })
    }

    // Subject progress
    const subjectProgress = studySessions.reduce(
      (acc, session) => {
        if (!acc[session.subject]) {
          acc[session.subject] = {
            completed: 0,
            total: 0,
            totalHours: 0,
            avgPerformance: 0,
            performances: [],
          }
        }
        acc[session.subject].total++
        if (session.completed) {
          acc[session.subject].completed++
          acc[session.subject].totalHours += session.duration
          if (session.performance) {
            acc[session.subject].performances.push(session.performance)
          }
        }
        return acc
      },
      {} as Record<string, any>,
    )

    // Calculate average performance for each subject
    Object.keys(subjectProgress).forEach((subject) => {
      const performances = subjectProgress[subject].performances
      if (performances.length > 0) {
        subjectProgress[subject].avgPerformance =
          performances.reduce((sum: number, p: number) => sum + p, 0) / performances.length
      }
    })

    return {
      totalHours,
      avgPerformance,
      completedSessions: completedSessions.length,
      totalSessions: studySessions.length,
      weeklyData,
      subjectProgress,
    }
  }, [studySessions])

  const achievements = [
    {
      title: "First Session",
      description: "Complete your first study session",
      earned: analytics.completedSessions > 0,
    },
    {
      title: "Consistent Learner",
      description: "Study for 3 consecutive days",
      earned: analytics.weeklyData.filter((d) => d.sessions > 0).length >= 3,
    },
    {
      title: "Marathon",
      description: "Complete a 4+ hour session",
      earned: studySessions.some((s) => s.completed && s.duration >= 4),
    },
    {
      title: "High Performer",
      description: "Achieve 90%+ performance in a session",
      earned: studySessions.some((s) => s.completed && (s.performance || 0) >= 0.9),
    },
    {
      title: "Subject Master",
      description: "Complete 10 sessions in one subject",
      earned: Object.values(analytics.subjectProgress).some((s: any) => s.completed >= 10),
    },
    {
      title: "Time Manager",
      description: "Study for 20+ total hours",
      earned: analytics.totalHours >= 20,
    },
  ]

  const EmptyState = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: any
    title: string
    description: string
  }) => (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )

  if (studySessions.length === 0) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={BarChart3}
              title="No analytics data yet"
              description="Complete some study sessions to see your progress analytics and insights."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.weeklyData.reduce((sum, day) => sum + day.hours, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.weeklyData.reduce((sum, day) => sum + day.sessions, 0)} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.avgPerformance * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Based on {analytics.completedSessions} completed sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalSessions > 0
                ? ((analytics.completedSessions / analytics.totalSessions) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedSessions}/{analytics.totalSessions} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Lifetime study time</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="subjects" className="text-xs sm:text-sm">
            Subjects
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">
            Performance
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm">
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Study Hours
              </CardTitle>
              <CardDescription>Daily study hours and performance over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyData.map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                      <span className="font-medium text-sm sm:text-base">{day.day}</span>
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-600">{day.hours.toFixed(1)}h</span>
                        {day.sessions > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {(day.performance * 100).toFixed(0)}%
                          </Badge>
                        )}
                        <span className="text-gray-500">{day.sessions} sessions</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Progress value={Math.min((day.hours / 8) * 100, 100)} className="flex-1 h-2" />
                      {day.sessions > 0 && <Progress value={day.performance * 100} className="flex-1 h-2" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
              <CardDescription>Track progress across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(analytics.subjectProgress).length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="No subject data"
                  description="Complete study sessions to see subject-wise progress."
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(analytics.subjectProgress).map(([subject, stats]: [string, any]) => (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium capitalize">{subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {stats.completed}/{stats.total} sessions
                          </span>
                          {stats.avgPerformance > 0 && (
                            <Badge variant="outline">{(stats.avgPerformance * 100).toFixed(0)}% avg</Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={(stats.completed / stats.total) * 100} className="h-3" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{((stats.completed / stats.total) * 100).toFixed(0)}% complete</span>
                        <span>{stats.totalHours.toFixed(1)}h total</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>AI-powered analysis of your study patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.completedSessions === 0 ? (
                <EmptyState
                  icon={TrendingUp}
                  title="No performance data"
                  description="Complete some study sessions to get AI-powered insights."
                />
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">🎯 Overall Performance</h4>
                    <p className="text-sm text-green-700">
                      Your average performance is <strong>{(analytics.avgPerformance * 100).toFixed(1)}%</strong> across{" "}
                      {analytics.completedSessions} completed sessions.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">📈 Study Consistency</h4>
                    <p className="text-sm text-blue-700">
                      You've completed <strong>{analytics.completedSessions}</strong> out of {analytics.totalSessions}{" "}
                      planned sessions ({((analytics.completedSessions / analytics.totalSessions) * 100).toFixed(1)}%
                      completion rate).
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">🧠 Study Volume</h4>
                    <p className="text-sm text-purple-700">
                      You've accumulated <strong>{analytics.totalHours.toFixed(1)} hours</strong> of focused study time.
                      {analytics.totalHours >= 10 && " Great dedication to learning!"}
                    </p>
                  </div>

                  {Object.keys(analytics.subjectProgress).length > 1 && (
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h4 className="font-medium text-orange-800 mb-2">⚡ Subject Insights</h4>
                      <p className="text-sm text-orange-700">
                        You're studying{" "}
                        <strong>{Object.keys(analytics.subjectProgress).length} different subjects</strong>. Consider
                        focusing on your weakest areas for maximum improvement.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Study Achievements
              </CardTitle>
              <CardDescription>Unlock badges as you reach study milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.earned ? "bg-yellow-200 text-yellow-800" : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className={`font-medium ${achievement.earned ? "text-yellow-800" : "text-gray-600"}`}>
                          {achievement.title}
                        </h4>
                        <p className={`text-sm ${achievement.earned ? "text-yellow-700" : "text-gray-500"}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {achievement.earned && <Badge className="mt-2 bg-yellow-100 text-yellow-800">Earned!</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
