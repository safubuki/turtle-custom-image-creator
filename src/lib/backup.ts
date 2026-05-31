// --- 素材・指示のエクスポート / インポート ---
// 画像（base64 data URL）も含めて1つの JSON ファイルに保存し、
// インポート時に IndexedDB へ書き戻す（参照整合性を保つため両方を一括で扱う）。

import { dbStore } from './db';
import type { Asset, Preset } from '../types';

const BACKUP_VERSION = 1;
const BACKUP_KIND = 'turtle-image-creator-backup';

export interface BackupFile {
  kind: typeof BACKUP_KIND;
  version: number;
  exportedAt: string;
  assets: Asset[];
  presets: Preset[];
}

export interface ImportResult {
  assets: number;
  presets: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

const timestamp = (d = new Date()) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours(),
  )}${pad(d.getMinutes())}`;

/** 全素材・指示を JSON ファイルとして端末にダウンロード保存する */
export async function exportData(): Promise<void> {
  const [assets, presets] = await Promise.all([
    dbStore.getAll<Asset>('assets'),
    dbStore.getAll<Preset>('presets'),
  ]);

  const backup: BackupFile = {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    assets,
    presets,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `turtle-backup-${timestamp()}.json`;
  a.click();
  // メモリ解放
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const isAsset = (v: unknown): v is Asset => {
  const a = v as Asset;
  return (
    !!a &&
    typeof a.id === 'string' &&
    typeof a.name === 'string' &&
    (a.type === 'character' || a.type === 'background') &&
    Array.isArray(a.images)
  );
};

const isPreset = (v: unknown): v is Preset => {
  const p = v as Preset;
  return (
    !!p &&
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.instruction === 'string' &&
    Array.isArray(p.assetIds)
  );
};

/**
 * バックアップ JSON ファイルを読み込み、IndexedDB へ取り込む。
 * 同じ id は上書き、新規は追加（マージ）する。
 */
export async function importData(file: File): Promise<ImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error('ファイルを解析できませんでした（JSON 形式ではありません）。');
  }

  const data = parsed as Partial<BackupFile>;
  if (!data || data.kind !== BACKUP_KIND) {
    throw new Error('このアプリのバックアップファイルではありません。');
  }

  const assets = Array.isArray(data.assets) ? data.assets.filter(isAsset) : [];
  const presets = Array.isArray(data.presets)
    ? data.presets.filter(isPreset)
    : [];

  if (assets.length === 0 && presets.length === 0) {
    throw new Error('取り込めるデータが含まれていません。');
  }

  const now = Date.now();
  await Promise.all([
    ...assets.map((a) =>
      dbStore.put<Asset>('assets', { ...a, updatedAt: a.updatedAt || now }),
    ),
    ...presets.map((p) =>
      dbStore.put<Preset>('presets', { ...p, updatedAt: p.updatedAt || now }),
    ),
  ]);

  return { assets: assets.length, presets: presets.length };
}
