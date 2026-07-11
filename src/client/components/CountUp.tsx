import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function CountUp({ end, duration = 2 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number;
    let animationFrameId: number;
    const startValue = count; // Start from current count

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      // Easing function (easeOutQuad)
      const easeOut = progress * (2 - progress);
      const currentCount = Math.floor(startValue + easeOut * (end - startValue));
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(end); // Ensure we end exactly at 'end'
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
}
