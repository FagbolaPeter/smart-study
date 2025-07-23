"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/contexts/app-context"

interface NewSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewSessionModal({ open, onOpenChange }: NewSessionModalProps) {
  const { addStudySession } = useApp()
  const [formData, setFormData] = useState({
    subject: "",
    duration: 2,
    difficulty: 5,
    sessionDate: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject) return

    addStudySession({
      subject: formData.subject,
      duration: formData.duration,
      difficulty: formData.difficulty / 10, // Convert to 0-1 scale
      completed: false,
      sessionDate: formData.sessionDate,
      notes: formData.notes,
      breakFrequency: 0.4, // Default break frequency
    })

    // Reset form
    setFormData({
      subject: "",
      duration: 2,
      difficulty: 5,
      sessionDate: new Date().toISOString().split("T")[0],
      notes: "",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Study Session</DialogTitle>
          <DialogDescription>Plan your next study session with AI-powered recommendations.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mathematics">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="literature">Literature</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="economics">Economics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseFloat(e.target.value) || 2 })}
                min="0.5"
                max="8"
                step="0.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level: {formData.difficulty}/10</Label>
            <Slider
              value={[formData.difficulty]}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value[0] })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this study session..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.subject} className="w-full sm:w-auto">
              Create Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
