import { useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Feather,
  Flower2,
} from 'lucide-react';
import type { DiaryEntry, GratitudeNote, MoodRecord } from '../types/diary';
import {
  MOOD_MAP,
  formatFriendlyDate,
  getTodayISO,
} from '../utils/storage';
import { MoodIcon } from '../components/MoodIcon';
import { PaperCard, WashiTape } from '../components/ScrapbookDecor';

interface CalendarPageProps {
  entries: DiaryEntry[];
  moods: MoodRecord[];
  gratitudes: GratitudeNote[];
  onOpenEntry: (entryId: string) => void;
  onWriteForDate: (isoDate: string) => void;
}

export function CalendarPage({
  entries,
  moods,
  gratitudes,
  onOpenEntry,
  onWriteForDate,
}: CalendarPageProps) {
  const now = new Date();
  const todayISO = getTodayISO();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayISO);

  const monthTitle = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSelectedDate(todayISO);
  };

  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: { day: number | null; iso?: string }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, iso });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, DiaryEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [entries]);

  const moodByDate = useMemo(() => {
    const map: Record<string, MoodRecord> = {};
    moods.forEach((m) => {
      map[m.date] = m;
    });
    return map;
  }, [moods]);

  const selectedEntries = entriesByDate[selectedDate] || [];
  const selectedMood = moodByDate[selectedDate];
  const selectedGratitudes = gratitudes.filter((g) => g.date === selectedDate);

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-[#76635B]">
          Flip through the months to revisit pages and daily moods.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Vintage Monthly Calendar */}
        <div className="lg:col-span-7 relative pt-2">
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="beige" tilt="left" />
          </div>
          <PaperCard variant="cream" className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E9DDCB]/80">
              <h2 className="font-serif text-2xl font-medium text-[#4A3B36]">
                {monthTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#FAF3E8] hover:bg-[#F5DDE3] text-[#4A3B36] border border-[#E9DDCB] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-[#FAF3E8] hover:bg-[#F5DDE3] text-[#4A3B36] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-[#FAF3E8] hover:bg-[#F5DDE3] text-[#4A3B36] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-medium text-[#76635B]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell.day || !cell.iso) {
                  return <div key={`empty-${idx}`} className="h-14 sm:h-16" />;
                }
                const dayEntries = entriesByDate[cell.iso] || [];
                const dayMood = moodByDate[cell.iso];
                const moodMeta = dayMood ? MOOD_MAP[dayMood.mood] : null;
                const hasEntry = dayEntries.length > 0;
                const isSelected = selectedDate === cell.iso;
                const isToday = cell.iso === todayISO;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setSelectedDate(cell.iso!)}
                    className={`h-14 sm:h-16 rounded-2xl p-1.5 flex flex-col items-center justify-between transition-all border ${
                      isSelected
                        ? 'border-[#83505C] ring-2 ring-[#F5DDE3] bg-[#F9E9ED]'
                        : hasEntry
                          ? 'border-[#C98D9B]/55 bg-[#F9E9ED]/55 hover:bg-[#F9E9ED]'
                          : 'border-[#E9DDCB]/60 bg-[#FAF3E8]/55 hover:bg-[#F5DDE3]/35'
                    }`}
                  >
                    <span
                      className={`text-xs sm:text-sm tabular-nums font-medium ${
                        isToday
                          ? 'px-1.5 py-0.5 rounded-full bg-[#C98D9B] text-white text-[11px]'
                          : 'text-[#4A3B36]'
                      }`}
                    >
                      {cell.day}
                    </span>

                    <div className="flex items-center gap-1 min-h-[16px]">
                      {hasEntry && (
                        <span
                          className="w-2 h-2 rounded-full bg-[#C98D9B]"
                          title={`${dayEntries.length} diary ${
                            dayEntries.length === 1 ? 'entry' : 'entries'
                          }`}
                        />
                      )}
                      {moodMeta && (
                        <span
                          className={`inline-flex items-center justify-center ${moodMeta.textClass}`}
                          title={`Mood: ${moodMeta.label}`}
                        >
                          <MoodIcon mood={moodMeta.id} className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-[#E9DDCB]/70 flex flex-wrap items-center gap-5 text-xs text-[#76635B]">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C98D9B]" />
                Diary entry recorded
              </span>
              <span className="inline-flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[#83505C]" />
                Click any date to read its pages
              </span>
            </div>
          </PaperCard>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="lg:col-span-5 space-y-4 pt-2">
          <PaperCard variant="pink" className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[#83505C]">Selected Day</p>
                <h3 className="mt-1 font-serif text-xl font-medium text-[#4A3B36]">
                  {formatFriendlyDate(selectedDate)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onWriteForDate(selectedDate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-xs font-medium transition-colors"
              >
                <Feather className="w-3.5 h-3.5" />
                Write Page
              </button>
            </div>

            {selectedMood && (
              <div className="mt-4 p-3.5 rounded-2xl bg-[#FFFAF3] border border-[#E9DDCB] flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    MOOD_MAP[selectedMood.mood].bgClass
                  } ${MOOD_MAP[selectedMood.mood].textClass}`}
                >
                  <MoodIcon mood={selectedMood.mood} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#4A3B36]">
                    Mood: {MOOD_MAP[selectedMood.mood].label}
                  </p>
                  {selectedMood.note && (
                    <p className="text-xs text-[#76635B] truncate">
                      {selectedMood.note}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              <p className="text-xs font-medium text-[#76635B]">
                Diary Entries ({selectedEntries.length})
              </p>

              {selectedEntries.length === 0 ? (
                <div className="p-5 rounded-2xl bg-[#FFFAF3]/80 border border-[#E9DDCB]/70 text-center">
                  <p className="text-sm text-[#76635B]">
                    No diary pages written on this date yet.
                  </p>
                </div>
              ) : (
                selectedEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onOpenEntry(entry.id)}
                    className="w-full text-left p-4 rounded-2xl bg-[#FFFAF3] hover:bg-white border border-[#E9DDCB] transition-colors"
                  >
                    <h4 className="font-serif text-base font-medium text-[#4A3B36]">
                      {entry.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#76635B] line-clamp-2 leading-relaxed">
                      {entry.content}
                    </p>
                  </button>
                ))
              )}
            </div>

            {selectedGratitudes.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#C98D9B]/25 space-y-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#566251]">
                  <Flower2 className="w-3.5 h-3.5" />
                  Gratitude Notes
                </p>
                {selectedGratitudes.map((g) => (
                  <p
                    key={g.id}
                    className="text-xs text-[#4A3B36] bg-[#FFFAF3]/90 px-3 py-2 rounded-xl"
                  >
                    {g.text}
                  </p>
                ))}
              </div>
            )}
          </PaperCard>
        </div>
      </div>
    </div>
  );
}
