import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  fullHeight?: boolean;
}

/**
 * モバイルではボトムシート、PC（sm 以上）では中央寄せのダイアログとして表示。
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  fullHeight = false,
}: BottomSheetProps) {
  // 開いている間は背景スクロールをロック。Esc で閉じる。
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative mx-auto flex w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-300 sm:rounded-3xl ${
          isOpen
            ? 'translate-y-0 sm:scale-100'
            : 'translate-y-full sm:translate-y-4 sm:scale-95'
        } rounded-t-3xl ${
          fullHeight ? 'h-[90vh] sm:h-[85vh]' : 'max-h-[80vh] sm:max-h-[85vh]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
