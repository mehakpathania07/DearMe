import type {
  DearMeStore,
  DiaryEntry,
  FutureLetter,
  GratitudeNote,
  MemoryItem,
  MoodRecord,
  MoodType,
  PrivacySettings,
} from '../types/diary';

const STORAGE_KEYS = {
  INITIALIZED: 'dearme_initialized_v1',
  ENTRIES: 'dearme_entries_v1',
  MOODS: 'dearme_moods_v1',
  MEMORIES: 'dearme_memories_v1',
  LETTERS: 'dearme_letters_v1',
  GRATITUDES: 'dearme_gratitudes_v1',
  PRIVACY: 'dearme_privacy_v1',
} as const;

export interface MoodMeta {
  id: MoodType;
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  dotColor: string;
  barColor: string;
  description: string;
}

export const MOOD_OPTIONS: MoodMeta[] = [
  {
    id: 'happy',
    label: 'Happy',
    bgClass: 'bg-[#F9E9ED]',
    borderClass: 'border-[#C98D9B]/50',
    textClass: 'text-[#683945]',
    dotColor: '#C98D9B',
    barColor: '#E5A9B7',
    description: 'Sunlit & light-hearted',
  },
  {
    id: 'calm',
    label: 'Calm',
    bgClass: 'bg-[#DAE6D1]',
    borderClass: 'border-[#95A18E]/50',
    textClass: 'text-[#2D3829]',
    dotColor: '#95A18E',
    barColor: '#B5C5AB',
    description: 'Quiet, grounded & unhurried',
  },
  {
    id: 'loved',
    label: 'Loved',
    bgClass: 'bg-[#F5DDE3]',
    borderClass: 'border-[#C98D9B]/60',
    textClass: 'text-[#532733]',
    dotColor: '#D67D92',
    barColor: '#DF95A6',
    description: 'Held in warmth & affection',
  },
  {
    id: 'grateful',
    label: 'Grateful',
    bgClass: 'bg-[#CCD8C3]',
    borderClass: 'border-[#566251]/40',
    textClass: 'text-[#2D3829]',
    dotColor: '#6D7E66',
    barColor: '#95A68C',
    description: 'Thankful for little things',
  },
  {
    id: 'excited',
    label: 'Excited',
    bgClass: 'bg-[#F6E6D4]',
    borderClass: 'border-[#C79C74]/50',
    textClass: 'text-[#5B3E28]',
    dotColor: '#D2A176',
    barColor: '#E2B995',
    description: 'Sparkling with anticipation',
  },
  {
    id: 'tired',
    label: 'Tired',
    bgClass: 'bg-[#E9DDCB]',
    borderClass: 'border-[#837376]/40',
    textClass: 'text-[#4A3B36]',
    dotColor: '#A49386',
    barColor: '#C5B5A6',
    description: 'Ready for tea & soft blankets',
  },
  {
    id: 'anxious',
    label: 'Anxious',
    bgClass: 'bg-[#E5DDF0]',
    borderClass: 'border-[#9484B0]/50',
    textClass: 'text-[#44385A]',
    dotColor: '#9C8CB9',
    barColor: '#B8AAD1',
    description: 'Mind swirling, needing gentleness',
  },
  {
    id: 'sad',
    label: 'Sad',
    bgClass: 'bg-[#E2E6EC]',
    borderClass: 'border-[#8692A3]/50',
    textClass: 'text-[#39424E]',
    dotColor: '#8B98AB',
    barColor: '#A9B4C4',
    description: 'Soft rain, space to feel',
  },
];

export const MOOD_MAP: Record<MoodType, MoodMeta> = MOOD_OPTIONS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<MoodType, MoodMeta>,
);

export const DAILY_QUOTES: { text: string; author: string }[] = [
  {
    text: 'Write what should not be forgotten, even if it is only the way the afternoon light fell across your desk.',
    author: 'Isabel Allende, adapted',
  },
  {
    text: 'Slow days are not empty days; they are the pages where your heart catches its breath.',
    author: 'DearMe Keepsake Note',
  },
  {
    text: 'Keep a small notebook for the quiet wonders that no one else saw happen.',
    author: 'Journal Margin',
  },
  {
    text: 'You do not have to bloom all at once. Even pressed flowers keep their softness in a book.',
    author: 'Pressed Botanicals',
  },
  {
    text: 'One honest sentence a day is enough to build a home inside your own story.',
    author: 'DearMe Keepsake Note',
  },
  {
    text: 'Tend to your inner garden with the same patience you give to someone you love.',
    author: 'Vintage Almanac',
  },
];

export function getDailyQuote(date: Date = new Date()): { text: string; author: string } {
  const dayIndex =
    date.getFullYear() * 366 + date.getMonth() * 31 + date.getDate();
  return DAILY_QUOTES[dayIndex % DAILY_QUOTES.length];
}

export function getTodayISO(): string {
  const now = new Date();
  return toLocalISO(now);
}

export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftDaysISO(baseDate: Date, deltaDays: number): string {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + deltaDays);
  return toLocalISO(d);
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatFriendlyDate(iso: string): string {
  const d = parseLocalDate(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string): string {
  const d = parseLocalDate(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  pinEnabled: false,
  pinCode: '1234',
  autoLockMinutes: 0,
};

function createSampleData(): Omit<DearMeStore, 'privacy'> {
  const today = new Date();
  const todayISO = toLocalISO(today);
  const yesterdayISO = shiftDaysISO(today, -1);
  const threeDaysAgoISO = shiftDaysISO(today, -3);
  const fiveDaysAgoISO = shiftDaysISO(today, -5);
  const nextMonthISO = shiftDaysISO(today, 30);

  const entries: DiaryEntry[] = [
    {
      id: 'sample_entry_1',
      title: 'Sample: Chamomile Tea & Soft Rain',
      content:
        'This is a clearly labelled sample entry to show how your diary pages look.\n\nThe afternoon light turned pale rose through the curtains while rain tapped gently on the windowsill. I made a mug of chamomile tea and lingered over two quiet chapters before evening.\n\nFeel free to edit, favourite, or clear sample items anytime.',
      date: yesterdayISO,
      createdAt: new Date(today.getTime() - 86400000).toISOString(),
      updatedAt: new Date(today.getTime() - 86400000).toISOString(),
      mood: 'calm',
      isFavourite: true,
      isSample: true,
    },
    {
      id: 'sample_entry_2',
      title: 'Sample: Pressed Petals in My Coat Pocket',
      content:
        'A small sample keepsake page.\n\nWalked past the corner florist on the way home and tucked a stray pink carnation into my notebook. Little rituals make ordinary weekdays feel worth remembering.',
      date: threeDaysAgoISO,
      createdAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
      updatedAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
      mood: 'grateful',
      isFavourite: false,
      isSample: true,
    },
  ];

  const moods: MoodRecord[] = [
    {
      id: 'sample_mood_1',
      date: yesterdayISO,
      mood: 'calm',
      note: 'Sample: Peaceful evening with warm tea and quiet music.',
      createdAt: new Date(today.getTime() - 86400000).toISOString(),
      isSample: true,
    },
    {
      id: 'sample_mood_2',
      date: threeDaysAgoISO,
      mood: 'grateful',
      note: 'Sample: Slow morning walk under pale sunshine.',
      createdAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
      isSample: true,
    },
    {
      id: 'sample_mood_3',
      date: fiveDaysAgoISO,
      mood: 'happy',
      note: 'Sample: Caught up with an old friend over pastries.',
      createdAt: new Date(today.getTime() - 86400000 * 5).toISOString(),
      isSample: true,
    },
  ];

  const memories: MemoryItem[] = [
    {
      id: 'sample_mem_1',
      caption: 'Sample: Fresh peonies on the Sunday table',
      date: yesterdayISO,
      motif: 'blossom',
      isFavourite: true,
      createdAt: new Date(today.getTime() - 86400000).toISOString(),
      isSample: true,
    },
    {
      id: 'sample_mem_2',
      caption: 'Sample: Golden hour tea beside open pages',
      date: fiveDaysAgoISO,
      motif: 'tea',
      isFavourite: false,
      createdAt: new Date(today.getTime() - 86400000 * 5).toISOString(),
      isSample: true,
    },
  ];

  const letters: FutureLetter[] = [
    {
      id: 'sample_letter_ready',
      title: 'Sample: A Gentle Hello (Ready to Open)',
      body: 'Dear Me,\n\nI hope today finds you speaking kindly to yourself. Remember how much effort you put into building calm habits—pause for a deep breath, pour something warm to drink, and celebrate how far you have come.\n\nWith warmth,\nPast You ♡',
      writtenDate: fiveDaysAgoISO,
      openDate: todayISO,
      isFavourite: false,
      isSample: true,
    },
    {
      id: 'sample_letter_sealed',
      title: 'Sample: Next Month Wishes (Sealed)',
      body: 'Dear Future Me,\n\nBy the time this wax seal breaks, a whole month will have unfolded. I hope you kept at least one small promise to your own joy.\n\nAlways rooting for you ♡',
      writtenDate: todayISO,
      openDate: nextMonthISO,
      isFavourite: false,
      isSample: true,
    },
  ];

  const gratitudes: GratitudeNote[] = [
    {
      id: 'sample_grat_1',
      date: todayISO,
      text: 'Sample: Warm morning sunlight spilling onto clean sheets.',
      createdAt: today.toISOString(),
      isSample: true,
    },
    {
      id: 'sample_grat_2',
      date: yesterdayISO,
      text: 'Sample: A thoughtful message that arrived right when I needed it.',
      createdAt: new Date(today.getTime() - 86400000).toISOString(),
      isSample: true,
    },
  ];

  return { entries, moods, memories, letters, gratitudes };
}

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Unable to persist DearMe data to localStorage:', err);
  }
}

export function loadInitialStore(): DearMeStore {
  const alreadyInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';

  if (!alreadyInitialized) {
    const sample = createSampleData();
    safeWriteJSON(STORAGE_KEYS.ENTRIES, sample.entries);
    safeWriteJSON(STORAGE_KEYS.MOODS, sample.moods);
    safeWriteJSON(STORAGE_KEYS.MEMORIES, sample.memories);
    safeWriteJSON(STORAGE_KEYS.LETTERS, sample.letters);
    safeWriteJSON(STORAGE_KEYS.GRATITUDES, sample.gratitudes);
    safeWriteJSON(STORAGE_KEYS.PRIVACY, DEFAULT_PRIVACY);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return { ...sample, privacy: DEFAULT_PRIVACY };
  }

  return {
    entries: safeReadJSON<DiaryEntry[]>(STORAGE_KEYS.ENTRIES, []),
    moods: safeReadJSON<MoodRecord[]>(STORAGE_KEYS.MOODS, []),
    memories: safeReadJSON<MemoryItem[]>(STORAGE_KEYS.MEMORIES, []),
    letters: safeReadJSON<FutureLetter[]>(STORAGE_KEYS.LETTERS, []),
    gratitudes: safeReadJSON<GratitudeNote[]>(STORAGE_KEYS.GRATITUDES, []),
    privacy: safeReadJSON<PrivacySettings>(STORAGE_KEYS.PRIVACY, DEFAULT_PRIVACY),
  };
}

export function saveEntries(entries: DiaryEntry[]): void {
  safeWriteJSON(STORAGE_KEYS.ENTRIES, entries);
}

export function saveMoods(moods: MoodRecord[]): void {
  safeWriteJSON(STORAGE_KEYS.MOODS, moods);
}

export function saveMemories(memories: MemoryItem[]): void {
  safeWriteJSON(STORAGE_KEYS.MEMORIES, memories);
}

export function saveLetters(letters: FutureLetter[]): void {
  safeWriteJSON(STORAGE_KEYS.LETTERS, letters);
}

export function saveGratitudes(gratitudes: GratitudeNote[]): void {
  safeWriteJSON(STORAGE_KEYS.GRATITUDES, gratitudes);
}

export function savePrivacySettings(privacy: PrivacySettings): void {
  safeWriteJSON(STORAGE_KEYS.PRIVACY, privacy);
}

export async function compressImageFile(file: File, maxDim = 960, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
