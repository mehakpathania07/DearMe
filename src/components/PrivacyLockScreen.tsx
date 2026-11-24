import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Delete, Lock } from 'lucide-react';
import { AmbientBackdrop } from './AmbientBackdrop';
import { WashiTape } from './ScrapbookDecor';

interface PrivacyLockScreenProps {
  expectedPin: string;
  onUnlock: () => void;
}

export function PrivacyLockScreen({
  expectedPin,
  onUnlock,
}: PrivacyLockScreenProps) {
  const [digits, setDigits] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shakeKey, setShakeKey] = useState(0);
  const prefersReduced = useReducedMotion();

  const submitPin = (candidate: string) => {
    if (candidate === expectedPin) {
      setErrorMsg('');
      setDigits('');
      onUnlock();
    } else {
      setErrorMsg('That PIN did not match. Please try again.');
      setShakeKey((k) => k + 1);
      setDigits('');
    }
  };

  const handleDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setErrorMsg('');
    if (next.length === 4) {
      setTimeout(() => submitPin(next), 140);
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

  return (
    <div className="relative min-h-screen w-full bg-[#F7F0E5] paper-grain flex items-center justify-center p-5">
      <AmbientBackdrop />

      <motion.div
        key={shakeKey}
        initial={prefersReduced ? false : { opacity: 0, y: 12 }}
        animate={
          errorMsg && !prefersReduced
            ? { opacity: 1, y: 0, x: [-8, 8, -6, 6, 0] }
            : { opacity: 1, y: 0, x: 0 }
        }
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-sm bg-[#FFFAF3] rounded-3xl p-8 floating-shadow border border-[#E9DDCB] text-center"
      >
        <div className="flex justify-center -mt-11 mb-5">
          <WashiTape tone="blush" tilt="center" />
        </div>

        <div className="mx-auto w-14 h-14 rounded-full bg-[#F9E9ED] border border-[#C98D9B]/40 flex items-center justify-center text-[#83505C]">
          <Lock className="w-6 h-6" strokeWidth={1.8} />
        </div>

        <h1 className="mt-4 font-serif text-2xl font-semibold text-[#4A3B36]">
          DearMe ♡
        </h1>
        <p className="mt-1.5 text-sm text-[#76635B]">
          Enter your 4-digit PIN to open your diary.
        </p>

        {/* 4-dot PIN indicator */}
        <div
          className="mt-6 flex items-center justify-center gap-4"
          aria-label={`Entered ${digits.length} of 4 digits`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < digits.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  filled
                    ? 'bg-[#C98D9B] scale-110 shadow-[0_0_0_4px_rgba(245,221,227,0.7)]'
                    : 'bg-transparent border border-[#837376]/45'
                }`}
              />
            );
          })}
        </div>

        <div className="mt-3 min-h-[20px]">
          {errorMsg && (
            <p className="text-xs text-[#BA1A1A] font-medium" role="alert">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Numeric keypad */}
        <div className="mt-4 grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {keys.map((k, idx) => {
            if (k === '') {
              return <div key={`empty-${idx}`} aria-hidden="true" />;
            }
            if (k === 'back') {
              return (
                <button
                  key="back"
                  type="button"
                  onClick={handleBackspace}
                  aria-label="Delete last digit"
                  className="h-14 rounded-full flex items-center justify-center text-[#76635B] hover:bg-[#F5DDE3]/60 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#83505C]"
                >
                  <Delete className="w-5 h-5" />
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleDigit(k)}
                className="h-14 rounded-full bg-[#FAF3E8] hover:bg-[#F5DDE3] border border-[#E9DDCB] font-serif text-xl font-medium text-[#4A3B36] active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-[#83505C]"
              >
                {k}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-[#76635B]/85 leading-relaxed">
          Client-side PIN lock for personal privacy. Diary entries stay on this browser.
        </p>
      </motion.div>
    </div>
  );
}
