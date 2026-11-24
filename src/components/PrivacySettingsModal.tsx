import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Lock, ShieldAlert, Trash2, X } from 'lucide-react';
import type { DearMeStore, PrivacySettings } from '../types/diary';

interface PrivacySettingsModalProps {
  open: boolean;
  privacy: PrivacySettings;
  hasSampleData: boolean;
  storeSnapshot: DearMeStore;
  onSavePrivacy: (next: PrivacySettings) => void;
  onLockNow: (next: PrivacySettings) => void;
  onClearSamples: () => void;
  onClose: () => void;
}

export function PrivacySettingsModal({
  open,
  privacy,
  hasSampleData,
  storeSnapshot,
  onSavePrivacy,
  onLockNow,
  onClearSamples,
  onClose,
}: PrivacySettingsModalProps) {
  const [pinEnabled, setPinEnabled] = useState(privacy.pinEnabled);
  const [pinCode, setPinCode] = useState(privacy.pinCode || '1234');
  const [autoLockMinutes, setAutoLockMinutes] = useState<0 | 1 | 5 | 15>(
    privacy.autoLockMinutes,
  );
  const [pinError, setPinError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    if (pinEnabled && !/^\d{4}$/.test(pinCode)) {
      setPinError('Please enter a 4-digit numeric PIN.');
      return;
    }
    setPinError('');
    onSavePrivacy({
      pinEnabled,
      pinCode: /^\d{4}$/.test(pinCode) ? pinCode : '1234',
      autoLockMinutes,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  const handleLockImmediately = () => {
    if (!/^\d{4}$/.test(pinCode)) {
      setPinError('Please enter a 4-digit numeric PIN before locking.');
      return;
    }
    setPinError('');
    onLockNow({
      pinEnabled: true,
      pinCode,
      autoLockMinutes,
    });
  };

  const handleExportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'DearMe Journal',
      data: {
        entries: storeSnapshot.entries,
        moods: storeSnapshot.moods,
        memories: storeSnapshot.memories,
        letters: storeSnapshot.letters,
        gratitudes: storeSnapshot.gratitudes,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dearme-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3B36]/35 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-settings-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFAF3] rounded-3xl p-6 sm:p-7 floating-shadow border border-[#E9DDCB]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="privacy-settings-title"
              className="font-serif text-2xl font-medium text-[#4A3B36]"
            >
              Privacy & Keepsake Settings
            </h2>
            <p className="mt-1 text-sm text-[#76635B]">
              Keep your diary tucked away when stepping away from your screen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close privacy settings"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#76635B] hover:bg-[#F5DDE3]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Honest localStorage disclosure */}
        <div className="mt-5 rounded-2xl bg-[#F9E9ED]/80 border border-[#C98D9B]/35 p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-[#83505C] shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-[#532733]">
            <p className="font-semibold">About Local Privacy</p>
            <p className="mt-1">
              In this initial version, entries are saved in your browser&apos;s{' '}
              <span className="font-medium">localStorage</span> without encryption. A
              client-side PIN provides a gentle visual privacy screen rather than strong
              cryptographic security.
            </p>
          </div>
        </div>

        {/* PIN Lock Toggle */}
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4 py-2 border-b border-[#E9DDCB]/70">
            <div>
              <p className="text-sm font-medium text-[#4A3B36]">Enable PIN Lock</p>
              <p className="text-xs text-[#76635B]">
                Require a 4-digit PIN when opening or unlocking DearMe.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={pinEnabled}
              onClick={() => setPinEnabled((v) => !v)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                pinEnabled ? 'bg-[#C98D9B]' : 'bg-[#E9DDCB]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-[#FFFAF3] shadow-xs transform transition-transform duration-200 ${
                  pinEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* PIN Input */}
          <div>
            <label
              htmlFor="privacy-pin-input"
              className="block text-sm font-medium text-[#4A3B36]"
            >
              4-Digit Diary PIN
            </label>
            <input
              id="privacy-pin-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinCode}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPinCode(onlyDigits);
                setPinError('');
              }}
              placeholder="e.g. 1234"
              className="mt-1.5 w-36 px-3.5 py-2 rounded-xl bg-[#FAF3E8] border border-[#E9DDCB] text-[#4A3B36] tracking-[0.35em] text-center font-medium focus:outline-none focus:border-[#C98D9B]"
            />
            {pinError && (
              <p className="mt-1.5 text-xs text-[#BA1A1A]">{pinError}</p>
            )}
          </div>

          {/* Auto-Lock Timeout */}
          <div>
            <p className="text-sm font-medium text-[#4A3B36]">
              Auto-Lock After Inactivity
            </p>
            <p className="text-xs text-[#76635B]">
              Automatically closes your diary when PIN lock is enabled.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {(
                [
                  { val: 0, label: 'Off' },
                  { val: 1, label: '1 min' },
                  { val: 5, label: '5 mins' },
                  { val: 15, label: '15 mins' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAutoLockMinutes(opt.val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    autoLockMinutes === opt.val
                      ? 'bg-[#C98D9B] text-white'
                      : 'bg-[#FAF3E8] text-[#4A3B36] border border-[#E9DDCB] hover:bg-[#F5DDE3]/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save & Manual Lock */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleLockImmediately}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-[#4A3B36] bg-[#F5DDE3] hover:bg-[#f0ced7] transition-colors active:scale-[0.98]"
            >
              <Lock className="w-4 h-4 text-[#83505C]" />
              Lock Diary Now
            </button>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <span className="text-xs font-medium text-[#566251]">
                  Saved ♡
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-white bg-[#C98D9B] hover:bg-[#83505C] transition-colors active:scale-[0.98]"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Data Tools */}
        <div className="mt-7 pt-5 border-t border-[#E9DDCB]/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-[#4A3B36] bg-[#FAF3E8] border border-[#E9DDCB] hover:bg-[#F5DDE3]/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup (JSON)
          </button>

          {hasSampleData && (
            <button
              type="button"
              onClick={onClearSamples}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium text-[#83505C] bg-[#F9E9ED] hover:bg-[#F5DDE3] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Sample Preview Data
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
