"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, ExternalLink, Plus, FolderSyncIcon as Sync, AlertCircle } from "lucide-react"
import { googleCalendar } from "@/lib/google-calendar"

interface CalendarEvent {
  id: string
  title: string
  subject: string
  start: string
  end: string
  type: "study" | "break" | "exam"
  synced: boolean
}

export function CalendarIntegration() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    initializeCalendar()
  }, [])

  const initializeCalendar = async () => {
    try {
      await googleCalendar.initialize()
      setIsConnected(googleCalendar.isSignedIn())
    } catch (error: any) {
      console.error("Failed to initialize Google Calendar:", error)
      setError("Failed to initialize Google Calendar. Please refresh the page.")
    }
  }

  const handleConnect = async () => {
    setLoading(true)
    setError("")

    try {
      await googleCalendar.requestAccess()
      setIsConnected(true)
      await syncEvents()
    } catch (error: any) {
      console.error("Failed to connect to Google Calendar:", error)

      if (error.message.includes("redirect_uri_mismatch")) {
        setError(
          `OAuth configuration error. Please add ${window.location.origin} to your Google Cloud Console OAuth settings under "Authorized JavaScript origins".`,
        )
      } else {
        setError(`Failed to connect to Google Calendar: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const syncEvents = async () => {
    if (!isConnected) return

    setLoading(true)
    setError("")

    try {
      const calendarEvents = await googleCalendar.getEvents()
      // Convert Google Calendar events to our format
      const formattedEvents = calendarEvents.map((event: any) => ({
        id: event.id,
        title: event.summary || "Untitled Event",
        subject: event.description || "Study Session",
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        type: event.summary?.toLowerCase().includes("exam") ? "exam" : "study",
        synced: true,
      }))
      setEvents(formattedEvents)
    } catch (error: any) {
      console.error("Failed to sync events:", error)
      setError(`Failed to sync calendar events: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createStudySession = async (sessionData: {
    title: string
    subject: string
    duration: number
    startTime: string
  }) => {
    if (!isConnected) {
      setError("Please connect to Google Calendar first")
      return
    }

    try {
      const startDate = new Date(sessionData.startTime)
      const endDate = new Date(startDate.getTime() + sessionData.duration * 60 * 60 * 1000)

      await googleCalendar.createEvent({
        title: `${sessionData.subject} - ${sessionData.title}`,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        description: `SmartStudy AI-scheduled session for ${sessionData.subject}`,
      })

      await syncEvents()
    } catch (error: any) {
      console.error("Failed to create study session:", error)
      setError(`Failed to create study session: ${error.message}`)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const syncToCalendar = (eventId: string) => {
    setEvents(events.map((event) => (event.id === eventId ? { ...event, synced: true } : event)))
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "study":
        return "bg-blue-100 text-blue-800"
      case "break":
        return "bg-green-100 text-green-800"
      case "exam":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>Sync your study sessions with Google Calendar for better planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="font-medium">{isConnected ? "Connected to Google Calendar" : "Not Connected"}</span>
            </div>
            <div className="flex gap-2">
              {!isConnected ? (
                <Button onClick={handleConnect} disabled={loading}>
                  {loading ? "Connecting..." : "Connect Calendar"}
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={syncEvents} disabled={loading}>
                    <Sync className="h-4 w-4 mr-2" />
                    {loading ? "Syncing..." : "Sync Now"}
                  </Button>
                  <Button size="sm" onClick={() => window.open("https://calendar.google.com", "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Calendar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Study Sessions</CardTitle>
          <CardDescription>Your scheduled study sessions and important dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {isConnected ? "No upcoming events found" : "Connect to Google Calendar to see your events"}
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium">{formatDate(event.start)}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                    {event.synced ? (
                      <Badge variant="outline" className="text-green-600">
                        Synced
                      </Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => syncToCalendar(event.id)}>
                        Sync
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Schedule Study Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Create a new study session based on AI recommendations</p>
            <Button
              className="w-full"
              disabled={!isConnected}
              onClick={() =>
                createStudySession({
                  title: "AI Recommended Session",
                  subject: "Mathematics",
                  duration: 2,
                  startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                })
              }
            >
              {isConnected ? "Create Session" : "Connect Calendar First"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Smart Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Let AI optimize your study schedule for the week</p>
            <Button variant="outline" className="w-full bg-transparent" disabled={!isConnected}>
              {isConnected ? "Generate Schedule" : "Connect Calendar First"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Schedule</CardTitle>
          <CardDescription>Visual overview of your study plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="min-h-32 p-2 border rounded-lg bg-gray-50">
                <div className="text-sm font-medium mb-2">{18 + i}</div>
                {events
                  .filter((event) => new Date(event.start).getDay() === (i + 1) % 7)
                  .map((event) => (
                    <div key={event.id} className={`text-xs p-1 rounded mb-1 ${getEventTypeColor(event.type)}`}>
                      {formatTime(event.start)} {event.title.substring(0, 10)}...
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
