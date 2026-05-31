import type { TabId } from '../../types';
import { NAV_ITEMS } from './navItems';

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

/** モバイル用の下部ナビゲーション（md 未満で表示） */
export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="z-10 flex items-center justify-around border-t border-slate-200 bg-white px-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center p-1.5 transition-all ${
              isActive
                ? 'text-emerald-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`mb-1 rounded-xl p-1.5 transition-all ${
                isActive ? 'bg-emerald-100' : ''
              }`}
            >
              <Icon
                className={`h-6 w-6 ${isActive ? 'fill-emerald-100' : ''}`}
              />
            </div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
