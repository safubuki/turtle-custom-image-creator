import { Layers } from 'lucide-react';

/** モバイル用のヘッダー（md 未満で表示。PC ではサイドバーがタイトルを担う） */
export function Header() {
  return (
    <header
      className="z-10 flex items-center justify-between bg-emerald-600 px-4 pb-4 text-white shadow-md md:hidden"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center space-x-2">
        <div className="rounded-lg bg-white/20 p-1.5">
          <Layers className="h-5 w-5 text-emerald-50" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          タートルイメージクリエイター
        </h1>
      </div>
    </header>
  );
}
