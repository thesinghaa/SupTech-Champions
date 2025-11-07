import { useState, useEffect, useRef } from 'react';

interface CountUpOptions {
  duration?: number;
  easing?: (t: number) => number;
}

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

const useCountUp = (endValue: number, options: CountUpOptions = {}) => {
  const { duration = 2000, easing = easeOutExpo } = options;
  const [count, setCount] = useState(0);
  // FIX: Initialize useRef with null to provide an initial value.
  const frameRef = useRef<number | null>(null);
  // FIX: Initialize useRef with null to provide an initial value.
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const start = 0;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      // FIX: Use a strict null check to avoid issues where startTimeRef.current could be 0.
      if (startTimeRef.current === null) return;

      const elapsedTime = currentTime - startTimeRef.current;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easing(progress);
      
      const currentCount = Math.floor(easedProgress * (endValue - start) + start);
      setCount(currentCount);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue); // Ensure it ends on the exact value
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endValue, duration, easing]);

  return count;
};

export default useCountUp;
