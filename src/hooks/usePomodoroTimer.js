import { useState, useEffect, useRef } from 'react';

export const usePomodoroTimer = (initialMinutes = 25) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(initialMinutes);
  const intervalRef = useRef(null);

  // Update current duration when initial minutes changes
  useEffect(() => {
    setCurrentDuration(initialMinutes);
    setTimeLeft(initialMinutes * 60);
  }, [initialMinutes]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsPaused(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(!isPaused);
  };

  const reset = (minutes = currentDuration) => {
    const newDuration = minutes || currentDuration;
    setTimeLeft(newDuration * 60);
    setCurrentDuration(newDuration);
    setIsActive(false);
    setIsPaused(false);
  };

  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(currentDuration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = currentDuration * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  return {
    timeLeft,
    isActive,
    isPaused,
    start,
    pause,
    reset,
    stop,
    formatTime: () => formatTime(timeLeft),
    progress: getProgress(),
    isFinished: timeLeft === 0
  };
};
