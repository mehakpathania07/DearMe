import { motion, useReducedMotion } from 'motion/react';
import { Heart, Sparkles, Star } from 'lucide-react';

export function AmbientBackdrop() {
  const prefersReduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {/* Warm glowing light orbs */}
      <div
        className={`absolute -top-24 -left-20 w-[380px] h-[380px] rounded-full bg-[#F5DDE3]/55 blur-3xl ${
          prefersReduced ? '' : 'animate-orb-drift'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full bg-[#E5DDF0]/45 blur-3xl ${
          prefersReduced ? '' : 'animate-orb-drift'
        }`}
        style={{ animationDelay: '-5s' }}
      />
      <div
        className={`absolute -bottom-24 left-1/4 w-[340px] h-[340px] rounded-full bg-[#CCD8C3]/35 blur-3xl ${
          prefersReduced ? '' : 'animate-orb-drift'
        }`}
        style={{ animationDelay: '-9s' }}
      />

      {/* Subtle floating hearts, stars, and tiny sparkles */}
      <div
        className={`hidden sm:block absolute top-[14%] right-[12%] text-[#C98D9B]/35 ${
          prefersReduced ? '' : 'animate-sparkle-drift'
        }`}
      >
        <Sparkles className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div
        className={`hidden md:block absolute top-[46%] left-[18%] text-[#C98D9B]/30 ${
          prefersReduced ? '' : 'animate-sparkle-drift'
        }`}
        style={{ animationDelay: '-2.2s' }}
      >
        <Heart className="w-4 h-4 fill-[#F5DDE3]/60" strokeWidth={1.5} />
      </div>
      <div
        className={`hidden sm:block absolute bottom-[18%] right-[18%] text-[#95A18E]/40 ${
          prefersReduced ? '' : 'animate-sparkle-drift'
        }`}
        style={{ animationDelay: '-3.8s' }}
      >
        <Star className="w-4 h-4 fill-[#DAE6D1]/50" strokeWidth={1.5} />
      </div>
      <div
        className={`hidden lg:block absolute top-[72%] left-[8%] text-[#C98D9B]/28 ${
          prefersReduced ? '' : 'animate-sparkle-drift'
        }`}
        style={{ animationDelay: '-1.2s' }}
      >
        <Sparkles className="w-4 h-4" strokeWidth={1.5} />
      </div>
    </div>
  );
}

interface SparkleBurstProps {
  active: boolean;
}

const BURST_POINTS = [
  { x: -36, y: -28, delay: 0, kind: 'sparkle' },
  { x: 38, y: -26, delay: 0.04, kind: 'heart' },
  { x: -48, y: 6, delay: 0.08, kind: 'star' },
  { x: 48, y: 10, delay: 0.05, kind: 'sparkle' },
  { x: 0, y: -42, delay: 0.02, kind: 'heart' },
  { x: -22, y: 26, delay: 0.09, kind: 'star' },
  { x: 24, y: 28, delay: 0.07, kind: 'sparkle' },
] as const;

export function SparkleBurst({ active }: SparkleBurstProps) {
  const prefersReduced = useReducedMotion();
  if (!active || prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible z-30"
    >
      {BURST_POINTS.map((pt, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.15, 0.7],
            x: pt.x,
            y: pt.y,
          }}
          transition={{ duration: 0.85, delay: pt.delay, ease: 'easeOut' }}
          className="absolute text-[#C98D9B]"
        >
          {pt.kind === 'heart' ? (
            <Heart className="w-4 h-4 fill-[#F5DDE3]" />
          ) : pt.kind === 'star' ? (
            <Star className="w-3.5 h-3.5 fill-[#DAE6D1] text-[#6D7E66]" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#83505C]" />
          )}
        </motion.div>
      ))}
    </div>
  );
}
