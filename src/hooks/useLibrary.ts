import { useCallback, useEffect, useState } from 'react';
import { dbStore } from '../lib/db';
import type { Asset, Preset } from '../types';

const byNewest = <T extends { updatedAt: number }>(a: T, b: T) =>
  b.updatedAt - a.updatedAt;

/** 素材（assets）とプリセット（presets）の読み込みと CRUD を担うフック */
export function useLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [loadedAssets, loadedPresets] = await Promise.all([
        dbStore.getAll<Asset>('assets'),
        dbStore.getAll<Preset>('presets'),
      ]);
      setAssets([...loadedAssets].sort(byNewest));
      setPresets([...loadedPresets].sort(byNewest));
    } catch (e) {
      console.error('データの読み込みに失敗', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveAsset = useCallback(
    async (asset: Omit<Asset, 'updatedAt'>) => {
      await dbStore.put<Asset>('assets', { ...asset, updatedAt: Date.now() });
      await loadData();
    },
    [loadData],
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      await dbStore.delete('assets', id);
      // 削除された素材を参照するプリセットから id を取り除く
      const affected = presets.filter((p) => p.assetIds.includes(id));
      await Promise.all(
        affected.map((preset) =>
          dbStore.put<Preset>('presets', {
            ...preset,
            assetIds: preset.assetIds.filter((aId) => aId !== id),
            updatedAt: Date.now(),
          }),
        ),
      );
      await loadData();
    },
    [presets, loadData],
  );

  const savePreset = useCallback(
    async (preset: Omit<Preset, 'updatedAt'>) => {
      await dbStore.put<Preset>('presets', {
        ...preset,
        updatedAt: Date.now(),
      });
      await loadData();
    },
    [loadData],
  );

  const deletePreset = useCallback(
    async (id: string) => {
      await dbStore.delete('presets', id);
      await loadData();
    },
    [loadData],
  );

  return {
    assets,
    presets,
    isLoading,
    reload: loadData,
    saveAsset,
    deleteAsset,
    savePreset,
    deletePreset,
  };
}
