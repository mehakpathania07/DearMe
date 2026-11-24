import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  BookHeart,
  Calendar as CalendarIcon,
  Camera,
  Flower2,
  Heart,
  Home,
  Lock,
  Mail,
  MoreHorizontal,
  Shield,
  Smile,
  X,
} from 'lucide-react';
import type {
  AppSection,
  DearMeStore,
  DiaryEntry,
  FutureLetter,
  GratitudeNote,
  MemoryItem,
  MoodRecord,
  MoodType,
  PrivacySettings,
} from './types/diary';
import {
  generateId,
  getTodayISO,
  loadInitialStore,
  saveEntries,
  saveGratitudes,
  saveLetters,
  saveMemories,
  saveMoods,
  savePrivacySettings,
} from './utils/storage';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { PrivacyLockScreen } from './components/PrivacyLockScreen';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { HomePage } from './pages/HomePage';
import { DiaryPage } from './pages/DiaryPage';
import { MoodJournalPage } from './pages/MoodJournalPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { CalendarPage } from './pages/CalendarPage';
import { FutureLettersPage } from './pages/FutureLettersPage';
import { GratitudePage } from './pages/GratitudePage';
import { FavouritesPage } from './pages/FavouritesPage';

interface NavItem {
  id: AppSection;
  label: string;
  shortLabel: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', shortLabel: 'Home', icon: Home },
  { id: 'diary', label: 'My Diary', shortLabel: 'Diary', icon: BookHeart },
  { id: 'mood', label: 'Mood Journal', shortLabel: 'Mood', icon: Smile },
  { id: 'memories', label: 'Memories', shortLabel: 'Memories', icon: Camera },
  { id: 'calendar', label: 'Calendar', shortLabel: 'Calendar', icon: CalendarIcon },
  { id: 'letters', label: 'Future Letters', shortLabel: 'Letters', icon: Mail },
  { id: 'gratitude', label: 'Gratitude', shortLabel: 'Gratitude', icon: Flower2 },
  { id: 'favourites', label: 'Favourites', shortLabel: 'Favourites', icon: Heart },
];

export default function App() {
  const prefersReduced = useReducedMotion();
  const [store, setStore] = useState<DearMeStore>(() => loadInitialStore());
  const [activeSection, setActiveSection] = useState<AppSection>('home');

  // Diary navigation state
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);

  // Privacy & Lock state
  const [isLocked, setIsLocked] = useState<boolean>(
    () => loadInitialStore().privacy.pinEnabled,
  );
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);

  const hasSampleData =
    store.entries.some((e) => e.isSample) ||
    store.moods.some((m) => m.isSample) ||
    store.memories.some((m) => m.isSample) ||
    store.letters.some((l) => l.isSample) ||
    store.gratitudes.some((g) => g.isSample);

  // Auto-lock after configurable period of inactivity
  useEffect(() => {
    if (!store.privacy.pinEnabled || store.privacy.autoLockMinutes <= 0 || isLocked) {
      return;
    }

    const timeoutMs = store.privacy.autoLockMinutes * 60 * 1000;
    let timerId = window.setTimeout(() => setIsLocked(true), timeoutMs);

    const resetTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setIsLocked(true), timeoutMs);
    };

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'keydown',
      'scroll',
      'touchstart',
    ];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    return () => {
      window.clearTimeout(timerId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [store.privacy.pinEnabled, store.privacy.autoLockMinutes, isLocked]);

  // Persistence actions
  const handleSaveEntry = useCallback((entry: DiaryEntry) => {
    setStore((prev) => {
      const exists = prev.entries.some((e) => e.id === entry.id);
      const nextEntries = exists
        ? prev.entries.map((e) => (e.id === entry.id ? entry : e))
        : [entry, ...prev.entries];
      saveEntries(nextEntries);
      return { ...prev, entries: nextEntries };
    });
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    setStore((prev) => {
      const nextEntries = prev.entries.filter((e) => e.id !== id);
      saveEntries(nextEntries);
      return { ...prev, entries: nextEntries };
    });
  }, []);

  const handleToggleEntryFavourite = useCallback((id: string) => {
    setStore((prev) => {
      const nextEntries = prev.entries.map((e) =>
        e.id === id ? { ...e, isFavourite: !e.isFavourite } : e,
      );
      saveEntries(nextEntries);
      return { ...prev, entries: nextEntries };
    });
  }, []);

  const handleSaveMood = useCallback((record: MoodRecord) => {
    setStore((prev) => {
      const exists = prev.moods.some(
        (m) => m.id === record.id || m.date === record.date,
      );
      const nextMoods = exists
        ? prev.moods.map((m) =>
            m.id === record.id || m.date === record.date ? record : m,
          )
        : [record, ...prev.moods];
      saveMoods(nextMoods);
      return { ...prev, moods: nextMoods };
    });
  }, []);

  const handleSelectTodayMood = useCallback(
    (mood: MoodType) => {
      const todayISO = getTodayISO();
      const existing = store.moods.find((m) => m.date === todayISO);
      const record: MoodRecord = {
        id: existing ? existing.id : generateId('mood'),
        date: todayISO,
        mood,
        note: existing?.note,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        isSample: false,
      };
      handleSaveMood(record);
    },
    [store.moods, handleSaveMood],
  );

  const handleDeleteMood = useCallback((id: string) => {
    setStore((prev) => {
      const nextMoods = prev.moods.filter((m) => m.id !== id);
      saveMoods(nextMoods);
      return { ...prev, moods: nextMoods };
    });
  }, []);

  const handleAddMemory = useCallback((item: MemoryItem) => {
    setStore((prev) => {
      const nextMemories = [item, ...prev.memories];
      saveMemories(nextMemories);
      return { ...prev, memories: nextMemories };
    });
  }, []);

  const handleDeleteMemory = useCallback((id: string) => {
    setStore((prev) => {
      const nextMemories = prev.memories.filter((m) => m.id !== id);
      saveMemories(nextMemories);
      return { ...prev, memories: nextMemories };
    });
  }, []);

  const handleToggleMemoryFavourite = useCallback((id: string) => {
    setStore((prev) => {
      const nextMemories = prev.memories.map((m) =>
        m.id === id ? { ...m, isFavourite: !m.isFavourite } : m,
      );
      saveMemories(nextMemories);
      return { ...prev, memories: nextMemories };
    });
  }, []);

  const handleSaveLetter = useCallback((letter: FutureLetter) => {
    setStore((prev) => {
      const exists = prev.letters.some((l) => l.id === letter.id);
      const nextLetters = exists
        ? prev.letters.map((l) => (l.id === letter.id ? letter : l))
        : [letter, ...prev.letters];
      saveLetters(nextLetters);
      return { ...prev, letters: nextLetters };
    });
  }, []);

  const handleDeleteLetter = useCallback((id: string) => {
    setStore((prev) => {
      const nextLetters = prev.letters.filter((l) => l.id !== id);
      saveLetters(nextLetters);
      return { ...prev, letters: nextLetters };
    });
  }, []);

  const handleToggleLetterFavourite = useCallback((id: string) => {
    setStore((prev) => {
      const nextLetters = prev.letters.map((l) =>
        l.id === id ? { ...l, isFavourite: !l.isFavourite } : l,
      );
      saveLetters(nextLetters);
      return { ...prev, letters: nextLetters };
    });
  }, []);

  const handleSaveGratitude = useCallback((note: GratitudeNote) => {
    setStore((prev) => {
      const exists = prev.gratitudes.some((g) => g.id === note.id);
      const nextGratitudes = exists
        ? prev.gratitudes.map((g) => (g.id === note.id ? note : g))
        : [note, ...prev.gratitudes];
      saveGratitudes(nextGratitudes);
      return { ...prev, gratitudes: nextGratitudes };
    });
  }, []);

  const handleDeleteGratitude = useCallback((id: string) => {
    setStore((prev) => {
      const nextGratitudes = prev.gratitudes.filter((g) => g.id !== id);
      saveGratitudes(nextGratitudes);
      return { ...prev, gratitudes: nextGratitudes };
    });
  }, []);

  const handleSavePrivacy = useCallback((privacy: PrivacySettings) => {
    setStore((prev) => {
      savePrivacySettings(privacy);
      return { ...prev, privacy };
    });
  }, []);

  const handleClearSamples = useCallback(() => {
    setStore((prev) => {
      const entries = prev.entries.filter((e) => !e.isSample);
      const moods = prev.moods.filter((m) => !m.isSample);
      const memories = prev.memories.filter((m) => !m.isSample);
      const letters = prev.letters.filter((l) => !l.isSample);
      const gratitudes = prev.gratitudes.filter((g) => !g.isSample);
      saveEntries(entries);
      saveMoods(moods);
      saveMemories(memories);
      saveLetters(letters);
      saveGratitudes(gratitudes);
      return { ...prev, entries, moods, memories, letters, gratitudes };
    });
  }, []);

  const navigateTo = (section: AppSection) => {
    setActiveSection(section);
    setShowMobileMore(false);
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  const openEntryInDiary = (entryId: string) => {
    setSelectedEntryId(entryId);
    setDraftDate(null);
    navigateTo('diary');
  };

  const writeForDate = (isoDate: string) => {
    setSelectedEntryId(null);
    setDraftDate(isoDate);
    navigateTo('diary');
  };

  // Never render private diary content while locked
  if (isLocked) {
    return (
      <PrivacyLockScreen
        expectedPin={store.privacy.pinCode || '1234'}
        onUnlock={() => setIsLocked(false)}
      />
    );
  }

  const primaryMobileTabs = NAV_ITEMS.slice(0, 4);
  const secondaryMobileTabs = NAV_ITEMS.slice(4);
  const isSecondaryActive = secondaryMobileTabs.some((t) => t.id === activeSection);

  return (
    <div className="relative min-h-screen w-full bg-[#F7F0E5] paper-grain text-[#4A3B36]">
      <AmbientBackdrop />

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Linen-Bound Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#FAF3E8]/92 backdrop-blur-md border-r border-[#E9DDCB] px-4 py-7 justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="w-full text-left px-3 py-1.5 rounded-xl focus-visible:outline-2 focus-visible:outline-[#83505C]"
            >
              <span className="font-serif text-2xl font-semibold tracking-tight text-[#4A3B36] whitespace-nowrap">
                DearMe ♡
              </span>
              <span className="block font-script text-base text-[#76635B] mt-0.5">
                personal keepsake
              </span>
            </button>

            <nav aria-label="Diary navigation" className="mt-7 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#F5DDE3] text-[#532733] shadow-xs'
                        : 'text-[#514346] hover:bg-[#F5DDE3]/45 hover:text-[#4A3B36]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#83505C]' : 'text-[#76635B]'
                      }`}
                      strokeWidth={1.85}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Privacy & Lock Footer Controls */}
          <div className="pt-4 border-t border-[#E9DDCB] space-y-2">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#514346] hover:bg-[#F5DDE3]/45 transition-colors"
            >
              <Shield className="w-4 h-4 text-[#76635B] shrink-0" />
              <span>Privacy &amp; Settings</span>
            </button>

            {store.privacy.pinEnabled ? (
              <button
                type="button"
                onClick={() => setIsLocked(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#83505C] bg-[#F9E9ED] hover:bg-[#F5DDE3] transition-colors"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Lock Diary Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#76635B] hover:bg-[#E9DDCB]/45 transition-colors"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>Set up PIN Lock</span>
              </button>
            )}
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Compact Mobile / Tablet Top Bar (48px) */}
          <header className="lg:hidden sticky top-0 z-30 h-12 px-4 bg-[#FAF3E8]/92 backdrop-blur-md border-b border-[#E9DDCB] flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="font-serif text-lg font-semibold text-[#4A3B36] whitespace-nowrap shrink-0"
            >
              DearMe ♡
            </button>

            <div className="flex items-center gap-2 shrink-0">
              {store.privacy.pinEnabled && (
                <button
                  type="button"
                  onClick={() => setIsLocked(true)}
                  aria-label="Lock diary"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#83505C] hover:bg-[#F5DDE3]/60"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                aria-label="Privacy settings"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Page Canvas */}
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-20 lg:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReduced ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'home' && (
                  <HomePage
                    entries={store.entries}
                    moods={store.moods}
                    memories={store.memories}
                    hasSampleData={hasSampleData}
                    onNavigate={navigateTo}
                    onWriteToday={() => writeForDate(getTodayISO())}
                    onOpenEntry={openEntryInDiary}
                    onSelectTodayMood={handleSelectTodayMood}
                    onClearSamples={handleClearSamples}
                  />
                )}

                {activeSection === 'diary' && (
                  <DiaryPage
                    entries={store.entries}
                    selectedEntryId={selectedEntryId}
                    draftDate={draftDate}
                    onSaveEntry={handleSaveEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onToggleFavourite={handleToggleEntryFavourite}
                    onClearSelection={() => {
                      setSelectedEntryId(null);
                      setDraftDate(null);
                    }}
                  />
                )}

                {activeSection === 'mood' && (
                  <MoodJournalPage
                    moods={store.moods}
                    onSaveMood={handleSaveMood}
                    onDeleteMood={handleDeleteMood}
                  />
                )}

                {activeSection === 'memories' && (
                  <MemoriesPage
                    memories={store.memories}
                    onAddMemory={handleAddMemory}
                    onDeleteMemory={handleDeleteMemory}
                    onToggleFavourite={handleToggleMemoryFavourite}
                  />
                )}

                {activeSection === 'calendar' && (
                  <CalendarPage
                    entries={store.entries}
                    moods={store.moods}
                    gratitudes={store.gratitudes}
                    onOpenEntry={openEntryInDiary}
                    onWriteForDate={writeForDate}
                  />
                )}

                {activeSection === 'letters' && (
                  <FutureLettersPage
                    letters={store.letters}
                    onSaveLetter={handleSaveLetter}
                    onDeleteLetter={handleDeleteLetter}
                    onToggleFavourite={handleToggleLetterFavourite}
                  />
                )}

                {activeSection === 'gratitude' && (
                  <GratitudePage
                    gratitudes={store.gratitudes}
                    onSaveGratitude={handleSaveGratitude}
                    onDeleteGratitude={handleDeleteGratitude}
                  />
                )}

                {activeSection === 'favourites' && (
                  <FavouritesPage
                    entries={store.entries}
                    memories={store.memories}
                    letters={store.letters}
                    onOpenEntry={openEntryInDiary}
                    onUnfavouriteEntry={handleToggleEntryFavourite}
                    onUnfavouriteMemory={handleToggleMemoryFavourite}
                    onUnfavouriteLetter={handleToggleLetterFavourite}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Compact Mobile Bottom Navigation Bar (56px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-[#FAF3E8]/95 backdrop-blur-md border-t border-[#E9DDCB] grid grid-cols-5 items-center"
      >
        {primaryMobileTabs.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active ? 'text-[#83505C]' : 'text-[#76635B]'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.75} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowMobileMore(true)}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
            isSecondaryActive ? 'text-[#83505C]' : 'text-[#76635B]'
          }`}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Sheet */}
      {showMobileMore && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-[#4A3B36]/35 backdrop-blur-xs flex items-end"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowMobileMore(false)}
        >
          <motion.div
            initial={prefersReduced ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-[#FFFAF3] rounded-t-3xl p-5 pb-7 border-t border-[#E9DDCB] floating-shadow"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DDCB]/70">
              <span className="font-serif text-lg font-medium text-[#4A3B36]">
                More Pages
              </span>
              <button
                type="button"
                onClick={() => setShowMobileMore(false)}
                aria-label="Close menu"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {secondaryMobileTabs.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium border transition-colors ${
                      active
                        ? 'bg-[#F5DDE3] border-[#C98D9B] text-[#532733]'
                        : 'bg-[#FAF3E8] border-[#E9DDCB] text-[#4A3B36]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#83505C] shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setShowMobileMore(false);
                  setShowPrivacyModal(true);
                }}
                className="col-span-2 min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium bg-[#F9E9ED] border border-[#C98D9B]/40 text-[#532733]"
              >
                <Shield className="w-4 h-4" />
                <span>Privacy &amp; PIN Lock Settings</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <PrivacySettingsModal
          open={showPrivacyModal}
          privacy={store.privacy}
          hasSampleData={hasSampleData}
          storeSnapshot={store}
          onSavePrivacy={handleSavePrivacy}
          onLockNow={(nextPrivacy) => {
            handleSavePrivacy(nextPrivacy);
            setShowPrivacyModal(false);
            setIsLocked(true);
          }}
          onClearSamples={handleClearSamples}
          onClose={() => setShowPrivacyModal(false)}
        />
      )}
    </div>
  );
}
