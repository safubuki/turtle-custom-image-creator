import { useState } from 'react';
import {
  Image as ImageIcon,
  Wand2,
  Loader2,
  Square,
  Monitor,
  Smartphone,
  Settings,
  Download,
  Check,
  Folder,
  KeyRound,
} from 'lucide-react';
import type { Asset, AspectRatio, AssetImage, Preset } from '../../types';
import { generateImageToImage, generateTextToImage } from '../../lib/api';
import { useSettings } from '../../hooks/useSettings';

interface GenerateViewProps {
  presets: Preset[];
  assets: Asset[];
}

const PRESET_RATIOS: { id: AspectRatio; icon: typeof Square }[] = [
  { id: '1:1', icon: Square },
  { id: '16:9', icon: Monitor },
  { id: '9:16', icon: Smartphone },
];

export function GenerateView({ presets, assets }: GenerateViewProps) {
  const { hasApiKey, apiKey } = useSettings();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    presets[0]?.id ?? null,
  );
  const [userInput, setUserInput] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCustomAspectModal, setShowCustomAspectModal] = useState(false);
  const [customAspectInput, setCustomAspectInput] = useState('');

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleCustomAspectSubmit = () => {
    if (/^[1-9]\d*:[1-9]\d*$/.test(customAspectInput)) {
      setAspectRatio(customAspectInput);
      setShowCustomAspectModal(false);
      setCustomAspectInput('');
    } else {
      alert('「幅:高さ」の形式で数値を入力してください');
    }
  };

  const handleGenerate = async () => {
    const preset = presets.find((p) => p.id === selectedPresetId);
    if (!preset && !userInput.trim()) {
      alert('指示を選択するか、プロンプトを入力してください。');
      return;
    }
    if (!hasApiKey) {
      setError('APIキーが設定されていません。「設定」画面から登録してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    let allImages: AssetImage[] = [];
    if (preset?.assetIds) {
      preset.assetIds.forEach((id) => {
        const asset = assets.find((a) => a.id === id);
        if (asset?.images) allImages = [...allImages, ...asset.images];
      });
    }

    const finalInstruction = preset ? preset.instruction : '';
    const finalPrompt =
      `${finalInstruction}\n■追加の状況・要望: ${userInput || '特になし'}`.trim();

    try {
      const resultUrl =
        allImages.length > 0
          ? await generateImageToImage(
              finalPrompt,
              allImages,
              aspectRatio,
              apiKey,
            )
          : await generateTextToImage(finalPrompt, aspectRatio, apiKey);
      setGeneratedImage(resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `tc-image-${Date.now()}.jpg`;
    a.click();
  };

  const canGenerate = !isGenerating && (!!selectedPresetId || !!userInput.trim());

  return (
    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto pb-24 md:pb-6">
      {/* APIキー未設定の警告 */}
      {!hasApiKey && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            画像生成には APIキーが必要です。「設定」画面から登録してください。
          </p>
        </div>
      )}

      {/* プリセット選択 */}
      <div className="border-b border-slate-100 bg-white pb-3 pt-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-4">
          <h2 className="text-sm font-bold text-slate-800">カスタム指示を選択</h2>
          {presets.length === 0 && (
            <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-600">
              未登録
            </span>
          )}
        </div>
        <div className="custom-scrollbar hide-scrollbar-arrows flex snap-x snap-mandatory space-x-3 overflow-x-auto px-4 pb-2">
          {presets.map((preset) => {
            const thumbUrl = assets.find((a) => a.id === preset.assetIds[0])
              ?.images[0]?.base64;
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPresetId(isSelected ? null : preset.id)}
                className={`relative w-32 shrink-0 cursor-pointer snap-center overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-emerald-500 shadow-md'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex h-20 items-center justify-center bg-slate-100">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <Folder className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="border-t border-slate-100 bg-white p-2 text-center">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {preset.name}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute right-1 top-1 rounded-full bg-emerald-500 p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
          {presets.length === 0 && (
            <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-400">
              「指示管理」から指示を作成
            </div>
          )}
        </div>
      </div>

      {/* PC では 2 カラム（左=操作 / 右=プレビュー）、モバイルでは縦積み */}
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="gen-userinput"
              className="text-sm font-bold text-slate-700"
            >
              追加の状況・要望
            </label>
            <textarea
              id="gen-userinput"
              className="min-h-[80px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例：どしゃ降りの雨の中..."
              value={userInput}
              onChange={handleInput}
            />
          </div>

          <div className="space-y-2">
            <span className="flex items-center justify-between text-sm font-bold text-slate-700">
              アスペクト比
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400">
                {aspectRatio}
              </span>
            </span>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_RATIOS.map((ratio) => {
                const Icon = ratio.icon;
                const isActive = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`flex flex-col items-center justify-center rounded-xl border py-2 transition-all ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className="mb-1 h-5 w-5"
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span className="text-[10px] font-bold">{ratio.id}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowCustomAspectModal(true)}
                className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-2 text-slate-500 transition-all hover:bg-slate-50"
              >
                <Settings className="mb-1 h-5 w-5" />
                <span className="text-[10px] font-bold">カスタム</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`flex w-full items-center justify-center space-x-2 rounded-2xl py-4 font-bold text-white shadow-lg transition-all ${
              !canGenerate
                ? 'cursor-not-allowed bg-slate-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>AIが描画中...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" />
                <span>画像を描画する</span>
              </>
            )}
          </button>
          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        {/* プレビュー */}
        <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-200 shadow-inner md:min-h-full">
          {generatedImage ? (
            <div className="group relative h-full w-full">
              <img
                src={generatedImage}
                alt="生成結果"
                className="h-full w-full bg-white object-contain"
              />
              <button
                onClick={downloadImage}
                aria-label="画像をダウンロード"
                className="absolute bottom-4 right-4 flex items-center space-x-2 rounded-full bg-slate-900/80 p-3 text-white shadow-lg backdrop-blur"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center space-y-3 opacity-50">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-slate-400">
              <ImageIcon className="h-12 w-12 opacity-30" />
              <p className="text-sm font-medium">生成画像がここに表示されます</p>
            </div>
          )}
        </div>
      </div>

      {/* カスタム比率モーダル */}
      {showCustomAspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-zoom-in rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              カスタム比率
            </h3>
            <input
              type="text"
              inputMode="text"
              placeholder="例: 21:9"
              value={customAspectInput}
              onChange={(e) => setCustomAspectInput(e.target.value)}
              className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-lg font-bold tracking-widest text-slate-700 outline-none focus:border-emerald-500"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCustomAspectModal(false)}
                className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleCustomAspectSubmit}
                className="flex-1 rounded-xl bg-emerald-500 py-3 font-bold text-white"
              >
                決定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
