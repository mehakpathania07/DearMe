import { useState } from 'react';
import { BookOpen, Camera, Heart, MailOpen } from 'lucide-react';
import type { DiaryEntry, FutureLetter, MemoryItem } from '../types/diary';
import { MOOD_MAP, formatFriendlyDate, formatShortDate } from '../utils/storage';
import { MoodIcon } from '../components/MoodIcon';
import { MemoryMotifArtwork, PaperCard, WashiTape } from '../components/ScrapbookDecor';

interface FavouritesPageProps {
  entries: DiaryEntry[];
  memories: MemoryItem[];
  letters: FutureLetter[];
  onOpenEntry: (id: string) => void;
  onUnfavouriteEntry: (id: string) => void;
  onUnfavouriteMemory: (id: string) => void;
  onUnfavouriteLetter: (id: string) => void;
}

export function FavouritesPage({
  entries,
  memories,
  letters,
  onOpenEntry,
  onUnfavouriteEntry,
  onUnfavouriteMemory,
  onUnfavouriteLetter,
}: FavouritesPageProps) {
  const [tab, setTab] = useState<'all' | 'entries' | 'memories' | 'letters'>('all');

  const favEntries = entries.filter((e) => e.isFavourite);
  const favMemories = memories.filter((m) => m.isFavourite);
  const favLetters = letters.filter((l) => l.isFavourite);
  const totalCount = favEntries.length + favMemories.length + favLetters.length;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
            Favourites
          </h1>
          <p className="mt-1 text-sm text-[#76635B]">
            Your most cherished diary pages, Polaroids, and keepsakes in one place.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-[#FAF3E8] border border-[#E9DDCB]">
          {(
            [
              { id: 'all', label: `All (${totalCount})` },
              { id: 'entries', label: `Diary (${favEntries.length})` },
              { id: 'memories', label: `Memories (${favMemories.length})` },
              { id: 'letters', label: `Letters (${favLetters.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                tab === t.id
                  ? 'bg-[#FFFAF3] text-[#83505C] shadow-xs'
                  : 'text-[#76635B] hover:text-[#4A3B36]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {totalCount === 0 ? (
        <PaperCard variant="pink" className="p-10 text-center">
          <Heart className="w-9 h-9 text-[#C98D9B] mx-auto" strokeWidth={1.5} />
          <h2 className="mt-3 font-serif text-xl text-[#4A3B36]">
            Nothing favourited yet
          </h2>
          <p className="mt-1.5 text-sm text-[#76635B] max-w-md mx-auto">
            Tap the little heart icon on any diary entry, Polaroid memory, or opened
            future letter to keep it close here.
          </p>
        </PaperCard>
      ) : (
        <div className="space-y-10">
          {/* Favourite Diary Entries */}
          {(tab === 'all' || tab === 'entries') && favEntries.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#76635B]">
                <BookOpen className="w-4 h-4 text-[#83505C]" />
                <span>Favourite Diary Entries</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {favEntries.map((entry) => {
                  const moodMeta = entry.mood ? MOOD_MAP[entry.mood] : null;
                  return (
                    <PaperCard
                      key={entry.id}
                      variant="cream"
                      className="p-5 sm:p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#76635B]">
                            <span>{formatFriendlyDate(entry.date)}</span>
                            {moodMeta && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex items-center gap-1 text-[#683945]">
                                  <MoodIcon mood={moodMeta.id} className="w-3.5 h-3.5" />
                                  {moodMeta.label}
                                </span>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onUnfavouriteEntry(entry.id)}
                            aria-label="Remove entry from favourites"
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5DDE3]/70"
                          >
                            <Heart className="w-4 h-4 text-[#C98D9B] fill-[#C98D9B]" />
                          </button>
                        </div>

                        <h3 className="mt-2 font-serif text-xl font-medium text-[#4A3B36]">
                          {entry.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#76635B] line-clamp-3 leading-relaxed">
                          {entry.content}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#E9DDCB]/70 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onOpenEntry(entry.id)}
                          className="text-xs font-medium text-[#83505C] hover:underline underline-offset-4"
                        >
                          Read in My Diary
                        </button>
                      </div>
                    </PaperCard>
                  );
                })}
              </div>
            </section>
          )}

          {/* Favourite Memories */}
          {(tab === 'all' || tab === 'memories') && favMemories.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#76635B]">
                <Camera className="w-4 h-4 text-[#83505C]" />
                <span>Favourite Polaroid Memories</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                {favMemories.map((mem, idx) => (
                  <div
                    key={mem.id}
                    className={`relative bg-white p-3.5 pb-6 rounded-xl paper-shadow border border-[#E9DDCB] transition-transform hover:rotate-0 ${
                      idx % 2 === 0 ? '-rotate-1' : 'rotate-1'
                    }`}
                  >
                    <div className="flex justify-center -mt-6 mb-2">
                      <WashiTape
                        tone={idx % 2 === 0 ? 'blush' : 'sage'}
                        tilt="center"
                        className="w-20 h-4"
                      />
                    </div>
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#FAF3E8]">
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
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-script text-xl text-[#4A3B36]">
                          {mem.caption}
                        </p>
                        <p className="text-xs text-[#76635B]">
                          {formatShortDate(mem.date)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnfavouriteMemory(mem.id)}
                        aria-label="Remove memory from favourites"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5DDE3]/70"
                      >
                        <Heart className="w-4 h-4 text-[#C98D9B] fill-[#C98D9B]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Favourite Letters */}
          {(tab === 'all' || tab === 'letters') && favLetters.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#76635B]">
                <MailOpen className="w-4 h-4 text-[#83505C]" />
                <span>Favourite Letters</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {favLetters.map((letter) => (
                  <PaperCard key={letter.id} variant="pink" className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-[#76635B]">
                          Written {formatFriendlyDate(letter.writtenDate)}
                        </p>
                        <h3 className="mt-1 font-serif text-xl font-medium text-[#4A3B36]">
                          {letter.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => onUnfavouriteLetter(letter.id)}
                        aria-label="Remove letter from favourites"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-white/60"
                      >
                        <Heart className="w-4 h-4 text-[#C98D9B] fill-[#C98D9B]" />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-[#4A3B36] whitespace-pre-wrap leading-relaxed line-clamp-4">
                      {letter.body}
                    </p>
                  </PaperCard>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
