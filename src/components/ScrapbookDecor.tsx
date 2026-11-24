import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import type { MemoryMotif } from '../types/diary';

interface WashiTapeProps {
  tone?: 'beige' | 'sage' | 'blush' | 'lavender';
  tilt?: 'left' | 'right' | 'center';
  className?: string;
}

export function WashiTape({
  tone = 'beige',
  tilt = 'center',
  className = '',
}: WashiTapeProps) {
  const toneClasses: Record<NonNullable<WashiTapeProps['tone']>, string> = {
    beige: 'bg-[#E9DDCB]',
    sage: 'bg-[#CCD8C3]',
    blush: 'bg-[#F5DDE3]',
    lavender: 'bg-[#E5DDF0]',
  };

  const tiltClasses: Record<NonNullable<WashiTapeProps['tilt']>, string> = {
    left: '-rotate-2',
    right: 'rotate-2',
    center: '-rotate-1',
  };

  return (
    <div
      aria-hidden="true"
      className={`washi-tape h-5 w-24 ${toneClasses[tone]} ${tiltClasses[tilt]} ${className}`}
    />
  );
}

interface PaperCardProps {
  children: ReactNode;
  variant?: 'cream' | 'pink' | 'sage' | 'lavender';
  className?: string;
}

export function PaperCard({
  children,
  variant = 'cream',
  className = '',
}: PaperCardProps) {
  const bgClasses: Record<NonNullable<PaperCardProps['variant']>, string> = {
    cream: 'bg-[#FFFAF3]',
    pink: 'bg-[#F9E9ED]',
    sage: 'bg-[#F2F6EE]',
    lavender: 'bg-[#F3EFF9]',
  };

  return (
    <div
      className={`${bgClasses[variant]} rounded-2xl paper-shadow border border-[#E9DDCB]/60 ${className}`}
    >
      {children}
    </div>
  );
}

export function DiaryIllustration({ className = '' }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={`relative select-none ${
        prefersReduced ? '' : 'animate-float-slow'
      } ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 280 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_10px_22px_rgba(118,99,91,0.12)]"
      >
        {/* Soft blush aura behind diary */}
        <ellipse cx="140" cy="128" rx="112" ry="74" fill="#F5DDE3" fillOpacity="0.55" />

        {/* Pressed leaf sprig tucked behind */}
        <path
          d="M214 54 C228 70, 230 92, 212 114"
          stroke="#6D7E66"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse
          cx="228"
          cy="68"
          rx="10"
          ry="5"
          transform="rotate(-24 228 68)"
          fill="#CCD8C3"
        />
        <ellipse
          cx="234"
          cy="88"
          rx="11"
          ry="5.5"
          transform="rotate(14 234 88)"
          fill="#BAC9AF"
        />
        <ellipse
          cx="210"
          cy="74"
          rx="9"
          ry="4.5"
          transform="rotate(-55 210 74)"
          fill="#DAE6D1"
        />

        {/* Linen book hard cover */}
        <rect
          x="36"
          y="58"
          width="202"
          height="136"
          rx="14"
          fill="#C98D9B"
        />
        <rect
          x="36"
          y="58"
          width="202"
          height="136"
          rx="14"
          stroke="#83505C"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        {/* Open cream pages */}
        <path
          d="M44 64 C88 54, 126 58, 137 68 L137 184 C122 176, 86 172, 44 182 Z"
          fill="#FFFAF3"
          stroke="#E9DDCB"
          strokeWidth="1.2"
        />
        <path
          d="M230 64 C186 54, 148 58, 137 68 L137 184 C152 176, 188 172, 230 182 Z"
          fill="#FFFDF9"
          stroke="#E9DDCB"
          strokeWidth="1.2"
        />

        {/* Center spine shadow */}
        <path
          d="M137 68 L137 184"
          stroke="#D8C1C7"
          strokeWidth="2"
        />

        {/* Dotted lines on left page */}
        <line x1="58" y1="88" x2="122" y2="85" stroke="#E9DDCB" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="58" y1="104" x2="122" y2="101" stroke="#E9DDCB" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="58" y1="120" x2="112" y2="117" stroke="#E9DDCB" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="58" y1="136" x2="122" y2="133" stroke="#E9DDCB" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="58" y1="152" x2="106" y2="150" stroke="#E9DDCB" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Mini polaroid taped on right page */}
        <g transform="rotate(3 184 118)">
          <rect
            x="154"
            y="84"
            width="58"
            height="68"
            rx="4"
            fill="#FFFFFF"
            stroke="#E9DDCB"
            strokeWidth="1.2"
          />
          <rect x="160" y="90" width="46" height="40" rx="2" fill="#F9E9ED" />
          {/* Little flower inside mini polaroid */}
          <circle cx="183" cy="110" r="6" fill="#F6B5C4" />
          <circle cx="183" cy="110" r="2.5" fill="#FFF8EF" />
          <path d="M183 116 L183 126" stroke="#6D7E66" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        {/* Washi tape on mini polaroid */}
        <rect
          x="170"
          y="78"
          width="26"
          height="9"
          rx="1.5"
          transform="rotate(-4 170 78)"
          fill="#CCD8C3"
          fillOpacity="0.9"
        />

        {/* Ribbon bookmark */}
        <path
          d="M126 178 L126 212 L134 205 L142 212 L142 178 Z"
          fill="#83505C"
        />

        {/* Cute heart seal sticker on left page */}
        <path
          d="M84 166 C84 162.5 89 161 91 164.5 C93 161 98 162.5 98 166 C98 170 91 174 91 174 C91 174 84 170 84 166 Z"
          fill="#C98D9B"
        />

        {/* Fountain pen resting diagonally */}
        <g transform="rotate(-32 76 196)">
          <rect x="34" y="182" width="76" height="10" rx="5" fill="#F5DDE3" stroke="#83505C" strokeWidth="1.2" />
          <path d="M110 183 L123 187 L110 191 Z" fill="#E9DDCB" stroke="#76635B" strokeWidth="1" />
          <circle cx="118" cy="187" r="1.2" fill="#4A3B36" />
        </g>

        {/* Tiny floating sparkles */}
        <path
          d="M52 38 L54 44 L60 46 L54 48 L52 54 L50 48 L44 46 L50 44 Z"
          fill="#C98D9B"
          fillOpacity="0.7"
        />
        <circle cx="242" cy="140" r="3" fill="#CCD8C3" />
        <circle cx="250" cy="154" r="2" fill="#C98D9B" fillOpacity="0.6" />
      </svg>
    </div>
  );
}

export function MemoryMotifArtwork({ motif = 'blossom' }: { motif?: MemoryMotif }) {
  if (motif === 'tea') {
    return (
      <svg viewBox="0 0 240 200" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="200" fill="#FAF3E8" />
        <circle cx="182" cy="48" r="28" fill="#F5DDE3" fillOpacity="0.7" />
        <ellipse cx="120" cy="148" rx="64" ry="12" fill="#E9DDCB" />
        <path
          d="M78 92 H162 V124 C162 142 144 150 120 150 C96 150 78 142 78 124 Z"
          fill="#FFFAF3"
          stroke="#C98D9B"
          strokeWidth="2.5"
        />
        <path
          d="M162 100 C178 100 178 124 162 124"
          fill="none"
          stroke="#C98D9B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="120" cy="92" rx="42" ry="8" fill="#F5DDE3" stroke="#C98D9B" strokeWidth="2" />
        <path d="M106 72 Q102 60 108 50" stroke="#95A18E" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M124 68 Q128 56 122 44" stroke="#95A18E" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="66" cy="146" r="8" fill="#CCD8C3" />
      </svg>
    );
  }

  if (motif === 'sunset') {
    return (
      <svg viewBox="0 0 240 200" className="w-full h-full" aria-hidden="true">
        <defs>
          <linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5DDE3" />
            <stop offset="55%" stopColor="#F9E9ED" />
            <stop offset="100%" stopColor="#E9DDCB" />
          </linearGradient>
        </defs>
        <rect width="240" height="200" fill="url(#skyWarm)" />
        <circle cx="120" cy="108" r="38" fill="#F6B5C4" fillOpacity="0.85" />
        <path d="M0 144 Q64 128 120 140 T240 136 L240 200 L0 200 Z" fill="#CCD8C3" />
        <path d="M0 162 Q88 150 160 164 T240 158 L240 200 L0 200 Z" fill="#95A18E" fillOpacity="0.6" />
        <path d="M52 54 Q66 44 82 54" stroke="#83505C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M84 56 Q96 48 108 56" stroke="#83505C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (motif === 'starlight') {
    return (
      <svg viewBox="0 0 240 200" className="w-full h-full" aria-hidden="true">
        <rect width="240" height="200" fill="#E5DDF0" />
        <circle cx="152" cy="70" r="30" fill="#FFF8EF" />
        <circle cx="164" cy="64" r="26" fill="#E5DDF0" />
        <circle cx="62" cy="54" r="3" fill="#FFF8EF" />
        <circle cx="94" cy="40" r="2.2" fill="#FFF8EF" />
        <circle cx="192" cy="112" r="2.5" fill="#FFF8EF" />
        <path d="M68 122 L72 132 L82 136 L72 140 L68 150 L64 140 L54 136 L64 132 Z" fill="#FFFAF3" />
        <path d="M0 160 Q84 142 152 158 T240 154 L240 200 L0 200 Z" fill="#C98D9B" fillOpacity="0.38" />
      </svg>
    );
  }

  // blossom default
  return (
    <svg viewBox="0 0 240 200" className="w-full h-full" aria-hidden="true">
      <rect width="240" height="200" fill="#F9E9ED" />
      <circle cx="120" cy="96" r="56" fill="#FFFAF3" fillOpacity="0.7" />
      <path d="M120 170 C118 138, 122 116, 120 96" stroke="#6D7E66" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="98" cy="134" rx="18" ry="8" transform="rotate(-24 98 134)" fill="#CCD8C3" />
      <ellipse cx="142" cy="128" rx="18" ry="8" transform="rotate(22 142 128)" fill="#BAC9AF" />
      {/* Peony petals */}
      <circle cx="106" cy="84" r="18" fill="#F6B5C4" />
      <circle cx="134" cy="84" r="18" fill="#F6B5C4" />
      <circle cx="120" cy="68" r="18" fill="#F5DDE3" />
      <circle cx="120" cy="94" r="16" fill="#C98D9B" fillOpacity="0.85" />
      <circle cx="120" cy="83" r="8" fill="#FFF8EF" />
    </svg>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'rose';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3B36]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-[#FFFAF3] rounded-3xl p-6 floating-shadow border border-[#E9DDCB]"
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            id="confirm-modal-title"
            className="font-serif text-xl font-medium text-[#4A3B36]"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2.5 text-sm leading-relaxed text-[#76635B]">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-full text-sm font-medium text-[#4A3B36] bg-[#F5DDE3]/70 hover:bg-[#F5DDE3] transition-colors active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all active:scale-[0.98] ${
              tone === 'danger'
                ? 'bg-[#BA1A1A] hover:bg-[#93000A]'
                : 'bg-[#C98D9B] hover:bg-[#83505C]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
