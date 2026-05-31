import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsStore } from '../lib/db';

const API_KEY_NAME = 'geminiApiKey';

interface SettingsContextValue {
  /** 保存済み APIキー（未設定は空文字） */
  apiKey: string;
  /** 設定の読み込みが完了したか */
  isReady: boolean;
  /** APIキーが保存されているか */
  hasApiKey: boolean;
  /** APIキーを保存（IndexedDB へ永続化） */
  saveApiKey: (value: string) => Promise<void>;
  /** APIキーを削除 */
  clearApiKey: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [isReady, setIsReady] = useState(false);

  // 起動時に保存済みキーを読み込む（=設定したら覚え続ける）
  useEffect(() => {
    let cancelled = false;
    settingsStore
      .get(API_KEY_NAME)
      .then((value) => {
        if (!cancelled && value) setApiKey(value);
      })
      .catch((e) => console.error('APIキーの読み込みに失敗', e))
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveApiKey = useCallback(async (value: string) => {
    const trimmed = value.trim();
    await settingsStore.set(API_KEY_NAME, trimmed);
    setApiKey(trimmed);
  }, []);

  const clearApiKey = useCallback(async () => {
    await settingsStore.remove(API_KEY_NAME);
    setApiKey('');
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      apiKey,
      isReady,
      hasApiKey: apiKey.trim().length > 0,
      saveApiKey,
      clearApiKey,
    }),
    [apiKey, isReady, saveApiKey, clearApiKey],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
