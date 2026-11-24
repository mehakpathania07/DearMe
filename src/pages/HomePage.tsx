import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Feather,
  Heart,
  Image as ImageIcon,
  Quote,
} from 'lucide-react';
import type {
  AppSection,
  DiaryEntry,
  MemoryItem,
  MoodRecord,
  MoodType,
} from '../types/diary';
import {
  MOOD_MAP,
  MOOD_OPTIONS,
  formatShortDate,
  getDailyQuote,
  getTodayISO,
} from '../utils/storage';
import { MoodIcon } from '../components/MoodIcon';
import {
  DiaryIllustration,
  MemoryMotifArtwork,
  PaperCard,
  WashiTape,
} from '../components/ScrapbookDecor';

interface HomePageProps {
  entries: DiaryEntry[];
  moods: MoodRecord[];
  memories: MemoryItem[];
  hasSampleData: boolean;
  onNavigate: (section: AppSection) => void;
  onWriteToday: () => void;
  onOpenEntry: (entryId: string) => void;
  onSelectTodayMood: (mood: MoodType) => void;
  onClearSamples: () => void;
}

export function HomePage({
  entries,
  moods,
  memories,
  hasSampleData,
  onNavigate,
  onWriteToday,
  onOpenEntry,
  onSelectTodayMood,
  onClearSamples,
}: HomePageProps) {
  const prefersReduced = useReducedMotion();
  const now = new Date();
  const todayISO = getTodayISO();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const quote = getDailyQuote(now);

  const todayMoodRecord = moods.find((m) => m.date === todayISO);

  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const previewMemories = [...memories]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-8">
      {/* Sample preview gentle notice */}
      {hasSampleData && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#F9E9ED]/80 border border-[#C98D9B]/30 text-xs text-[#532733]">
          <span>
            Previewing a few clearly labelled sample pages so you can explore the scrapbook feel.
          </span>
          <button
            type="button"
            onClick={onClearSamples}
            className="font-medium underline underline-offset-4 hover:text-[#83505C] whitespace-nowrap shrink-0"
          >
            Clear sample items
          </button>
        </div>
      )}

      {/* Hero Welcome Scrapbook Spread */}
      <section className="relative bg-[#FFFAF3] rounded-3xl p-6 sm:p-8 lg:p-10 paper-shadow border border-[#E9DDCB]/70 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#76635B]">
              <span>{weekday}</span>
              <span aria-hidden="true">·</span>
              <span>{fullDate}</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-semibold leading-tight text-[#4A3B36] text-balance">
                Welcome to your little world ♡
              </h1>
              <p className="text-base sm:text-lg text-[#76635B] leading-relaxed max-w-xl">
                A little space for all your thoughts, feelings and memories.
              </p>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onWriteToday}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white font-medium text-sm sm:text-base rose-glow transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <Feather className="w-4 h-4" />
                Write Today&apos;s Entry
              </button>

              <button
                type="button"
                onClick={() => onNavigate('letters')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F5DDE3]/80 hover:bg-[#F5DDE3] text-[#4A3B36] font-medium text-sm transition-colors active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                Letters to Future Me
                <ArrowRight className="w-4 h-4 text-[#83505C]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <DiaryIllustration className="w-60 sm:w-72" />
          </div>
        </div>
      </section>

      {/* Daily Quote + Today's Mood */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Daily Quote Keepsake Card */}
        <div className="lg:col-span-5 relative pt-2">
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="sage" tilt="left" />
          </div>
          <PaperCard
            variant="pink"
            className="h-full p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#83505C]">
                <Quote className="w-3.5 h-3.5" />
                <span>Today&apos;s Gentle Thought</span>
              </div>
              <blockquote className="mt-4 font-serif italic text-lg sm:text-xl leading-relaxed text-[#4A3B36]">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
            </div>
            <p className="mt-5 font-script text-xl text-[#76635B] -rotate-1">
              — {quote.author}
            </p>
          </PaperCard>
        </div>

        {/* Today's Mood Quick Selector */}
        <div className="lg:col-span-7 relative pt-2">
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="beige" tilt="right" />
          </div>
          <PaperCard variant="cream" className="h-full p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl font-medium text-[#4A3B36]">
                  How does today feel?
                </h2>
                <p className="text-xs sm:text-sm text-[#76635B] mt-0.5">
                  {todayMoodRecord
                    ? `Recorded as ${MOOD_MAP[todayMoodRecord.mood].label} today`
                    : 'Tap a feeling to record today’s mood'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('mood')}
                className="text-xs font-medium text-[#83505C] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
              >
                Open Mood Journal
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {MOOD_OPTIONS.map((m) => {
                const selected = todayMoodRecord?.mood === m.id;
                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                    onClick={() => onSelectTodayMood(m.id)}
                    className={`min-h-[44px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all border ${
                      selected
                        ? `${m.bgClass} ${m.borderClass} ${m.textClass} shadow-xs scale-[1.02]`
                        : 'bg-[#FAF3E8]/70 border-[#E9DDCB] text-[#4A3B36] hover:bg-[#F5DDE3]/45'
                    }`}
                  >
                    <MoodIcon mood={m.id} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{m.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </PaperCard>
        </div>
      </div>

      {/* Recent Diary Entries + Memory Gallery Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recently Written Diary Entries */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-medium text-[#4A3B36]">
              Recent Pages
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('diary')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#83505C] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              View all entries
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <PaperCard variant="cream" className="p-8 text-center">
              <p className="font-serif text-lg text-[#4A3B36]">
                Your notebook is open and waiting
              </p>
              <p className="mt-1.5 text-sm text-[#76635B]">
                Write your first page whenever a thought feels worth keeping.
              </p>
              <button
                type="button"
                onClick={onWriteToday}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium transition-colors"
              >
                Write First Entry
              </button>
            </PaperCard>
          ) : (
            <div className="space-y-4">
              {recentEntries.map((entry) => {
                const moodMeta = entry.mood ? MOOD_MAP[entry.mood] : null;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(entry.id)}
                    className="w-full text-left bg-[#FFFAF3] hover:bg-[#FFFDF9] rounded-2xl p-5 sm:p-6 paper-shadow border border-[#E9DDCB]/70 transition-all hover:-translate-y-0.5 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#76635B]">
                        <span>{formatShortDate(entry.date)}</span>
                        {moodMeta && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-[#683945]">
                              <MoodIcon mood={moodMeta.id} className="w-3.5 h-3.5" />
                              {moodMeta.label}
                            </span>
                          </>
                        )}
                        {entry.isSample && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#83505C]">Sample</span>
                          </>
                        )}
                      </div>
                      {entry.isFavourite && (
                        <Heart className="w-4 h-4 text-[#C98D9B] fill-[#C98D9B] shrink-0" />
                      )}
                    </div>

                    <h3 className="mt-2 font-serif text-lg sm:text-xl font-medium text-[#4A3B36] group-hover:text-[#83505C] transition-colors">
                      {entry.title || 'Untitled Page'}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#76635B] line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Small Memory Gallery Preview */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-2xl font-medium text-[#4A3B36]">
              Little Polaroids
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('memories')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#83505C] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Memory Gallery
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {previewMemories.length === 0 ? (
            <PaperCard variant="cream" className="p-8 text-center">
              <ImageIcon className="w-8 h-8 text-[#C98D9B] mx-auto" strokeWidth={1.5} />
              <p className="mt-3 font-serif text-lg text-[#4A3B36]">
                No Polaroids tucked in yet
              </p>
              <p className="mt-1 text-sm text-[#76635B]">
                Add a photo or little memory card to start your scrapbook wall.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('memories')}
                className="mt-5 px-5 py-2.5 rounded-full bg-[#F5DDE3] hover:bg-[#eed0d8] text-[#4A3B36] text-sm font-medium transition-colors"
              >
                Add a Memory
              </button>
            </PaperCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 pt-1">
              {previewMemories.map((mem, idx) => {
                const tiltClass =
                  idx % 2 === 0 ? '-rotate-2 hover:rotate-0' : 'rotate-2 hover:rotate-0';
                return (
                  <button
                    key={mem.id}
                    type="button"
                    onClick={() => onNavigate('memories')}
                    className={`relative text-left bg-[#FFFFFF] p-2.5 pb-6 rounded-xl paper-shadow border border-[#E9DDCB]/80 transition-transform duration-200 ${tiltClass} ${
                      idx === 2 ? 'sm:col-span-1 lg:col-span-2 lg:max-w-[240px]' : ''
                    }`}
                  >
                    <div className="flex justify-center -mt-4 mb-1.5">
                      <WashiTape
                        tone={idx % 2 === 0 ? 'blush' : 'sage'}
                        tilt={idx % 2 === 0 ? 'left' : 'right'}
                        className="w-16 h-4"
                      />
                    </div>
                    <div className="aspect-[4/3] w-full rounded-md overflow-hidden bg-[#FAF3E8] border border-[#76635B]/10">
                      {mem.photoDataUrl ? (
                        <img
                          src={mem.photoDataUrl}
                          alt={mem.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MemoryMotifArtwork motif={mem.motif || 'blossom'} />
                      )}
                    </div>
                    <p className="mt-2.5 font-script text-lg leading-tight text-[#4A3B36] line-clamp-1">
                      {mem.caption}
                    </p>
                    <p className="text-[11px] text-[#76635B] mt-0.5">
                      {formatShortDate(mem.date)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
