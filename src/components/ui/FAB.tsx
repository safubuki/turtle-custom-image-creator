import type { LucideIcon } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon: LucideIcon;
  label?: string;
}

/** 画面右下のフローティングアクションボタン */
export function FAB({ onClick, icon: Icon, label = '追加' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-95 sm:absolute sm:bottom-6"
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}
