import { useCallback, useEffect, useState } from 'react';
import { pwa } from '../lib/pwa';

export type UpdateCheckResult = 'update-available' | 'up-to-date' | 'unsupported';

/** PWA の手動更新確認・適用を扱うフック */
export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(pwa.hasUpdate());
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => pwa.subscribe(setNeedRefresh), []);

  const checkForUpdate = useCallback(async (): Promise<UpdateCheckResult> => {
    if (!pwa.isSupported()) return 'unsupported';
    setIsChecking(true);
    try {
      const ran = await pwa.checkForUpdate();
      if (!ran) return 'unsupported';
      // 更新検知はイベント駆動のため、少し待って判定する
      await new Promise((res) => setTimeout(res, 800));
      return pwa.hasUpdate() ? 'update-available' : 'up-to-date';
    } finally {
      setIsChecking(false);
    }
  }, []);

  const applyUpdate = useCallback(() => pwa.applyUpdate(), []);

  return { needRefresh, isChecking, checkForUpdate, applyUpdate };
}
