import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** OK / キャンセルの確認ダイアログ（中央モーダル） */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm animate-zoom-in rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-bold text-slate-800">{title}</h3>
        <div className="mb-5 text-sm leading-relaxed text-slate-600">
          {message}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-500 transition-colors hover:bg-slate-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-emerald-500 py-3 font-bold text-white transition-colors hover:bg-emerald-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
