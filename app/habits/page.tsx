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
    <main className="min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Habit</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="New habit"
            />
            <Button onClick={addHabit}>
              <Plus />
            </Button>
          </CardContent>
        </Card>

        {habits.map((habit) => (
          <Card key={habit.id} className="mb-3">
            <CardContent className="flex justify-between items-center p-4">
              <button onClick={() => toggleHabit(habit)}>
                {habit.completedToday ? <CheckCircle2 /> : <Circle />}
              </button>

              <span className={habit.completedToday ? "line-through" : ""}>
                {habit.name}
              </span>

              <button onClick={() => removeHabit(habit.id)}>
                <Trash2 />
              </button>
            </CardContent>
          </Card>
        ))}

      </div>
      <Navigation />
    </main>
  )
}
