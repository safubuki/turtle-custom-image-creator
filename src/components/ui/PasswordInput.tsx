import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  'aria-label'?: string;
}

/**
 * 値を ●●● で伏せ字表示し、目のアイコンで表示/非表示を切り替えられる入力欄。
 * APIキーなどの機微情報の入力に使用。
 */
export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = 'off',
  'aria-label': ariaLabel,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 pr-12 font-mono text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'キーを隠す' : 'キーを表示'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition-colors hover:text-slate-600"
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
