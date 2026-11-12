import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertTriangle, X } from "lucide-react";
import { ConfirmationContext } from "./useConfirmation";

function ConfirmationDialog({ options, onResolve }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onResolve(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onResolve]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onResolve(false);
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
      >
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <AlertTriangle size={21} />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id="confirmation-dialog-title"
              className="text-base font-bold text-slate-900"
            >
              {options.title}
            </h2>
            <p
              id="confirmation-dialog-description"
              className="mt-1.5 text-sm leading-6 text-slate-500"
            >
              {options.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onResolve(false)}
            aria-label="Tutup konfirmasi"
            className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={() => onResolve(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-600/20 transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
          >
            {options.confirmLabel || "Hapus"}
          </button>
        </div>
      </section>
    </div>
  );
}
export function ConfirmationProvider({ children }) {
  const [options, setOptions] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((nextOptions) => {
    if (resolveRef.current) resolveRef.current(false);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  const resolveConfirmation = useCallback((confirmed) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setOptions(null);
    resolve?.(confirmed);
  }, []);

  useEffect(
    () => () => {
      resolveRef.current?.(false);
      resolveRef.current = null;
    },
    []
  );

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {options && (
        <ConfirmationDialog
          options={options}
          onResolve={resolveConfirmation}
        />
      )}
    </ConfirmationContext.Provider>
  );
}
