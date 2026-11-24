import { useMemo, useState } from 'react';
import {
  Check,
  Flower2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { GratitudeNote } from '../types/diary';
import {
  formatFriendlyDate,
  generateId,
  getTodayISO,
} from '../utils/storage';
import { ConfirmModal, PaperCard, WashiTape } from '../components/ScrapbookDecor';

interface GratitudePageProps {
  gratitudes: GratitudeNote[];
  onSaveGratitude: (note: GratitudeNote) => void;
  onDeleteGratitude: (id: string) => void;
}

function FloralSprigDecor() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="w-24 h-16 text-[#6D7E66] opacity-80 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 68 C42 52, 68 38, 102 18"
        stroke="#6D7E66"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse
        cx="46"
        cy="42"
        rx="12"
        ry="5.5"
        transform="rotate(-38 46 42)"
        fill="#CCD8C3"
      />
      <ellipse
        cx="68"
        cy="48"
        rx="12"
        ry="5.5"
        transform="rotate(14 68 48)"
        fill="#BAC9AF"
      />
      <ellipse
        cx="78"
        cy="24"
        rx="10"
        ry="4.5"
        transform="rotate(-30 78 24)"
        fill="#DAE6D1"
      />
      <circle cx="102" cy="18" r="6" fill="#F6B5C4" />
      <circle cx="96" cy="24" r="5" fill="#F5DDE3" />
      <circle cx="106" cy="25" r="5" fill="#F5DDE3" />
      <circle cx="101" cy="22" r="2.8" fill="#FFF8EF" />
    </svg>
  );
}

export function GratitudePage({
  gratitudes,
  onSaveGratitude,
  onDeleteGratitude,
}: GratitudePageProps) {
  const [date, setDate] = useState(getTodayISO());
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<GratitudeNote | null>(null);

  const handleAdd = () => {
    if (!text.trim()) return;
    const note: GratitudeNote = {
      id: generateId('grat'),
      date: date || getTodayISO(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    onSaveGratitude(note);
    setText('');
    setSavedNotice('Added to your gratitude basket ♡');
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleSaveEdit = (note: GratitudeNote) => {
    if (!editText.trim()) return;
    onSaveGratitude({
      ...note,
      text: editText.trim(),
      isSample: false,
    });
    setEditingId(null);
    setEditText('');
  };

  const groupedByDate = useMemo(() => {
    const groups: Record<string, GratitudeNote[]> = {};
    const sorted = [...gratitudes].sort(
      (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
    sorted.forEach((g) => {
      if (!groups[g.date]) groups[g.date] = [];
      groups[g.date].push(g);
    });
    return Object.entries(groups).sort(([d1], [d2]) => d2.localeCompare(d1));
  }, [gratitudes]);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
            Gratitude Corner
          </h1>
          <p className="mt-1 text-sm text-[#76635B]">
            Notice small kindnesses, quiet comforts, and everyday light.
          </p>
        </div>
        <FloralSprigDecor />
      </div>

      {/* Add Gratitude Paper Card */}
      <div className="relative pt-2">
        <div className="flex justify-center -mb-2.5 relative z-10">
          <WashiTape tone="sage" tilt="center" />
        </div>
        <PaperCard variant="sage" className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-medium text-[#2D3829]">
              What made today a little softer?
            </h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Gratitude note date"
              className="px-3.5 py-2 rounded-xl bg-[#FFFAF3] border border-[#BAC9AF] text-xs sm:text-sm text-[#4A3B36] focus:outline-none focus:border-[#566251]"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              placeholder="Today I am grateful for..."
              aria-label="Write something you are grateful for"
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FFFAF3] border border-[#BAC9AF]/80 text-sm sm:text-base text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/55 focus:outline-none focus:border-[#566251]"
            />
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#566251] hover:bg-[#3f4a3a] text-white text-sm font-medium transition-colors active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Save Note
            </button>
          </div>

          {savedNotice && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#2D3829]">
              <Sparkles className="w-3.5 h-3.5 text-[#566251]" />
              {savedNotice}
            </p>
          )}
        </PaperCard>
      </div>

      {/* Grouped Gratitude Records */}
      {groupedByDate.length === 0 ? (
        <PaperCard variant="cream" className="p-10 text-center">
          <Flower2 className="w-9 h-9 text-[#95A18E] mx-auto" strokeWidth={1.5} />
          <h2 className="mt-3 font-serif text-xl text-[#4A3B36]">
            No gratitude notes yet
          </h2>
          <p className="mt-1 text-sm text-[#76635B]">
            Add one tiny good thing from your day above—even warm socks count.
          </p>
        </PaperCard>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map(([groupDate, items]) => (
            <section key={groupDate} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-lg font-medium text-[#4A3B36]">
                  {formatFriendlyDate(groupDate)}
                </h3>
                <span className="text-xs text-[#76635B]">
                  · {items.length} {items.length === 1 ? 'note' : 'notes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((note) => {
                  const isEditing = editingId === note.id;
                  return (
                    <PaperCard
                      key={note.id}
                      variant="cream"
                      className="p-4 sm:p-5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="mt-1 w-6 h-6 rounded-full bg-[#DAE6D1] text-[#2D3829] flex items-center justify-center shrink-0">
                          <Flower2 className="w-3.5 h-3.5" />
                        </span>

                        {isEditing ? (
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-[#FAF3E8] border border-[#C98D9B] text-sm text-[#4A3B36] focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(note)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#566251] text-white text-xs font-medium"
                              >
                                <Check className="w-3 h-3" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF3E8] text-[#76635B] text-xs"
                              >
                                <X className="w-3 h-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0">
                            <p className="text-sm sm:text-[15px] text-[#4A3B36] leading-relaxed">
                              {note.text}
                            </p>
                            {note.isSample && (
                              <span className="inline-block mt-1 text-[11px] text-[#83505C]">
                                Sample
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(note.id);
                              setEditText(note.text);
                            }}
                            aria-label="Edit gratitude note"
                            className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(note)}
                            aria-label="Delete gratitude note"
                            className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </PaperCard>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete gratitude note?"
        message="This note will be removed from your Gratitude Corner."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDeleteGratitude(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
