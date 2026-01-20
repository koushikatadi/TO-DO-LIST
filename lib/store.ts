import { db } from "./firebase"
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore"

export const saveHabit = async (uid: string, habit: Habit) => {
  const ref = doc(db, "users", uid, "habits", habit.id)
  await setDoc(ref, habit)
}

export const getHabits = async (uid: string): Promise<Habit[]> => {
  const ref = collection(db, "users", uid, "habits")
  const snap = await getDocs(ref)

  return snap.docs.map((doc) => doc.data() as Habit)
}

export const updateHabit = async (uid: string, habit: Habit) => {
  const ref = doc(db, "users", uid, "habits", habit.id)
  await updateDoc(ref, habit as any)
}

export const deleteHabit = async (uid: string, habitId: string) => {
  const ref = doc(db, "users", uid, "habits", habitId)
  await deleteDoc(ref)
}



export interface Habit {
  id: string
  name: string
  streak: number
  completedToday: boolean
  createdDate: string
  lastCompletedDate: string | null
}


export interface DailyProgress {
  date: string
  completedCount: number
  totalHabits: number
  completionPercentage: number
}

export interface Reflection {
  date: string
  responses: {
    question: string
    answer: string
  }[]
}

export interface DailyData {
  date: string
  habits: Habit[]
  todaysFocus: string
  motivationalNote: string
  weeklyCompletionRate: number
}

// Habits Storage
export const habitsStore = {
  get: (): Habit[] => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("habits") || "[]")
    } catch {
      return []
    }
  },

  set: (habits: Habit[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("habits", JSON.stringify(habits))
    updateDailyProgress()
  },

  add: (habit: Habit) => {
    const habits = habitsStore.get()
    habitsStore.set([...habits, habit])
  },

  update: (id: string, updates: Partial<Habit>) => {
    const habits = habitsStore.get().map((h) => (h.id === id ? { ...h, ...updates } : h))
    habitsStore.set(habits)
  },

  delete: (id: string) => {
    const habits = habitsStore.get().filter((h) => h.id !== id)
    habitsStore.set(habits)
  },

  toggleCompletion: (id: string) => {
  const habits = habitsStore.get()
  const habit = habits.find((h) => h.id === id)
  if (!habit) return

  const today = new Date().toISOString().split("T")[0]

  // Prevent multiple completions in one day
  if (habit.lastCompletedDate === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  const newStreak =
    habit.lastCompletedDate === yesterdayStr ? habit.streak + 1 : 1

  habitsStore.update(id, {
    completedToday: true,
    streak: newStreak,
    lastCompletedDate: today,
  })
},

}

// Daily Progress Storage
export const progressStore = {
  get: (): DailyProgress[] => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("dailyProgress") || "[]")
    } catch {
      return []
    }
  },

  set: (progress: DailyProgress[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("dailyProgress", JSON.stringify(progress))
  },

  getToday: (): DailyProgress => {
    const today = new Date().toISOString().split("T")[0]
    const progress = progressStore.get()
    return (
      progress.find((p) => p.date === today) || {
        date: today,
        completedCount: 0,
        totalHabits: 0,
        completionPercentage: 0,
      }
    )
  },
}

// Reflection Storage
export const reflectionStore = {
  get: (): Reflection[] => {
    if (typeof window === "undefined") return []
    try {
      return JSON.parse(localStorage.getItem("reflections") || "[]")
    } catch {
      return []
    }
  },

  set: (reflections: Reflection[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem("reflections", JSON.stringify(reflections))
  },

  save: (reflection: Reflection) => {
    const reflections = reflectionStore.get()
    const index = reflections.findIndex((r) => r.date === reflection.date)

    if (index >= 0) {
      reflections[index] = reflection
    } else {
      reflections.push(reflection)
    }

    reflectionStore.set(reflections)
  },

  getToday: (prompts: string[]): Reflection => {
    const today = new Date().toISOString().split("T")[0]
    const reflections = reflectionStore.get()
    const todaysReflection = reflections.find((r) => r.date === today)

    return (
      todaysReflection || {
        date: today,
        responses: prompts.map((q) => ({ question: q, answer: "" })),
      }
    )
  },
}

// Update daily progress based on current habits
export const updateDailyProgress = () => {
  const today = new Date().toISOString().split("T")[0]
  const habits = habitsStore.get()
  const completedCount = habits.filter((h) => h.completedToday).length
  const totalHabits = habits.length
  const completionPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

  const progress = progressStore.get()
  const index = progress.findIndex((p) => p.date === today)

  const newProgress: DailyProgress = {
    date: today,
    completedCount,
    totalHabits,
    completionPercentage,
  }

  if (index >= 0) {
    progress[index] = newProgress
  } else {
    progress.push(newProgress)
  }

  progressStore.set(progress)
}

export const resetDailyHabitsIfNeeded = () => {
  const today = new Date().toISOString().split("T")[0]
  const habits = habitsStore.get()

  const updated = habits.map((h) => {
    if (h.lastCompletedDate !== today) {
      return { ...h, completedToday: false }
    }
    return h
  })

  habitsStore.set(updated)
}
