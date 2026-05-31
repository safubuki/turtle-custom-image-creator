import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

/** 設定（APIキー）コンテキストへアクセスするフック */
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings は SettingsProvider 内で使用してください');
  }
  return ctx;
}
