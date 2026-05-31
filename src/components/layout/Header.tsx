import { Logo } from './Logo';

/** モバイル用のヘッダー（md 未満で表示。PC ではサイドバーがタイトルを担う） */
export function Header() {
  return (
    <header
      className="z-10 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 px-4 pb-4 text-white shadow-md md:hidden"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center space-x-2.5">
        <div className="rounded-xl bg-white/90 p-1 shadow-sm">
          <Logo className="h-7 w-7 rounded-lg" />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          タートルイメージクリエイター
        </h1>
      </div>
    </header>
  );
}
