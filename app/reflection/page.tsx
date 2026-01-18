"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { BookOpen, Send, ChevronDown } from "lucide-react"

interface Reflection {
  date: string
  responses: {
    question: string
    answer: string
  }[]
}

const reflectionPrompts = [
  "What went well today with your habits?",
  "What was challenging today?",
  "What's one thing you're proud of?",
  "What could you improve tomorrow?",
  "How did you feel about your progress?",
]

const getStoredReflections = (): Reflection[] => {
  try {
    return JSON.parse(localStorage.getItem("reflections") || "[]")
  } catch {
    return []
  }
}

const getTodaysReflection = (): Reflection => {
  const today = new Date().toISOString().split("T")[0]
  const reflections = getStoredReflections()
  const todaysReflection = reflections.find((r) => r.date === today)

  return (
    todaysReflection || {
      date: today,
      responses: reflectionPrompts.map((q) => ({ question: q, answer: "" })),
    }
  )
}

export default function ReflectionPage() {
  const [currentReflection, setCurrentReflection] = useState<Reflection | null>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setCurrentReflection(getTodaysReflection())
    setIsLoading(false)
  }, [])

  const saveReflection = () => {
    if (!currentReflection) return

    const reflections = getStoredReflections()
    const index = reflections.findIndex((r) => r.date === currentReflection.date)

    if (index >= 0) {
      reflections[index] = currentReflection
    } else {
      reflections.push(currentReflection)
    }

    localStorage.setItem("reflections", JSON.stringify(reflections))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const updateResponse = (index: number, answer: string) => {
    if (!currentReflection) return

    const updated = { ...currentReflection }
    updated.responses[index].answer = answer
    setCurrentReflection(updated)
  }

  if (isLoading || !currentReflection) return null

  const completedCount = currentReflection.responses.filter((r) => r.answer.trim().length > 0).length

  return (
    <main className="min-h-screen pb-24 bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Evening Reflection
          </h1>
          <p className="text-muted-foreground">
            {completedCount} of {reflectionPrompts.length} prompts answered
          </p>
        </div>

        {/* Reflection Prompts */}
        <div className="space-y-3 mb-6">
          {currentReflection.responses.map((response, index) => (
            <Card
              key={index}
              className={`transition-all cursor-pointer ${expandedIndex === index ? "ring-2 ring-primary/50" : ""}`}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <CardContent className="p-0">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{response.question}</p>
                    {response.answer && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{response.answer}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${
                      expandedIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Expanded Answer Area */}
                {expandedIndex === index && (
                  <div className="px-4 pb-4 border-t border-border">
                    <Textarea
  value={response.answer}
  onChange={(e) => updateResponse(index, e.target.value)}
  onClick={(e) => e.stopPropagation()}
  placeholder="Write your thoughts..."
  className="mt-3 min-h-24 resize-none"
/>

                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <Button
          onClick={saveReflection}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSaved ? "Saved!" : "Save Reflection"}
        </Button>

        {/* Past Reflections */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Past Reflections</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {getStoredReflections()
                  .slice()
                  .reverse()
                  .slice(0, 7)
                  .map((reflection) => {
                    const date = new Date(reflection.date + "T00:00:00")
                    const label = date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                    const answeredCount = reflection.responses.filter((r) => r.answer.trim().length > 0).length

                    return (
                      <div
                        key={reflection.date}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {answeredCount} of {reflectionPrompts.length} prompts answered
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-accent">
                            {Math.round((answeredCount / reflectionPrompts.length) * 100)}%
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reflection Tips */}
        <Card className="mt-8 bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="text-base">Reflection Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-foreground">
            <p>✓ Be honest - there's no judgment here</p>
            <p>✓ Write freely - this is for your growth</p>
            <p>✓ Celebrate wins - even small progress counts</p>
            <p>✓ Learn from setbacks - they're data, not failures</p>
          </CardContent>
        </Card>
      </div>

      <Navigation />
    </main>
  )
}
