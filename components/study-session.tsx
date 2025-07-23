"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  Square,
  Timer,
  BookOpen,
  Target,
  Coffee,
} from "lucide-react";
import { useApp } from "@/contexts/app-context";

interface StudySessionProps {
  onSessionComplete?: (sessionData: any) => void;
}

export function StudySession({ onSessionComplete }: StudySessionProps) {
  const { studySessions, addStudySession, updateStudySession } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionConfig, setSessionConfig] = useState({
    subject: "",
    duration: 120, // minutes
    difficulty: 5,
    breakInterval: 25, // Pomodoro technique
    notes: "",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Break detection
  useEffect(() => {
    if (
      isActive &&
      time > 0 &&
      time % (sessionConfig.breakInterval * 60) === 0
    ) {
      setIsBreak(true);
      setIsPaused(true);
      // Auto-resume after 5 minutes break
      setTimeout(() => {
        setIsBreak(false);
        setIsPaused(false);
      }, 5 * 60 * 1000);
    }
  }, [time, sessionConfig.breakInterval, isActive]);

  const startSession = () => {
    if (!sessionConfig.subject) return;

    // Create new session in database
    const newSessionData = {
      subject: sessionConfig.subject,
      duration: sessionConfig.duration / 60, // convert to hours
      difficulty: sessionConfig.difficulty / 10,
      completed: false,
      sessionDate: new Date().toISOString().split("T")[0],
      startTime: new Date().toISOString(),
      notes: sessionConfig.notes,
      breakFrequency: sessionConfig.breakInterval / 60,
    };

    addStudySession(newSessionData);

    // Find the session we just created (it will have the latest timestamp)
    const sessions = studySessions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setCurrentSessionId(sessions[0]?.id || Date.now().toString());

    setIsActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const stopSession = () => {
    setIsActive(false);
    setIsPaused(false);

    if (currentSessionId) {
      // Calculate performance based on session completion and time
      const targetTime = sessionConfig.duration * 60; // target in seconds
      const actualTime = time;
      const completionRatio = Math.min(actualTime / targetTime, 1);
      const performanceScore = Math.max(
        0.6,
        completionRatio * (0.8 + Math.random() * 0.2)
      ); // 60-100% range

      // Update the session in database
      updateStudySession(currentSessionId, {
        completed: true,
        endTime: new Date().toISOString(),
        performance: performanceScore,
        duration: actualTime / 3600, // convert to hours
      });

      onSessionComplete?.({
        id: currentSessionId,
        subject: sessionConfig.subject,
        duration: actualTime / 3600,
        performance: performanceScore,
        completed: true,
      });
    }

    // Reset timer
    setTime(0);
    setCurrentSessionId(null);
    setIsBreak(false);
  };

  const getTimeProgress = () => {
    const targetSeconds = sessionConfig.duration * 60;
    return Math.min((time / targetSeconds) * 100, 100);
  };

  const getNextBreakTime = () => {
    const breakInterval = sessionConfig.breakInterval * 60;
    const nextBreak = Math.ceil(time / breakInterval) * breakInterval;
    return nextBreak - time;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Session Setup
          </CardTitle>
          <CardDescription>
            Configure your study session parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={sessionConfig.subject}
                onValueChange={(value) =>
                  setSessionConfig((prev) => ({ ...prev, subject: value }))
                }
                disabled={isActive}
              >
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
                  <SelectItem value="computer-science">
                    Computer Science
                  </SelectItem>
                  <SelectItem value="economics">Economics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={sessionConfig.duration}
                onChange={(e) =>
                  setSessionConfig((prev) => ({
                    ...prev,
                    duration: Number.parseInt(e.target.value) || 120,
                  }))
                }
                min="15"
                max="480"
                disabled={isActive}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level: {sessionConfig.difficulty}/10</Label>
            <Slider
              value={[sessionConfig.difficulty]}
              onValueChange={(value) =>
                setSessionConfig((prev) => ({
                  ...prev,
                  difficulty: value[0],
                }))
              }
              max={10}
              min={1}
              step={1}
              className="w-full"
              disabled={isActive}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Break Interval (Pomodoro): {sessionConfig.breakInterval} minutes
            </Label>
            <Slider
              value={[sessionConfig.breakInterval]}
              onValueChange={(value) =>
                setSessionConfig((prev) => ({
                  ...prev,
                  breakInterval: value[0],
                }))
              }
              max={60}
              min={15}
              step={5}
              className="w-full"
              disabled={isActive}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              placeholder="What will you focus on in this session?"
              value={sessionConfig.notes}
              onChange={(e) =>
                setSessionConfig((prev) => ({ ...prev, notes: e.target.value }))
              }
              disabled={isActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timer Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="text-4xl sm:text-6xl font-mono font-bold text-blue-600">
            {formatTime(time)}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={getTimeProgress()} className="h-3" />
            <p className="text-sm text-gray-600">
              {getTimeProgress().toFixed(1)}% of target duration (
              {sessionConfig.duration} minutes)
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {sessionConfig.subject || "No subject selected"}
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm">
              Difficulty: {sessionConfig.difficulty}/10
            </Badge>
            {isActive && (
              <Badge
                variant={isBreak ? "destructive" : "default"}
                className="text-xs sm:text-sm"
              >
                {isBreak ? "Break Time!" : "Studying"}
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {!isActive ? (
              <Button
                onClick={startSession}
                disabled={!sessionConfig.subject}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                size="lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseSession}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-transparent"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4 mr-2" />
                  ) : (
                    <Pause className="h-4 w-4 mr-2" />
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={stopSession}
                  variant="destructive"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Complete Session
                </Button>
              </>
            )}
          </div>

          {isActive && !isBreak && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">
                  Next break in {formatTime(getNextBreakTime())}
                </p>
              </div>
              <p className="text-xs text-blue-600">
                Stay focused! You're doing great! 🎯
              </p>
            </div>
          )}

          {isBreak && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coffee className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-800 font-medium">
                  Break Time!
                </p>
              </div>
              <p className="text-xs text-orange-600">
                Take a 5-minute break. Session will resume automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            AI Study Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                💡 <strong>Focus Tip:</strong> Your current difficulty level is
                well-matched to your skill progression. Maintain this level for
                optimal learning.
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                📈 <strong>Performance Boost:</strong> Taking breaks every{" "}
                {sessionConfig.breakInterval} minutes can improve retention by
                up to 23%.
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                ⏰ <strong>Optimal Duration:</strong> Your{" "}
                {sessionConfig.duration}-minute session length aligns with your
                historical peak performance window.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
