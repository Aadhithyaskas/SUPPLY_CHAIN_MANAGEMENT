import { useState, useEffect, useRef } from 'react';

const useOTPTimer = (initialTime = 60) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    setIsActive(true);
    setCanResend(false);
    setTimeLeft(initialTime);
  };

  const stopTimer = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(initialTime);
    setCanResend(true);
  };

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
  }, [isActive, timeLeft]);

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