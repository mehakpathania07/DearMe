import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { MoodRecord, MoodType } from '../types/diary';
import {
  MOOD_MAP,
  MOOD_OPTIONS,
  formatFriendlyDate,
  formatShortDate,
  generateId,
  getTodayISO,
} from '../utils/storage';
import { MoodIcon } from '../components/MoodIcon';
import { ConfirmModal, PaperCard, WashiTape } from '../components/ScrapbookDecor';

interface MoodJournalPageProps {
  moods: MoodRecord[];
  onSaveMood: (record: MoodRecord) => void;
  onDeleteMood: (id: string) => void;
}

export function MoodJournalPage({
  moods,
  onSaveMood,
  onDeleteMood,
}: MoodJournalPageProps) {
  const prefersReduced = useReducedMotion();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const existingForDate = moods.find((m) => m.date === selectedDate);

  const [selectedMood, setSelectedMood] = useState<MoodType>(
    existingForDate?.mood || 'happy',
  );
  const [note, setNote] = useState(existingForDate?.note || '');
  const [savedToast, setSavedToast] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MoodRecord | null>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed
  const [chartScope, setChartScope] = useState<'month' | 'all'>('month');

  const handleDateChange = (iso: string) => {
    setSelectedDate(iso);
    const found = moods.find((m) => m.date === iso);
    if (found) {
      setSelectedMood(found.mood);
      setNote(found.note || '');
    } else {
      setNote('');
    }
  };

  const handleSave = () => {
    const existing = moods.find((m) => m.date === selectedDate);
    const record: MoodRecord = {
      id: existing ? existing.id : generateId('mood'),
      date: selectedDate,
      mood: selectedMood,
      note: note.trim() || undefined,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      isSample: false,
    };
    onSaveMood(record);
    setSavedToast(`Recorded "${MOOD_MAP[selectedMood].label}" for ${formatShortDate(selectedDate)} ♡`);
    setTimeout(() => setSavedToast(''), 2800);
  };

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

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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

  const moodByDate = useMemo(() => {
    const map: Record<string, MoodRecord> = {};
    moods.forEach((m) => {
      map[m.date] = m;
    });
    return map;
  }, [moods]);

  const distribution = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
    const filtered =
      chartScope === 'month'
        ? moods.filter((m) => m.date.startsWith(monthPrefix))
        : moods;

    const counts: Record<MoodType, number> = {
      happy: 0,
      sad: 0,
      calm: 0,
      excited: 0,
      anxious: 0,
      tired: 0,
      grateful: 0,
      loved: 0,
    };
    filtered.forEach((m) => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    const total = filtered.length;
    return { counts, total };
  }, [moods, chartScope, viewYear, viewMonth]);

  const sortedHistory = [...moods].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
          Mood Journal
        </h1>
        <p className="mt-1 text-sm text-[#76635B]">
          Notice your gentle emotional weather without judgment.
        </p>
      </div>

      {/* Record Daily Mood Card */}
      <div className="relative pt-2">
        <div className="flex justify-center -mb-2.5 relative z-10">
          <WashiTape tone="blush" tilt="left" />
        </div>
        <PaperCard variant="cream" className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#4A3B36]">
                Check in with yourself
              </h2>
              <p className="text-xs sm:text-sm text-[#76635B] mt-0.5">
                {formatFriendlyDate(selectedDate)}
              </p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              aria-label="Select mood date"
              className="px-3.5 py-2 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] focus:outline-none focus:border-[#C98D9B]"
            />
          </div>

          {/* 8 Mood Options */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOOD_OPTIONS.map((m) => {
              const active = selectedMood === m.id;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  onClick={() => setSelectedMood(m.id)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                    active
                      ? `${m.bgClass} ${m.borderClass} ${m.textClass} shadow-xs scale-[1.01]`
                      : 'bg-[#FAF3E8]/60 border-[#E9DDCB] text-[#4A3B36] hover:bg-[#F5DDE3]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        active ? 'bg-white/70' : 'bg-[#FFFAF3]'
                      }`}
                    >
                      <MoodIcon mood={m.id} className="w-4 h-4" />
                    </span>
                    {active && <Check className="w-4 h-4" />}
                  </div>
                  <span className="mt-2.5 text-sm font-medium">{m.label}</span>
                  <span className="text-[11px] opacity-80 line-clamp-1">
                    {m.description}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Optional Short Note */}
          <div className="mt-5">
            <label
              htmlFor="mood-short-note"
              className="block text-xs font-medium text-[#76635B] mb-1.5"
            >
              Short note (optional)
            </label>
            <input
              id="mood-short-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A small reason or gentle reflection..."
              className="w-full px-4 py-3 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/55 focus:outline-none focus:border-[#C98D9B]"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="min-h-[24px]">
              {savedToast && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#566251]">
                  <Sparkles className="w-4 h-4 text-[#C98D9B]" />
                  {savedToast}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium rose-glow transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              {existingForDate ? 'Update Mood' : 'Save Mood'}
            </button>
          </div>
        </PaperCard>
      </div>

      {/* Monthly Mood Calendar + Minimal Mood Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Monthly Mood Calendar */}
        <PaperCard variant="cream" className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-medium text-[#4A3B36]">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-1.5">
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

          <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-[#76635B]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell.day || !cell.iso) {
                return <div key={`empty-${idx}`} className="h-11" />;
              }
              const rec = moodByDate[cell.iso];
              const meta = rec ? MOOD_MAP[rec.mood] : null;
              const isSelected = selectedDate === cell.iso;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => handleDateChange(cell.iso!)}
                  title={meta ? `${cell.iso}: ${meta.label}` : cell.iso}
                  className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs transition-all border ${
                    isSelected
                      ? 'border-[#83505C] ring-2 ring-[#F5DDE3]'
                      : 'border-transparent hover:border-[#E9DDCB]'
                  } ${meta ? `${meta.bgClass} ${meta.textClass}` : 'bg-[#FAF3E8]/55 text-[#4A3B36]'}`}
                >
                  <span className="tabular-nums font-medium">{cell.day}</span>
                  {meta ? (
                    <MoodIcon mood={meta.id} className="w-3 h-3 mt-0.5" />
                  ) : (
                    <span className="w-1 h-1 mt-1 rounded-full bg-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </PaperCard>

        {/* Minimal Mood Distribution Chart */}
        <PaperCard variant="cream" className="lg:col-span-6 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-medium text-[#4A3B36]">
                Mood Distribution
              </h2>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF3E8]">
                <button
                  type="button"
                  onClick={() => setChartScope('month')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    chartScope === 'month'
                      ? 'bg-[#FFFAF3] text-[#4A3B36] shadow-xs'
                      : 'text-[#76635B]'
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setChartScope('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    chartScope === 'all'
                      ? 'bg-[#FFFAF3] text-[#4A3B36] shadow-xs'
                      : 'text-[#76635B]'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            <p className="mt-1 text-xs text-[#76635B] tabular-nums">
              {distribution.total}{' '}
              {distribution.total === 1 ? 'mood recorded' : 'moods recorded'}
            </p>

            <div className="mt-5 space-y-3">
              {MOOD_OPTIONS.map((m) => {
                const count = distribution.counts[m.id] || 0;
                const pct =
                  distribution.total > 0
                    ? Math.round((count / distribution.total) * 100)
                    : 0;
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 font-medium text-[#4A3B36]">
                        <MoodIcon mood={m.id} className="w-3.5 h-3.5 text-[#76635B]" />
                        {m.label}
                      </span>
                      <span className="text-[#76635B] tabular-nums">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#FAF3E8] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: m.barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PaperCard>
      </div>

      {/* Mood History */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-medium text-[#4A3B36]">
          Mood History
        </h2>
        {sortedHistory.length === 0 ? (
          <PaperCard variant="cream" className="p-8 text-center">
            <p className="font-serif text-lg text-[#4A3B36]">
              No moods logged yet
            </p>
            <p className="mt-1 text-sm text-[#76635B]">
              Pick how today feels above to start your emotional almanac.
            </p>
          </PaperCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedHistory.map((rec) => {
              const meta = MOOD_MAP[rec.mood];
              return (
                <PaperCard
                  key={rec.id}
                  variant="cream"
                  className="p-4 sm:p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${meta.bgClass} ${meta.textClass}`}
                    >
                      <MoodIcon mood={rec.mood} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#76635B]">
                        <span className="font-medium text-[#4A3B36]">
                          {meta.label}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{formatFriendlyDate(rec.date)}</span>
                        {rec.isSample && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#83505C]">Sample</span>
                          </>
                        )}
                      </div>
                      {rec.note && (
                        <p className="mt-1 text-sm text-[#4A3B36] leading-relaxed">
                          {rec.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(rec)}
                    aria-label={`Delete mood record for ${rec.date}`}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </PaperCard>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete mood record?"
        message="This will remove the selected mood note from your history."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDeleteMood(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
