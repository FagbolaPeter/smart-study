"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface StudySession {
  id: string
  userId: string
  subject: string
  duration: number
  difficulty: number
  performance?: number
  completed: boolean
  sessionDate: string
  startTime?: string
  endTime?: string
  breakFrequency?: number
  notes?: string
  createdAt: string
}

interface StudyGoal {
  id: string
  userId: string
  subject: string
  targetHours: number
  currentHours: number
  deadline: string
  status: "active" | "completed" | "paused"
  createdAt: string
}

interface AppContextType {
  user: User | null
  studySessions: StudySession[]
  studyGoals: StudyGoal[]
  loading: boolean
  addStudySession: (session: Omit<StudySession, "id" | "userId" | "createdAt">) => void
  updateStudySession: (id: string, updates: Partial<StudySession>) => void
  deleteStudySession: (id: string) => void
  addStudyGoal: (goal: Omit<StudyGoal, "id" | "userId" | "createdAt">) => void
  updateStudyGoal: (id: string, updates: Partial<StudyGoal>) => void
  deleteStudyGoal: (id: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      if (user) {
        loadUserData(user.uid)
      } else {
        setStudySessions([])
        setStudyGoals([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loadUserData = (userId: string) => {
    // Load from localStorage for demo (in production, use Firestore)
    const sessions = localStorage.getItem(`studySessions_${userId}`)
    const goals = localStorage.getItem(`studyGoals_${userId}`)

    if (sessions) {
      setStudySessions(JSON.parse(sessions))
    }
    if (goals) {
      setStudyGoals(JSON.parse(goals))
    }
  }

  const saveUserData = (userId: string, sessions: StudySession[], goals: StudyGoal[]) => {
    localStorage.setItem(`studySessions_${userId}`, JSON.stringify(sessions))
    localStorage.setItem(`studyGoals_${userId}`, JSON.stringify(goals))
  }

  const loadUserSettings = (userId: string) => {
    const settingsData = localStorage.getItem(`settings_${userId}`)
    if (settingsData) {
      return JSON.parse(settingsData)
    }
    return null
  }

  const addStudySession = (sessionData: Omit<StudySession, "id" | "userId" | "createdAt">) => {
    if (!user) return

    const settings = loadUserSettings(user.uid)

    const newSession: StudySession = {
      ...sessionData,
      // Apply default settings if not specified
      duration: sessionData.duration || settings?.study?.defaultSessionDuration / 60 || 2,
      difficulty: sessionData.difficulty || settings?.study?.defaultDifficulty / 10 || 0.5,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date().toISOString(),
    }

    const updatedSessions = [...studySessions, newSession]
    setStudySessions(updatedSessions)
    saveUserData(user.uid, updatedSessions, studyGoals)
  }

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    if (!user) return

    const updatedSessions = studySessions.map((session) => (session.id === id ? { ...session, ...updates } : session))
    setStudySessions(updatedSessions)
    saveUserData(user.uid, updatedSessions, studyGoals)
  }

  const deleteStudySession = (id: string) => {
    if (!user) return

    const updatedSessions = studySessions.filter((session) => session.id !== id)
    setStudySessions(updatedSessions)
    saveUserData(user.uid, updatedSessions, studyGoals)
  }

  const addStudyGoal = (goalData: Omit<StudyGoal, "id" | "userId" | "createdAt">) => {
    if (!user) return

    const newGoal: StudyGoal = {
      ...goalData,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: new Date().toISOString(),
    }

    const updatedGoals = [...studyGoals, newGoal]
    setStudyGoals(updatedGoals)
    saveUserData(user.uid, studySessions, updatedGoals)
  }

  const updateStudyGoal = (id: string, updates: Partial<StudyGoal>) => {
    if (!user) return

    const updatedGoals = studyGoals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal))
    setStudyGoals(updatedGoals)
    saveUserData(user.uid, studySessions, updatedGoals)
  }

  const deleteStudyGoal = (id: string) => {
    if (!user) return

    const updatedGoals = studyGoals.filter((goal) => goal.id !== id)
    setStudyGoals(updatedGoals)
    saveUserData(user.uid, studySessions, updatedGoals)
  }

  return (
    <AppContext.Provider
      value={{
        user,
        studySessions,
        studyGoals,
        loading,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        addStudyGoal,
        updateStudyGoal,
        deleteStudyGoal,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
