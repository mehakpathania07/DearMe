import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Clock,
  Heart,
  Lock,
  Mail,
  MailOpen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { FutureLetter } from '../types/diary';
import {
  formatFriendlyDate,
  generateId,
  getTodayISO,
  parseLocalDate,
  shiftDaysISO,
} from '../utils/storage';
import { ConfirmModal, PaperCard, WashiTape } from '../components/ScrapbookDecor';

interface FutureLettersPageProps {
  letters: FutureLetter[];
  onSaveLetter: (letter: FutureLetter) => void;
  onDeleteLetter: (id: string) => void;
  onToggleFavourite: (id: string) => void;
}

function getDaysRemaining(openDateISO: string, todayISO: string): number {
  const open = parseLocalDate(openDateISO).getTime();
  const today = parseLocalDate(todayISO).getTime();
  return Math.max(0, Math.ceil((open - today) / (1000 * 60 * 60 * 24)));
}

export function FutureLettersPage({
  letters,
  onSaveLetter,
  onDeleteLetter,
  onToggleFavourite,
}: FutureLettersPageProps) {
  const todayISO = getTodayISO();
  const [showComposer, setShowComposer] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [openDate, setOpenDate] = useState(shiftDaysISO(new Date(), 30));
  const [body, setBody] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [earlyNotice, setEarlyNotice] = useState('');
  const [openedLetter, setOpenedLetter] = useState<FutureLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FutureLetter | null>(null);

  const startNew = () => {
    setEditingId(null);
    setTitle('');
    setOpenDate(shiftDaysISO(new Date(), 30));
    setBody('');
    setErrorMsg('');
    setShowComposer(true);
  };

  const startEdit = (letter: FutureLetter) => {
    setEditingId(letter.id);
    setTitle(letter.title);
    setOpenDate(letter.openDate);
    setBody(letter.body);
    setErrorMsg('');
    setShowComposer(true);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      setErrorMsg('Give your letter a title and write a few heartfelt lines.');
      return;
    }
    if (!openDate) {
      setErrorMsg('Please choose an opening date.');
      return;
    }

    const existing = editingId ? letters.find((l) => l.id === editingId) : undefined;
    const saved: FutureLetter = {
      id: existing ? existing.id : generateId('letter'),
      title: title.trim(),
      body: body.trim(),
      writtenDate: existing ? existing.writtenDate : todayISO,
      openDate,
      openedAt: existing?.openedAt,
      isFavourite: existing?.isFavourite ?? false,
      isSample: false,
    };

    onSaveLetter(saved);
    setShowComposer(false);
    setEditingId(null);
    setTitle('');
    setBody('');
    setErrorMsg('');
  };

  const handleEnvelopeClick = (letter: FutureLetter) => {
    const canOpen = letter.openDate <= todayISO;
    if (!canOpen) {
      const daysLeft = getDaysRemaining(letter.openDate, todayISO);
      setEarlyNotice(
        `"${letter.title}" is sealed until ${formatFriendlyDate(
          letter.openDate,
        )} (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} remaining) ♡`,
      );
      setTimeout(() => setEarlyNotice(''), 4200);
      return;
    }

    // Mark as opened if first time opening
    if (!letter.openedAt) {
      const updated = { ...letter, openedAt: new Date().toISOString() };
      onSaveLetter(updated);
      setOpenedLetter(updated);
    } else {
      setOpenedLetter(letter);
    }
  };

  const sortedLetters = [...letters].sort((a, b) =>
    a.openDate.localeCompare(b.openDate),
  );

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#4A3B36]">
            Letters to Future Me ♡
          </h1>
          <p className="mt-1 text-sm text-[#76635B]">
            Seal notes in wax envelopes today and unseal them when their day arrives.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (showComposer ? setShowComposer(false) : startNew())}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium rose-glow transition-all active:scale-[0.98] whitespace-nowrap shrink-0"
        >
          {showComposer ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showComposer ? 'Close Composer' : 'Write a Letter'}
        </button>
      </div>

      {earlyNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#F9E9ED] border border-[#C98D9B]/50 text-sm text-[#532733]"
          role="status"
        >
          <Lock className="w-4 h-4 text-[#83505C] shrink-0" />
          <span>{earlyNotice}</span>
        </motion.div>
      )}

      {/* Composer */}
      {showComposer && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-2"
        >
          <div className="flex justify-center -mb-2.5 relative z-10">
            <WashiTape tone="lavender" tilt="center" />
          </div>
          <PaperCard variant="cream" className="p-6 sm:p-8">
            <h2 className="font-serif text-xl font-medium text-[#4A3B36]">
              {editingId ? 'Edit Your Sealed Letter' : 'Seal a Letter to Future You'}
            </h2>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label
                  htmlFor="letter-title"
                  className="block text-xs font-medium text-[#76635B] mb-1.5"
                >
                  Letter Title
                </label>
                <input
                  id="letter-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Read this on a quiet spring morning..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/55 focus:outline-none focus:border-[#C98D9B]"
                />
              </div>

              <div className="sm:col-span-4">
                <label
                  htmlFor="letter-open-date"
                  className="block text-xs font-medium text-[#76635B] mb-1.5"
                >
                  Opening Date
                </label>
                <input
                  id="letter-open-date"
                  type="date"
                  value={openDate}
                  onChange={(e) => setOpenDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-sm text-[#4A3B36] focus:outline-none focus:border-[#C98D9B]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="letter-body"
                className="block text-xs font-medium text-[#76635B] mb-1.5"
              >
                Your Letter
              </label>
              <textarea
                id="letter-body"
                rows={7}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Dear Future Me, I hope when you open this envelope..."
                className="w-full notebook-lines px-4 py-2 rounded-2xl bg-[#FAF3E8]/70 border border-[#E9DDCB] text-[15px] text-[#4A3B36] placeholder:font-serif placeholder:italic placeholder:text-[#76635B]/55 focus:outline-none focus:border-[#C98D9B]"
              />
            </div>

            {errorMsg && (
              <p className="mt-3 text-xs font-medium text-[#BA1A1A]">{errorMsg}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="px-4 py-2.5 rounded-full text-sm font-medium text-[#4A3B36] bg-[#F5DDE3]/75 hover:bg-[#F5DDE3] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingId ? 'Save Changes' : 'Seal Envelope'}
              </button>
            </div>
          </PaperCard>
        </motion.div>
      )}

      {/* Envelopes Grid */}
      {sortedLetters.length === 0 ? (
        <PaperCard variant="cream" className="p-10 text-center">
          <Mail className="w-9 h-9 text-[#C98D9B] mx-auto" strokeWidth={1.5} />
          <h2 className="mt-3 font-serif text-xl text-[#4A3B36]">
            No letters sealed yet
          </h2>
          <p className="mt-1.5 text-sm text-[#76635B]">
            Write a gentle note to your future self and pick a day to open it.
          </p>
        </PaperCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLetters.map((letter) => {
            const isLocked = letter.openDate > todayISO;
            const daysLeft = getDaysRemaining(letter.openDate, todayISO);
            const isOpened = Boolean(letter.openedAt);

            return (
              <div
                key={letter.id}
                className={`relative rounded-2xl p-5 sm:p-6 paper-shadow border transition-all ${
                  isLocked
                    ? 'bg-[#F9E9ED]/85 border-[#C98D9B]/40'
                    : 'bg-[#FFFAF3] border-[#E9DDCB] hover:-translate-y-0.5'
                }`}
              >
                {/* Envelope flap decoration */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center ${
                      isLocked
                        ? 'bg-[#C98D9B] text-white'
                        : isOpened
                          ? 'bg-[#DAE6D1] text-[#2D3829]'
                          : 'bg-[#F5DDE3] text-[#83505C]'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : isOpened ? (
                      <MailOpen className="w-5 h-5" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => onToggleFavourite(letter.id)}
                        aria-label="Toggle favourite letter"
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-[#F5DDE3]/60"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            letter.isFavourite
                              ? 'fill-[#C98D9B] text-[#C98D9B]'
                              : 'text-[#76635B]'
                          }`}
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(letter)}
                      aria-label={`Edit ${letter.title}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(letter)}
                      aria-label={`Delete ${letter.title}`}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-[#76635B] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#76635B]">
                    <span>Written {formatFriendlyDate(letter.writtenDate)}</span>
                    {letter.isSample && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#83505C]">Sample</span>
                      </>
                    )}
                  </div>
                  <h3 className="mt-1.5 font-serif text-xl font-medium text-[#4A3B36]">
                    {letter.title}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9DDCB]/70 flex items-center justify-between gap-3">
                  <div className="text-xs text-[#76635B]">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1.5 text-[#83505C] font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Opens {formatFriendlyDate(letter.openDate)} ({daysLeft}d)
                      </span>
                    ) : isOpened ? (
                      <span className="text-[#566251] font-medium">
                        Unsealed on {formatFriendlyDate(letter.openDate)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[#83505C] font-medium">
                        <Sparkles className="w-3.5 h-3.5" />
                        Ready to open today
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEnvelopeClick(letter)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isLocked
                        ? 'bg-[#E9DDCB]/75 text-[#76635B] hover:bg-[#E9DDCB]'
                        : 'bg-[#C98D9B] hover:bg-[#83505C] text-white'
                    }`}
                  >
                    {isLocked ? 'Sealed' : isOpened ? 'Read Again' : 'Open Letter'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opened Letter Reading Modal */}
      {openedLetter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3B36]/45 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenedLetter(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[88vh] overflow-y-auto bg-[#FFFAF3] rounded-3xl p-7 sm:p-9 floating-shadow border border-[#E9DDCB]"
          >
            <div className="flex justify-center -mt-10 mb-4">
              <WashiTape tone="blush" tilt="center" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#83505C]">
                  Written {formatFriendlyDate(openedLetter.writtenDate)} · Unsealed{' '}
                  {formatFriendlyDate(openedLetter.openDate)}
                </p>
                <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-medium text-[#4A3B36]">
                  {openedLetter.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenedLetter(null)}
                aria-label="Close letter"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-dotted border-[#E9DDCB] whitespace-pre-wrap text-[16px] leading-relaxed text-[#4A3B36]">
              {openedLetter.body}
            </div>

            <div className="mt-7 flex justify-end">
              <button
                type="button"
                onClick={() => setOpenedLetter(null)}
                className="px-5 py-2.5 rounded-full bg-[#C98D9B] hover:bg-[#83505C] text-white text-sm font-medium"
              >
                Tuck Back Away ♡
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete this letter?"
        message={`Are you sure you want to remove "${
          deleteTarget?.title || 'this letter'
        }"?`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) onDeleteLetter(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
