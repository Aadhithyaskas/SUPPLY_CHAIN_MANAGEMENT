import { useState, useEffect, useRef, useCallback } from 'react';

const useOTPTimer = (initialTime = 60) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setIsActive(true);
    setCanResend(false);
    setTimeLeft(initialTime);
  }, [initialTime, stopTimer]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(initialTime);
    setCanResend(true);
  }, [initialTime, stopTimer]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft, stopTimer]);

  // Format time as MM:SS
  const formattedTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    formattedTime: formattedTime(),
    isActive,
    canResend,
    startTimer,
    stopTimer,
    resetTimer
  };
};

export default useOTPTimer;