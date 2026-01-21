# 🚀 Discipline Tracker – Habit & Streak Management App

A modern **habit tracking web application** built with **Next.js, Firebase, and Firestore** that helps users build discipline through daily habits, streaks, and motivational feedback.  
Supports **multi-device sync** (laptop + mobile) with secure authentication.

---

## 🌟 Features

### 🔐 Authentication
- Google Sign-In using **Firebase Authentication**
- Secure route protection (unauthenticated users redirected to login)

### 🧠 Habit Management
- Add, delete, and toggle daily habits
- Track habit streaks automatically
- Data stored **per user** in Firestore (no localStorage dependency)

### 🔥 Streak-Based Motivation System
- **Day 1–30** → Fire levels 🔥 (visual motivation)
- **Day 31–60** → 🎉 Confetti celebration on milestones
- **Day 61+** → 🏆 Badge system (coming next)

### 🔄 Real-Time Sync
- Same account works across **mobile & desktop**
- Changes instantly reflect across devices

### 🎨 UI & UX
- Clean, responsive UI
- Bottom navigation for easy access
- Designed for daily usage & consistency

---

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript
- **UI**: Tailwind CSS, ShadCN UI, Lucide Icons
- **Backend**: Firebase
  - Authentication (Google Sign-In)
  - Firestore Database
- **Animations**: canvas-confetti
- **Deployment**: Vercel

---

## 📂 Project Structure

