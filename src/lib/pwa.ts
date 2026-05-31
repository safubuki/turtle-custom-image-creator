// --- PWA Service Worker 登録 & 手動更新管理 ---
// registerType:'prompt' のため、更新はユーザー操作で適用する。
// ここで SW を一度だけ登録し、更新状態を購読できるようにする。

import { registerSW } from 'virtual:pwa-register';

type Listener = (needRefresh: boolean) => void;

let registration: ServiceWorkerRegistration | undefined;
let needRefresh = false;
const listeners = new Set<Listener>();

const emit = () => {
  for (const l of listeners) l(needRefresh);
};

// SW 登録（更新検知時に needRefresh を立てる）
const updateSW = registerSW({
  onNeedRefresh() {
    needRefresh = true;
    emit();
  },
  onRegisteredSW(_swUrl, r) {
    registration = r;
  },
});

export const pwa = {
  /** Service Worker が利用可能（= 登録済み）か */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  },

  /** 現在 更新待ちの新バージョンがあるか */
  hasUpdate(): boolean {
    return needRefresh;
  },

  /** needRefresh の変化を購読 */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * サーバーへ更新確認を要求する。
   * 新しい SW が見つかれば onNeedRefresh 経由で needRefresh が true になる。
   * @returns 更新確認を実行できたか（SW 未登録環境では false）
   */
  async checkForUpdate(): Promise<boolean> {
    if (!registration) return false;
    await registration.update();
    return true;
  },

  /** 更新を適用してページをリロード */
  async applyUpdate(): Promise<void> {
    await updateSW(true);
  },
};
