"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Bell,
  Palette,
  Clock,
  Brain,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { updateProfile } from "firebase/auth"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UserSettings {
  displayName: string
  email: string
  theme: "light" | "dark" | "system"
  notifications: {
    breakReminders: boolean
    sessionComplete: boolean
    dailyGoals: boolean
    weeklyReports: boolean
    soundEnabled: boolean
    volume: number
  }
  study: {
    defaultSessionDuration: number
    defaultBreakDuration: number
    defaultDifficulty: number
    autoStartBreaks: boolean
    showPerformanceTips: boolean
    preferredStudyTime: "morning" | "afternoon" | "evening" | "flexible"
  }
  privacy: {
    shareProgress: boolean
    allowAnalytics: boolean
    dataRetention: "1year" | "2years" | "forever"
  }
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { user, studySessions } = useApp()
  const [settings, setSettings] = useState<UserSettings>({
    displayName: user?.displayName || "",
    email: user?.email || "",
    theme: "system",
    notifications: {
      breakReminders: true,
      sessionComplete: true,
      dailyGoals: true,
      weeklyReports: false,
      soundEnabled: true,
      volume: 50,
    },
    study: {
      defaultSessionDuration: 120,
      defaultBreakDuration: 15,
      defaultDifficulty: 5,
      autoStartBreaks: false,
      showPerformanceTips: true,
      preferredStudyTime: "flexible",
    },
    privacy: {
      shareProgress: false,
      allowAnalytics: true,
      dataRetention: "2years",
    },
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  // Load settings from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedSettings = localStorage.getItem(`settings_${user.uid}`)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    }
  }, [user])

  const saveSettings = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Update Firebase profile if display name changed
      if (settings.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: settings.displayName,
        })
      }

      // Save settings to localStorage
      localStorage.setItem(`settings_${user.uid}`, JSON.stringify(settings))

      // Apply theme
      applyTheme(settings.theme)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      // System theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (prefersDark) {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  const exportData = () => {
    const data = {
      user: {
        email: user?.email,
        displayName: user?.displayName,
      },
      studySessions,
      settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `smartstudy-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to delete all your study data? This action cannot be undone.")) {
      if (user) {
        localStorage.removeItem(`studySessions_${user.uid}`)
        localStorage.removeItem(`studyGoals_${user.uid}`)
        localStorage.removeItem(`settings_${user.uid}`)
        window.location.reload()
      }
    }
  }

  const testNotification = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("SmartStudy", {
          body: "This is a test notification!",
          icon: "/favicon.ico",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("SmartStudy", {
              body: "Notifications enabled successfully!",
              icon: "/favicon.ico",
            })
          }
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your SmartStudy experience</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
            <TabsTrigger value="profile" className="text-xs p-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs p-2">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs p-2">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="text-xs p-2">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Study</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs p-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline ml-1">Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={settings.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Account Statistics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{studySessions.length}</div>
                      <div className="text-sm text-blue-800">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {studySessions.filter((s) => s.completed).length}
                      </div>
                      <div className="text-sm text-green-800">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Break Reminders</Label>
                    <p className="text-sm text-gray-500">Get notified when it's time for a break</p>
                  </div>
                  <Switch
                    checked={settings.notifications.breakReminders}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, breakReminders: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Complete</Label>
                    <p className="text-sm text-gray-500">Celebrate when you complete a study session</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sessionComplete}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, sessionComplete: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Goal Reminders</Label>
                    <p className="text-sm text-gray-500">Daily reminders about your study goals</p>
                  </div>
                  <Switch
                    checked={settings.notifications.dailyGoals}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, dailyGoals: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Weekly progress summary emails</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, weeklyReports: checked },
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sound Notifications</Label>
                      <p className="text-sm text-gray-500">Play sounds for notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.soundEnabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, soundEnabled: checked },
                        }))
                      }
                    />
                  </div>

                  {settings.notifications.soundEnabled && (
                    <div className="space-y-2">
                      <Label>Volume: {settings.notifications.volume}%</Label>
                      <div className="flex items-center gap-2">
                        <VolumeX className="h-4 w-4" />
                        <Slider
                          value={[settings.notifications.volume]}
                          onValueChange={(value) =>
                            setSettings((prev) => ({
                              ...prev,
                              notifications: { ...prev.notifications, volume: value[0] },
                            }))
                          }
                          max={100}
                          min={0}
                          step={10}
                          className="flex-1"
                        />
                        <Volume2 className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  <Button variant="outline" onClick={testNotification} className="w-full bg-transparent">
                    Test Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: "light" | "dark" | "system") =>
                      setSettings((prev) => ({ ...prev, theme: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">Choose your preferred color scheme</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">SmartStudy</span>
                    </div>
                    <p className="text-sm text-gray-600">This is how your app will look with the selected theme.</p>
                    <div className="flex gap-2 mt-2">
                      <Badge>Mathematics</Badge>
                      <Badge variant="outline">2.5h session</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Settings */}
          <TabsContent value="study" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Study Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Default Session Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.study.defaultSessionDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          study: { ...prev.study, defaultSessionDuration: Number.parseInt(e.target.value) || 120 },
                        }))
                      }
                      min="15"
                      max="480"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Default Break Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.study.defaultBreakDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          study: { ...prev.study, defaultBreakDuration: Number.parseInt(e.target.value) || 15 },
                        }))
                      }
                      min="5"
                      max="60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Difficulty Level: {settings.study.defaultDifficulty}/10</Label>
                  <Slider
                    value={[settings.study.defaultDifficulty]}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        study: { ...prev.study, defaultDifficulty: value[0] },
                      }))
                    }
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Study Time</Label>
                  <Select
                    value={settings.study.preferredStudyTime}
                    onValueChange={(value: "morning" | "afternoon" | "evening" | "flexible") =>
                      setSettings((prev) => ({
                        ...prev,
                        study: { ...prev.study, preferredStudyTime: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6-12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12-6 PM)</SelectItem>
                      <SelectItem value="evening">Evening (6-12 AM)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-start Breaks</Label>
                    <p className="text-sm text-gray-500">Automatically start break timer after study sessions</p>
                  </div>
                  <Switch
                    checked={settings.study.autoStartBreaks}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        study: { ...prev.study, autoStartBreaks: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Performance Tips</Label>
                    <p className="text-sm text-gray-500">Display AI-powered study tips during sessions</p>
                  </div>
                  <Switch
                    checked={settings.study.showPerformanceTips}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        study: { ...prev.study, showPerformanceTips: checked },
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Progress</Label>
                    <p className="text-sm text-gray-500">Allow sharing your study progress with others</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareProgress}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, shareProgress: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-gray-500">Help improve SmartStudy by sharing anonymous usage data</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowAnalytics}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, allowAnalytics: checked },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Retention</Label>
                  <Select
                    value={settings.privacy.dataRetention}
                    onValueChange={(value: "1year" | "2years" | "forever") =>
                      setSettings((prev) => ({
                        ...prev,
                        privacy: { ...prev.privacy, dataRetention: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">How long to keep your study data</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>

                  <Button variant="outline" onClick={exportData} className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Export includes all your study sessions, goals, and settings in JSON format.
                    </AlertDescription>
                  </Alert>

                  <Button variant="destructive" onClick={clearAllData} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </Button>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      This will permanently delete all your study data. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-4 sm:gap-0">
          <div className="flex items-center gap-2 order-2 sm:order-1">
            {saved && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Settings saved!</span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={saveSettings} disabled={saving} className="w-full sm:w-auto">
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
