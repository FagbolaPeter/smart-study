import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "week"

  // Mock analytics data
  const analyticsData = {
    week: {
      total_hours: 29.2,
      avg_performance: 0.87,
      completion_rate: 0.89,
      efficiency_score: 92,
      daily_breakdown: [
        { day: "Mon", hours: 3.5, performance: 0.82 },
        { day: "Tue", hours: 4.2, performance: 0.89 },
        { day: "Wed", hours: 2.8, performance: 0.76 },
        { day: "Thu", hours: 5.1, performance: 0.91 },
        { day: "Fri", hours: 3.9, performance: 0.85 },
        { day: "Sat", hours: 6.2, performance: 0.93 },
        { day: "Sun", hours: 4.5, performance: 0.88 },
      ],
      insights: [
        {
          type: "peak_performance",
          message: "Your best performance occurs during afternoon sessions (1-4 PM) with an average score of 91.2%.",
        },
        {
          type: "improvement",
          message: "Your performance has improved by 15.3% over the last month.",
        },
        {
          type: "efficiency",
          message: "Optimal session length for you is 2.5 hours with 25-minute breaks.",
        },
      ],
    },
  }

  return NextResponse.json({
    success: true,
    data: analyticsData[period as keyof typeof analyticsData] || analyticsData.week,
  })
}
