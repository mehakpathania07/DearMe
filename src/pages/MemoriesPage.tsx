import { useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Check,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { MemoryItem, MemoryMotif } from '../types/diary';
import {
  compressImageFile,
  formatFriendlyDate,
  formatShortDate,
  generateId,
  getTodayISO,
} from '../utils/storage';
import {
  ConfirmModal,
  MemoryMotifArtwork,
  PaperCard,
  WashiTape,
} from '../components/ScrapbookDecor';

interface MemoriesPageProps {
  memories: MemoryItem[];
  onAddMemory: (item: MemoryItem) => void;
  onDeleteMemory: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

const MOTIF_CHOICES: { id: MemoryMotif; label: string }[] = [
  { id: 'blossom', label: 'Peony' },
  { id: 'tea', label: 'Warm Tea' },
  { id: 'sunset', label: 'Golden Sky' },
  { id: 'starlight', label: 'Starlight' },
];

export function MemoriesPage({
  memories,
  onAddMemory,
  onDeleteMemory,
  onToggleFavourite,
}: MemoriesPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [motif, setMotif] = useState<MemoryMotif>('blossom');
  const [isFavourite, setIsFavourite] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const [lightboxItem, setLightboxItem] = useState<MemoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MemoryItem | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setPhotoDataUrl(compressed);
      setErrorMsg('');
    } catch {
      setErrorMsg('Unable to load that image file. Please try another photo.');
    }
  };

  const handleSave = () => {
    if (!caption.trim()) {
      setErrorMsg('Add a short caption for this memory.');
      return;
    }

    const item: MemoryItem = {
      id: generateId('mem'),
      caption: caption.trim(),
      date: date || getTodayISO(),
      photoDataUrl,
      motif: photoDataUrl ? undefined : motif,
      isFavourite,
      createdAt: new Date().toISOString(),
      isSample: false,
    };

    onAddMemory(item);
    setCaption('');
    setDate(getTodayISO());
    setPhotoDataUrl(undefined);
    setMotif('blossom');
    setIsFavourite(false);
    setErrorMsg('');
    setShowForm(false);
    setSavedNotice('Pinned to your Polaroid wall ♡');
    setTimeout(() => setSavedNotice(''), 2800);
  };

  const sortedMemories = [...memories].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
            Memory Gallery
          </h1>
          <p className="mt-1 text-sm text-[#76635B]">
            Collect small Polaroids, captions, and moments worth pinning up.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium rose-glow transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Close Form' : 'New Polaroid'}
        </button>
      </div>

      {savedNotice && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DAE6D1] text-[#2D3829] text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Create Memory Card Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-2"
        >
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="sage" tilt="right" />
          </div>
          <PaperCard variant="cream" className="p-6 sm:p-8">
            <h2 className="font-serif text-xl font-medium text-[#4A3B36]">
              Pin a New Memory
            </h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Preview Polaroid Frame */}
              <div className="md:col-span-5 flex justify-center">
                <div className="w-full max-w-[260px] bg-white p-3 pb-7 rounded-xl paper-shadow border border-[#E9DDCB] -rotate-1">
                  <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#FAF3E8] border border-[#76635B]/10">
                    {photoDataUrl ? (
                      <img
                        src={photoDataUrl}
                        alt="Memory preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MemoryMotifArtwork motif={motif} />
                    )}
                  </div>
                  <p className="mt-3 font-script text-xl text-[#4A3B36] min-h-[28px]">
                    {caption.trim() || 'Your handwritten caption...'}
                  </p>
                  <p className="text-xs text-[#76635B]">
                    {formatShortDate(date || getTodayISO())}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label
                    htmlFor="memory-caption"
                    className="block text-xs font-medium text-[#76635B] mb-1.5"
                  >
                    Caption
                  </label>
                  <input
                    id="memory-caption"
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Iced matcha after the rain..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/55 focus:outline-none focus:border-[#C98D9B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="memory-date"
                      className="block text-xs font-medium text-[#76635B] mb-1.5"
                    >
                      Memory Date
                    </label>
                    <input
                      id="memory-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] focus:outline-none focus:border-[#C98D9B]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setIsFavourite((v) => !v)}
                      className={`w-full min-h-[42px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        isFavourite
                          ? 'bg-[#F9E9ED] border-[#C98D9B] text-[#83505C]'
                          : 'bg-[#FAF3E8] border-[#E9DDCB] text-[#4A3B36]'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFavourite ? 'fill-[#C98D9B] text-[#C98D9B]' : ''
                        }`}
                      />
                      {isFavourite ? 'Marked as Favourite' : 'Mark as Favourite'}
                    </button>
                  </div>
                </div>

                {/* Optional Photo Upload */}
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-[#76635B]">
                    Photo (optional — or choose a keepsake illustration below)
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5DDE3]/80 hover:bg-[#F5DDE3] text-xs font-medium text-[#4A3B36] cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-[#83505C]" />
                      <span>{photoDataUrl ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    {photoDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoDataUrl(undefined)}
                        className="text-xs text-[#76635B] hover:text-[#BA1A1A] underline underline-offset-4"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>

                  {!photoDataUrl && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {MOTIF_CHOICES.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMotif(m.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            motif === m.id
                              ? 'bg-[#C98D9B] text-white border-[#C98D9B]'
                              : 'bg-[#FAF3E8] text-[#4A3B36] border-[#E9DDCB]'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-xs font-medium text-[#BA1A1A]">{errorMsg}</p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Save Polaroid
                  </button>
                </div>
              </div>
            </div>
          </PaperCard>
        </motion.div>
      )}

      {/* Polaroid Wall Grid */}
      {sortedMemories.length === 0 ? (
        <PaperCard variant="cream" className="p-10 text-center">
          <Camera className="w-9 h-9 text-[#C98D9B] mx-auto" strokeWidth={1.5} />
          <h2 className="mt-3 font-serif text-xl text-[#4A3B36]">
            Your Polaroid wall is empty
          </h2>
          <p className="mt-1.5 text-sm text-[#76635B]">
            Add a favorite snapshot or a quiet text keepsake to begin.
          </p>
        </PaperCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 pt-2">
          {sortedMemories.map((mem, idx) => {
            const tilts = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
            const tiltClass = tilts[idx % tilts.length];
            const tapeTones: Array<'beige' | 'sage' | 'blush' | 'lavender'> = [
              'blush',
              'sage',
              'beige',
              'lavender',
            ];

            return (
              <div
                key={mem.id}
                className={`relative bg-white p-3.5 pb-6 rounded-xl paper-shadow border border-[#E9DDCB]/80 transition-transform duration-200 hover:rotate-0 hover:-translate-y-1 ${tiltClass}`}
              >
                <div className="flex justify-center -mt-6 mb-2">
                  <WashiTape
                    tone={tapeTones[idx % tapeTones.length]}
                    tilt={idx % 2 === 0 ? 'left' : 'right'}
                    className="w-20 h-4"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxItem(mem)}
                  className="block w-full aspect-[4/3] rounded-md overflow-hidden bg-[#FAF3E8] border border-[#76635B]/10 focus-visible:outline-2 focus-visible:outline-[#83505C]"
                >
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
                </button>

                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-script text-xl leading-snug text-[#4A3B36]">
                      {mem.caption}
                    </p>
                    <p className="mt-0.5 text-xs text-[#76635B]">
                      {formatShortDate(mem.date)}
                      {mem.isSample ? ' · Sample' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavourite(mem.id)}
                      aria-label={
                        mem.isFavourite
                          ? 'Remove memory from favourites'
                          : 'Mark memory as favourite'
                      }
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5DDE3]/60 transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          mem.isFavourite
                            ? 'text-[#C98D9B] fill-[#C98D9B]'
                            : 'text-[#76635B]'
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(mem)}
                      aria-label={`Delete memory ${mem.caption}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3B36]/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxItem(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white p-4 sm:p-5 pb-8 rounded-2xl floating-shadow border border-[#E9DDCB]"
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Close memory viewer"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#FAF3E8] border border-[#76635B]/10">
              {lightboxItem.photoDataUrl ? (
                <img
                  src={lightboxItem.photoDataUrl}
                  alt={lightboxItem.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain bg-[#FAF3E8]"
                />
              ) : (
                <MemoryMotifArtwork motif={lightboxItem.motif || 'blossom'} />
              )}
            </div>
            <p className="mt-4 font-script text-2xl text-[#4A3B36] text-center">
              {lightboxItem.caption}
            </p>
            <p className="mt-1 text-xs text-[#76635B] text-center">
              {formatFriendlyDate(lightboxItem.date)}
            </p>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove this Polaroid?"
        message="This memory card will be removed from your gallery."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDeleteMemory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
