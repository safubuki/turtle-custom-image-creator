// --- ドメイン型定義 ---

/** 素材に紐づく1枚の画像（base64 data URL 形式で保持） */
export interface AssetImage {
  /** "data:image/jpeg;base64,..." 形式の data URL */
  base64: string;
  mimeType: string;
}

export type AssetType = 'character' | 'background';

/** キャラクターや背景などの素材 */
export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  images: AssetImage[];
  updatedAt: number;
}

/** カスタム指示（プリセット） */
export interface Preset {
  id: string;
  name: string;
  /** 紐づく素材の id 一覧 */
  assetIds: string[];
  instruction: string;
  updatedAt: number;
}

/** アスペクト比（"16:9" など "w:h" 形式の文字列） */
export type AspectRatio = string;

export type TabId = 'generate' | 'presets' | 'assets' | 'settings';
