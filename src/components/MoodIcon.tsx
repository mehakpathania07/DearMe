import {
  CloudRain,
  Flower2,
  Heart,
  Leaf,
  Moon,
  Sparkles,
  Sun,
  Wind,
} from 'lucide-react';
import type { MoodType } from '../types/diary';

interface MoodIconProps {
  mood: MoodType;
  className?: string;
}

export function MoodIcon({ mood, className = 'w-4 h-4' }: MoodIconProps) {
  switch (mood) {
    case 'happy':
      return <Sun className={className} strokeWidth={1.85} />;
    case 'sad':
      return <CloudRain className={className} strokeWidth={1.85} />;
    case 'calm':
      return <Leaf className={className} strokeWidth={1.85} />;
    case 'excited':
      return <Sparkles className={className} strokeWidth={1.85} />;
    case 'anxious':
      return <Wind className={className} strokeWidth={1.85} />;
    case 'tired':
      return <Moon className={className} strokeWidth={1.85} />;
    case 'grateful':
      return <Flower2 className={className} strokeWidth={1.85} />;
    case 'loved':
      return <Heart className={className} strokeWidth={1.85} />;
  }
}
