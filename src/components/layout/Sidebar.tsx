import type { TabId } from '../../types';
import { NAV_ITEMS } from './navItems';
import { Logo } from './Logo';

interface SidebarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

/** PC 用のサイドナビゲーション（md 以上で表示） */
export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
        <Logo className="h-9 w-9 rounded-xl shadow-sm" />
        <h1 className="text-[15px] font-bold leading-tight tracking-tight text-slate-800">
          タートルイメージ
          <span className="block text-emerald-600">クリエイター</span>
        </h1>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
              )}
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <p className="px-5 py-4 text-[10px] text-slate-300">
        Turtle Image Creator
      </p>
    </aside>
  );
}
