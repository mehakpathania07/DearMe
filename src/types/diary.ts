export type AppSection =
  | 'home'
  | 'diary'
  | 'mood'
  | 'memories'
  | 'calendar'
  | 'letters'
  | 'gratitude'
  | 'favourites';

export type MoodType =
  | 'happy'
  | 'sad'
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'tired'
  | 'grateful'
  | 'loved';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  mood?: MoodType;
  photoDataUrl?: string;
  isFavourite: boolean;
  isSample?: boolean;
}

export interface MoodRecord {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  note?: string;
  createdAt: string;
  isSample?: boolean;
}

export type MemoryMotif = 'blossom' | 'tea' | 'sunset' | 'starlight';

export interface MemoryItem {
  id: string;
  caption: string;
  date: string; // YYYY-MM-DD
  photoDataUrl?: string;
  motif?: MemoryMotif;
  isFavourite: boolean;
  createdAt: string;
  isSample?: boolean;
}

export interface FutureLetter {
  id: string;
  title: string;
  body: string;
  writtenDate: string; // YYYY-MM-DD
  openDate: string; // YYYY-MM-DD
  openedAt?: string;
  isFavourite?: boolean;
  isSample?: boolean;
}

export interface GratitudeNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string;
  isSample?: boolean;
}

export interface PrivacySettings {
  pinEnabled: boolean;
  pinCode: string;
  autoLockMinutes: 0 | 1 | 5 | 15;
}

export interface DearMeStore {
  entries: DiaryEntry[];
  moods: MoodRecord[];
  memories: MemoryItem[];
  letters: FutureLetter[];
  gratitudes: GratitudeNote[];
  privacy: PrivacySettings;
}
