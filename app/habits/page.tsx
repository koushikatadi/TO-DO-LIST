"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { saveHabit, getHabits, deleteHabit, updateHabit, Habit } from "@/lib/firestore"
import { useRouter } from "next/navigation"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"

export default function HabitsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login")
      else setUser(u)
    })
    return () => unsub()
  }, [router])

  /* 🔥 LOAD HABITS */
  useEffect(() => {
    if (!user) return
    getHabits(user.uid).then(setHabits)
  }, [user])

  /* ➕ ADD HABIT */
  const addHabit = async () => {
    if (!newHabitName.trim() || !user) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      createdDate: new Date().toISOString().split("T")[0],
    }

    await saveHabit(user.uid, habit)
    setHabits([...habits, habit])
    setNewHabitName("")
  }

  /* ✅ TOGGLE */
  const toggleHabit = async (habit: Habit) => {
    if (!user) return

    const updated = {
      ...habit,
      completedToday: !habit.completedToday,
      streak: habit.completedToday ? habit.streak - 1 : habit.streak + 1,
    }

    await updateHabit(user.uid, updated)
    setHabits(habits.map((h) => (h.id === habit.id ? updated : h)))
  }

  /* 🗑 DELETE */
  const removeHabit = async (id: string) => {
    if (!user) return
    await deleteHabit(user.uid, id)
    setHabits(habits.filter((h) => h.id !== id))
  }

  return (
  <main className="min-h-screen pb-24 bg-background">
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Manage Habits</h1>
        <p className="text-muted-foreground">
          Build consistency one habit at a time
        </p>
      </div>

      {/* Add Habit */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Add New Habit</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="e.g. Morning walk, Reading, Meditation"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
          />
          <Button
            onClick={addHabit}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No habits yet. Add your first habit above 👆
              </p>
            </CardContent>
          </Card>
        ) : (
          habits.map((habit) => (
            <Card
              key={habit.id}
              className="transition-all hover:shadow-md hover:bg-card/80"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">

                  {/* Left Section */}
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleHabit(habit)}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          habit.completedToday
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {habit.name}
                      </p>

                      {/* 🔥 STREAK WITH FIRE LEVELS (1–30 DAYS) */}
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Streak:
                        <span className="font-bold text-primary flex items-center gap-1">
                          {habit.streak}

                          {habit.streak > 0 && habit.streak <= 30 && (
                            <span>
                              {habit.streak >= 15
                                ? "🔥🔥🔥"
                                : habit.streak >= 7
                                ? "🔥🔥"
                                : "🔥"}
                            </span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeHabit(habit.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      {habits.length > 0 && (
        <Card className="mt-8 bg-secondary/5 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✔ Complete habits daily to build streaks</p>
            <p>🔥 Fire rewards for first 30 days</p>
            <p>🎉 Bigger rewards unlock with consistency</p>
          </CardContent>
        </Card>
      )}

    </div>

    <Navigation />
  </main>
)


}
