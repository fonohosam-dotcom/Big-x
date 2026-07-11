import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, ReactNode } from 'react';

export function CinematicHero({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityBackground = useTransform(scrollYProgress, [0, 1], [1, 0.2]);

  return (
    <div ref={ref} className="relative w-full overflow-hidden bg-slate-950 flex flex-col pt-8 pb-16 min-h-[600px]">
      {/* Animated Mesh Gradient Background */}
      <motion.div 
        style={{ y: yBackground, opacity: opacityBackground }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute inset-0 bg-slate-950 mix-blend-multiply z-10 opacity-60"></div>
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/40 blur-[120px]"
        ></motion.div>
        <motion.div 
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/30 blur-[150px]"
        ></motion.div>
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-purple-600/30 blur-[100px]"
        ></motion.div>
      </motion.div>

      {/* Content wrapper with relative z-index */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
