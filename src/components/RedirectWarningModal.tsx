"use client";

interface RedirectWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmakerName: string;
  url: string;
}

export function RedirectWarningModal({
  isOpen,
  onClose,
  bookmakerName,
  url,
}: RedirectWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel mx-4 w-full max-w-sm space-y-4 rounded-3xl border border-white/15 p-7 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h3 className="text-lg font-bold text-amber-400 mb-2">Ostrzeżenie</h3>
          <p className="text-sm leading-relaxed text-white/70">
            Za chwilę opuścisz naszą stronę i zostaniesz przeniesiony do zewnętrznego serwisu bukmacherskiego{" "}
            <span className="text-white font-semibold">
              {bookmakerName}
            </span>
            . Wszelkie zakłady są dokonywane na własne ryzyko.
          </p>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full rounded-2xl bg-amber-500/90 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-amber-400"
          >
            Przejdź do {bookmakerName}
          </a>
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white/72 transition hover:text-white"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
