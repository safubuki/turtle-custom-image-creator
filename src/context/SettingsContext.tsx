import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsStore } from '../lib/db';
import {
  DEFAULT_TEXT_TO_IMAGE_MODEL,
  DEFAULT_IMAGE_TO_IMAGE_MODEL,
} from '../lib/models';

const API_KEY_NAME = 'geminiApiKey';
const T2I_MODEL_NAME = 'textToImageModel';
const I2I_MODEL_NAME = 'imageToImageModel';

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

  /** テキスト→画像モデル名（既定値またはユーザー設定値） */
  textToImageModel: string;
  /** 画像→画像モデル名（既定値またはユーザー設定値） */
  imageToImageModel: string;
  /** モデル名を保存（空欄なら既定値に戻す） */
  saveModels: (models: {
    textToImageModel: string;
    imageToImageModel: string;
  }) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKey] = useState('');
  const [textToImageModel, setTextToImageModel] = useState(
    DEFAULT_TEXT_TO_IMAGE_MODEL,
  );
  const [imageToImageModel, setImageToImageModel] = useState(
    DEFAULT_IMAGE_TO_IMAGE_MODEL,
  );
  const [isReady, setIsReady] = useState(false);

  // 起動時に保存済みの設定を読み込む（=設定したら覚え続ける）
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      settingsStore.get(API_KEY_NAME),
      settingsStore.get(T2I_MODEL_NAME),
      settingsStore.get(I2I_MODEL_NAME),
    ])
      .then(([key, t2i, i2i]) => {
        if (cancelled) return;
        if (key) setApiKey(key);
        if (t2i) setTextToImageModel(t2i);
        if (i2i) setImageToImageModel(i2i);
      })
      .catch((e) => console.error('設定の読み込みに失敗', e))
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

  const saveModels = useCallback(
    async ({
      textToImageModel: t2i,
      imageToImageModel: i2i,
    }: {
      textToImageModel: string;
      imageToImageModel: string;
    }) => {
      // 空欄は既定値にフォールバック
      const t2iValue = t2i.trim() || DEFAULT_TEXT_TO_IMAGE_MODEL;
      const i2iValue = i2i.trim() || DEFAULT_IMAGE_TO_IMAGE_MODEL;
      await Promise.all([
        settingsStore.set(T2I_MODEL_NAME, t2iValue),
        settingsStore.set(I2I_MODEL_NAME, i2iValue),
      ]);
      setTextToImageModel(t2iValue);
      setImageToImageModel(i2iValue);
    },
    [],
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      apiKey,
      isReady,
      hasApiKey: apiKey.trim().length > 0,
      saveApiKey,
      clearApiKey,
      textToImageModel,
      imageToImageModel,
      saveModels,
    }),
    [
      apiKey,
      isReady,
      saveApiKey,
      clearApiKey,
      textToImageModel,
      imageToImageModel,
      saveModels,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
