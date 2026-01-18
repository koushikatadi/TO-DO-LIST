"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

interface Habit {
  id: string
  name: string
  streak: number
  completedToday: boolean
  createdDate: string
}

const getStoredHabits = (): Habit[] => {
  try {
    return JSON.parse(localStorage.getItem("habits") || "[]")
  } catch {
    return []
  }
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setHabits(getStoredHabits())
    setIsLoading(false)
  }, [])

  const saveHabits = (updated: Habit[]) => {
    setHabits(updated)
    localStorage.setItem("habits", JSON.stringify(updated))
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      createdDate: new Date().toISOString().split("T")[0],
    }

    saveHabits([...habits, newHabit])
    setNewHabitName("")
  }

  const toggleHabitCompletion = (id: string) => {
    const updated = habits.map((habit) => {
      if (habit.id === id) {
        const newCompleted = !habit.completedToday
        return {
          ...habit,
          completedToday: newCompleted,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
        }
      }
      return habit
    })
    saveHabits(updated)
  }

  const deleteHabit = (id: string) => {
    saveHabits(habits.filter((h) => h.id !== id))
  }

  if (isLoading) return null

  const completedCount = habits.filter((h) => h.completedToday).length

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Habits</h1>
          <p className="text-muted-foreground">
            {completedCount} of {habits.length} completed today
          </p>
        </div>

        {/* Add New Habit */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Morning Meditation, Exercise"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                className="flex-1"
              />
              <Button onClick={addHabit} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No habits yet. Create your first one above.</p>
              </CardContent>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="hover:bg-card/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                      >
                        {habit.completedToday ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"}`}
                        >
                          {habit.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Current streak: <span className="font-bold text-primary">{habit.streak}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="flex-shrink-0 text-destructive hover:text-destructive/80 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Section */}
        {habits.length > 0 && (
          <Card className="mt-8 bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="text-base">How This Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p>✓ Check off habits each day to build your streak</p>
              <p>✗ Unchecking a habit breaks your streak</p>
              <p>📍 Streaks reset when you miss a day</p>
              <p>💪 Consistency is more important than perfection</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Navigation />
    </main>
  )
}
