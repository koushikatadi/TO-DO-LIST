"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { TrendingUp, Calendar } from "lucide-react"

interface DailyProgress {
  date: string
  completedCount: number
  totalHabits: number
  completionPercentage: number
}

const getStoredProgress = (): DailyProgress[] => {
  try {
    return JSON.parse(localStorage.getItem("dailyProgress") || "[]")
  } catch {
    return []
  }
}

const generateWeekData = (): DailyProgress[] => {
  const progress = getStoredProgress()
  const today = new Date()
  const weekData: DailyProgress[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const dayProgress = progress.find((p) => p.date === dateStr)
    if (dayProgress) {
      weekData.push(dayProgress)
    } else {
      weekData.push({
        date: dateStr,
        completedCount: 0,
        totalHabits: 0,
        completionPercentage: 0,
      })
    }
  }

  return weekData
}

const getDayLabel = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export default function ProgressPage() {
  const [weekData, setWeekData] = useState<DailyProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setWeekData(generateWeekData())
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  const avgCompletion =
    weekData.length > 0
      ? Math.round(weekData.reduce((sum, day) => sum + day.completionPercentage, 0) / weekData.length)
      : 0

  const bestDay = weekData.reduce(
    (best, day) => (day.completionPercentage > best.completionPercentage ? day : best),
    weekData[0] || { completionPercentage: 0 },
  )

  const consistencyDays = weekData.filter((day) => day.completionPercentage === 100).length

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Weekly Progress</h1>
          <p className="text-muted-foreground">Track your consistency and completion rates</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{avgCompletion}%</div>
                <p className="text-xs text-muted-foreground mt-1">Weekly Average</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{consistencyDays}</div>
                <p className="text-xs text-muted-foreground mt-1">Perfect Days</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{bestDay.completionPercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1">Best Day</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              This Week's Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {weekData.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-border rounded relative h-32 flex items-end justify-center overflow-hidden group">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/50 transition-all hover:from-primary/90 hover:to-primary/60 rounded"
                      style={{ height: `${Math.max(4, day.completionPercentage)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded">
                      <span className="text-white text-xs font-bold">{day.completionPercentage}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground text-center">
                    {getDayLabel(day.date).split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Daily Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekData.map((day) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{getDayLabel(day.date)}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.completedCount} of {day.totalHabits} habits
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{day.completionPercentage}%</div>
                    <div className="w-16 h-1 bg-border rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${day.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {weekData.length > 0 && (
          <Card className="mt-8 bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-base">Week Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p>📊 Your weekly average is {avgCompletion}% - keep building momentum</p>
              <p>
                🎯 You had {consistencyDays} perfect day{consistencyDays !== 1 ? "s" : ""} this week
              </p>
              <p>💡 Focus on consistency over perfection - small improvements compound</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Navigation />
    </main>
  )
}
