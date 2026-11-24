import { useEffect, useState, type ChangeEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Camera,
  Check,
  Heart,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { DiaryEntry, MoodType } from '../types/diary';
import {
  MOOD_MAP,
  MOOD_OPTIONS,
  compressImageFile,
  formatFriendlyDate,
  formatShortDate,
  generateId,
  getTodayISO,
} from '../utils/storage';
import { MoodIcon } from '../components/MoodIcon';
import { SparkleBurst } from '../components/AmbientBackdrop';
import { ConfirmModal, WashiTape } from '../components/ScrapbookDecor';

interface DiaryPageProps {
  entries: DiaryEntry[];
  selectedEntryId: string | null;
  draftDate: string | null;
  onSaveEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onClearSelection: () => void;
}

export function DiaryPage({
  entries,
  selectedEntryId,
  draftDate,
  onSaveEntry,
  onDeleteEntry,
  onToggleFavourite,
  onClearSelection,
}: DiaryPageProps) {
  const prefersReduced = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'favourites'>('all');

  // Editor form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType | undefined>('calm');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [isFavourite, setIsFavourite] = useState(false);

  const [saveFeedback, setSaveFeedback] = useState<string>('');
  const [sparkleActive, setSparkleActive] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DiaryEntry | null>(null);

  const startNewEntry = (overrideDate?: string) => {
    setEditingId(null);
    setTitle('');
    setDate(overrideDate || getTodayISO());
    setContent('');
    setMood('calm');
    setPhotoDataUrl(undefined);
    setIsFavourite(false);
    setValidationMsg('');
    onClearSelection();
  };

  const loadEntryIntoEditor = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setDate(entry.date);
    setContent(entry.content);
    setMood(entry.mood);
    setPhotoDataUrl(entry.photoDataUrl);
    setIsFavourite(entry.isFavourite);
    setValidationMsg('');
  };

  useEffect(() => {
    if (selectedEntryId) {
      const found = entries.find((e) => e.id === selectedEntryId);
      if (found) {
        loadEntryIntoEditor(found);
      }
    } else if (draftDate) {
      startNewEntry(draftDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntryId, draftDate]);

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setPhotoDataUrl(compressed);
    } catch {
      setValidationMsg('Could not read that photo. Please try another image.');
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      setValidationMsg('Write a title or a few words before tucking this page away.');
      return;
    }

    const nowISO = new Date().toISOString();
    const existing = editingId ? entries.find((e) => e.id === editingId) : undefined;

    const saved: DiaryEntry = {
      id: existing ? existing.id : generateId('entry'),
      title: title.trim() || 'Untitled Reflection',
      content: content.trim(),
      date: date || getTodayISO(),
      createdAt: existing ? existing.createdAt : nowISO,
      updatedAt: nowISO,
      mood,
      photoDataUrl,
      isFavourite,
      isSample: false,
    };

    onSaveEntry(saved);
    setEditingId(saved.id);
    setValidationMsg('');
    setSparkleActive(true);
    setSaveFeedback('Saved gently to your diary ♡');
    setTimeout(() => setSparkleActive(false), 950);
    setTimeout(() => setSaveFeedback(''), 3200);
  };

  const filteredEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .filter((entry) => {
      if (filterMode === 'favourites' && !entry.isFavourite) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        (entry.mood && MOOD_MAP[entry.mood].label.toLowerCase().includes(q)) ||
        entry.date.includes(q)
      );
    });

  return (
    <div className="space-y-6 pb-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
            My Diary
          </h1>
          <p className="mt-1 text-sm text-[#76635B]">
            A quiet lined notebook for whatever is on your heart today.
          </p>
        </div>

        <button
          type="button"
          onClick={() => startNewEntry()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium rose-glow transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Main Split Spread: Archive List + Vintage Notebook Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column: Search & Previous Entries */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFFAF3] rounded-2xl p-4 paper-shadow border border-[#E9DDCB]/70 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#76635B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries or moods..."
                aria-label="Search diary entries"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] placeholder:text-[#76635B]/60 focus:outline-none focus:border-[#C98D9B]"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF3E8]">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-[#FFFAF3] text-[#4A3B36] shadow-xs'
                    : 'text-[#76635B] hover:text-[#4A3B36]'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('favourites')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterMode === 'favourites'
                    ? 'bg-[#FFFAF3] text-[#83505C] shadow-xs'
                    : 'text-[#76635B] hover:text-[#4A3B36]'
                }`}
              >
                Favourites ({entries.filter((e) => e.isFavourite).length})
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="bg-[#FFFAF3] rounded-2xl p-6 text-center paper-shadow border border-[#E9DDCB]/60">
                <p className="font-serif text-base text-[#4A3B36]">
                  No matching pages found
                </p>
                <p className="mt-1 text-xs text-[#76635B]">
                  Try another keyword or start a fresh entry.
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isSelected = editingId === entry.id;
                const moodMeta = entry.mood ? MOOD_MAP[entry.mood] : null;
                return (
                  <div
                    key={entry.id}
                    className={`rounded-2xl p-4 transition-all border ${
                      isSelected
                        ? 'bg-[#F9E9ED] border-[#C98D9B]/70 paper-shadow'
                        : 'bg-[#FFFAF3] border-[#E9DDCB]/70 paper-shadow hover:bg-[#FFFDF9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => loadEntryIntoEditor(entry)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 text-xs text-[#76635B]">
                          <span>{formatShortDate(entry.date)}</span>
                          {moodMeta && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1">
                                <MoodIcon mood={moodMeta.id} className="w-3 h-3" />
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
                        <h3 className="mt-1 font-serif text-base font-medium text-[#4A3B36] truncate">
                          {entry.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#76635B] line-clamp-2 leading-relaxed">
                          {entry.content}
                        </p>
                      </button>

                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onToggleFavourite(entry.id);
                            if (editingId === entry.id) {
                              setIsFavourite((v) => !v);
                            }
                          }}
                          aria-label={
                            entry.isFavourite
                              ? 'Remove from favourites'
                              : 'Mark as favourite'
                          }
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5DDE3]/60 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              entry.isFavourite
                                ? 'text-[#C98D9B] fill-[#C98D9B]'
                                : 'text-[#76635B]'
                            }`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(entry)}
                          aria-label={`Delete ${entry.title}`}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Vintage Lined Notebook Editor */}
        <section className="lg:col-span-8 relative pt-2">
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="blush" tilt="center" />
          </div>

          <div className="relative bg-[#FFFAF3] rounded-3xl p-6 sm:p-8 lg:p-10 paper-shadow border border-[#E9DDCB]">
            <SparkleBurst active={sparkleActive} />

            {/* Top Notebook Meta Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E9DDCB]/80">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-medium text-[#76635B]" htmlFor="diary-date">
                  Date
                </label>
                <input
                  id="diary-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-xs sm:text-sm text-[#4A3B36] focus:outline-none focus:border-[#C98D9B]"
                />
                <span className="font-script text-lg text-[#76635B] hidden sm:inline">
                  {formatFriendlyDate(date || getTodayISO())}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFavourite((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    isFavourite
                      ? 'bg-[#F9E9ED] border-[#C98D9B] text-[#83505C]'
                      : 'bg-transparent border-[#E9DDCB] text-[#76635B] hover:bg-[#F5DDE3]/40'
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFavourite ? 'fill-[#C98D9B] text-[#C98D9B]' : ''
                    }`}
                  />
                  {isFavourite ? 'Favourited' : 'Favourite'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      const found = entries.find((e) => e.id === editingId);
                      if (found) setDeleteTarget(found);
                    }}
                    aria-label="Delete current entry"
                    className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Entry Title */}
            <div className="mt-5">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give today's page a gentle title..."
                aria-label="Diary entry title"
                className="w-full bg-transparent font-serif text-2xl sm:text-3xl font-medium text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/50 focus:outline-none pb-2 border-b border-dotted border-[#E9DDCB]"
              />
            </div>

            {/* Mood Selection Strip */}
            <div className="mt-4">
              <p className="text-xs font-medium text-[#76635B] mb-2">
                Mood for this page
              </p>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const selected = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(selected ? undefined : m.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? `${m.bgClass} ${m.borderClass} ${m.textClass}`
                          : 'bg-transparent border-[#76635B]/20 text-[#76635B] hover:bg-[#F5DDE3]/35'
                      }`}
                    >
                      <MoodIcon mood={m.id} className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lined Writing Area */}
            <div className="mt-5">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Dear Me, today felt like..."
                aria-label="Diary entry content"
                className="w-full notebook-lines bg-transparent text-[16px] text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/50 focus:outline-none resize-y min-h-[280px] py-1"
              />
            </div>

            {/* Optional Photo Attachment */}
            <div className="mt-5 pt-4 border-t border-[#E9DDCB]/70">
              {photoDataUrl ? (
                <div className="relative inline-block bg-white p-2.5 pb-5 rounded-xl paper-shadow border border-[#E9DDCB] -rotate-1">
                  <img
                    src={photoDataUrl}
                    alt="Attached diary keepsake"
                    referrerPolicy="no-referrer"
                    className="max-h-52 w-auto rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(undefined)}
                    aria-label="Remove attached photo"
                    className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full bg-[#FFFAF3] border border-[#E9DDCB] shadow-sm flex items-center justify-center text-[#76635B] hover:text-[#BA1A1A]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="mt-2 font-script text-base text-[#76635B] text-center">
                    Tucked into today&apos;s page
                  </p>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF3E8] hover:bg-[#F5DDE3]/60 border border-[#E9DDCB] text-xs font-medium text-[#4A3B36] cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-[#83505C]" />
                  <span>Attach a Photo (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                </label>
              )}
            </div>

            {/* Validation / Feedback + Save Button */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="min-h-[24px]">
                {validationMsg && (
                  <p className="text-xs font-medium text-[#BA1A1A]">
                    {validationMsg}
                  </p>
                )}
                {saveFeedback && (
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#566251]"
                  >
                    <Sparkles className="w-4 h-4 text-[#C98D9B]" />
                    <span>{saveFeedback}</span>
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => startNewEntry()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium text-[#4A3B36] bg-[#F5DDE3]/75 hover:bg-[#F5DDE3] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Start Fresh
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium rose-glow transition-all active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  {editingId ? 'Update Page' : 'Save Page'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove this diary page?"
        message={`Are you sure you want to delete "${
          deleteTarget?.title || 'this entry'
        }"? This cannot be undone.`}
        confirmLabel="Delete Page"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteEntry(deleteTarget.id);
            if (editingId === deleteTarget.id) {
              startNewEntry();
            }
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
