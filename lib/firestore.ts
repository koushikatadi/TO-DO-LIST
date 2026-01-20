import { db } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"

/* ✅ HABIT TYPE (SOURCE OF TRUTH) */
export type Habit = {
  id: string
  name: string
  streak: number
  completedToday: boolean
  createdDate: string
}

/* Firestore document (no id inside doc) */
type HabitDoc = {
  name: string
  streak: number
  completedToday: boolean
  createdDate: string
}

/* 🔹 CREATE / SAVE HABIT */
export const saveHabit = async (uid: string, habit: Habit) => {
  const ref = doc(db, "users", uid, "habits", habit.id)
  await setDoc(ref, {
    name: habit.name,
    streak: habit.streak,
    completedToday: habit.completedToday,
    createdDate: habit.createdDate,
    updatedAt: serverTimestamp(),
  })
}

/* 🔹 GET ALL HABITS */
export const getHabits = async (uid: string): Promise<Habit[]> => {
  const ref = collection(db, "users", uid, "habits")
  const snap = await getDocs(ref)

  return snap.docs.map((d) => {
    const data = d.data() as HabitDoc
    return {
      id: d.id,
      ...data,
    }
  })
}

/* 🔹 UPDATE HABIT */
export const updateHabit = async (uid: string, habit: Habit) => {
  const ref = doc(db, "users", uid, "habits", habit.id)
  await updateDoc(ref, {
    name: habit.name,
    streak: habit.streak,
    completedToday: habit.completedToday,
  })
}

/* 🔹 DELETE HABIT */
export const deleteHabit = async (uid: string, habitId: string) => {
  const ref = doc(db, "users", uid, "habits", habitId)
  await deleteDoc(ref)
}
