import { useState } from 'react';
import type { AspectRatio } from '../types';

/**
 * 画像生成ページの状態。App 直下で保持することで、タブを移動しても
 * プロンプトや選択内容・生成結果が保持されるようにする。
 */
export interface GenerateSession {
  selectedPresetId: string | null;
  setSelectedPresetId: (id: string | null) => void;
  /** プリセットとは別に手動で選んだ素材 id */
  selectedAssetIds: string[];
  setSelectedAssetIds: React.Dispatch<React.SetStateAction<string[]>>;
  userInput: string;
  setUserInput: (v: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (v: AspectRatio) => void;
  generatedImage: string | null;
  setGeneratedImage: (v: string | null) => void;
  error: string | null;
  setError: (v: string | null) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  /** プロンプトと生成結果をクリアして新規作成しやすくする */
  clear: () => void;
}

export function useGenerateSession(): GenerateSession {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const clear = () => {
    setUserInput('');
    setGeneratedImage(null);
    setError(null);
  };

  return {
    selectedPresetId,
    setSelectedPresetId,
    selectedAssetIds,
    setSelectedAssetIds,
    userInput,
    setUserInput,
    aspectRatio,
    setAspectRatio,
    generatedImage,
    setGeneratedImage,
    error,
    setError,
    isGenerating,
    setIsGenerating,
    clear,
  };
}
