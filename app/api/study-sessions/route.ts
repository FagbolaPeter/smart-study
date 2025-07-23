import { type NextRequest, NextResponse } from "next/server"

// Mock database for study sessions
const studySessions: any[] = [
  {
    id: "1",
    subject: "Mathematics",
    duration: 2,
    completed: true,
    performance: 0.85,
    date: "2024-01-20",
    difficulty: 0.8,
    user_id: "user1",
  },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    sessions: studySessions,
  })
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()

    const newSession = {
      id: Date.now().toString(),
      ...sessionData,
      created_at: new Date().toISOString(),
    }

    studySessions.push(newSession)

    return NextResponse.json({
      success: true,
      session: newSession,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
  }
}
