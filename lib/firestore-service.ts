import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface StudySession {
  id?: string
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
  createdAt: Timestamp
}

export interface StudyGoal {
  id?: string
  userId: string
  subject: string
  targetHours: number
  currentHours: number
  deadline: string
  status: "active" | "completed" | "paused"
  createdAt: Timestamp
}

export class FirestoreService {
  // Study Sessions
  static async createStudySession(session: Omit<StudySession, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "studySessions"), {
      ...session,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  }

  static async getStudySessions(userId: string): Promise<StudySession[]> {
    const q = query(collection(db, "studySessions"), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as StudySession,
    )
  }

  static async updateStudySession(sessionId: string, updates: Partial<StudySession>): Promise<void> {
    const sessionRef = doc(db, "studySessions", sessionId)
    await updateDoc(sessionRef, updates)
  }

  static async deleteStudySession(sessionId: string): Promise<void> {
    await deleteDoc(doc(db, "studySessions", sessionId))
  }

  // Study Goals
  static async createStudyGoal(goal: Omit<StudyGoal, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "studyGoals"), {
      ...goal,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  }

  static async getStudyGoals(userId: string): Promise<StudyGoal[]> {
    const q = query(collection(db, "studyGoals"), where("userId", "==", userId), where("status", "==", "active"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as StudyGoal,
    )
  }

  static async updateStudyGoal(goalId: string, updates: Partial<StudyGoal>): Promise<void> {
    const goalRef = doc(db, "studyGoals", goalId)
    await updateDoc(goalRef, updates)
  }

  // Real-time listeners
  static subscribeToStudySessions(userId: string, callback: (sessions: StudySession[]) => void) {
    const q = query(collection(db, "studySessions"), where("userId", "==", userId), orderBy("createdAt", "desc"))

    return onSnapshot(q, (querySnapshot) => {
      const sessions = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as StudySession,
      )
      callback(sessions)
    })
  }

  static subscribeToStudyGoals(userId: string, callback: (goals: StudyGoal[]) => void) {
    const q = query(collection(db, "studyGoals"), where("userId", "==", userId), where("status", "==", "active"))

    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as StudyGoal,
      )
      callback(goals)
    })
  }
}
