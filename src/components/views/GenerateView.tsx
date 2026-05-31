import { useEffect, useRef, useState } from 'react';
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
  Plus,
  RefreshCw,
  Layers,
} from 'lucide-react';
import type { Asset, AspectRatio, AssetImage, Preset } from '../../types';
import { generateImageToImage, generateTextToImage } from '../../lib/api';
import { useSettings } from '../../hooks/useSettings';
import type { GenerateSession } from '../../hooks/useGenerateSession';
import { Chip } from '../ui/Chip';
import { AssetPickerSheet } from '../ui/AssetPickerSheet';

interface GenerateViewProps {
  presets: Preset[];
  assets: Asset[];
  session: GenerateSession;
  onManageAssets: () => void;
}

const PRESET_RATIOS: { id: AspectRatio; icon: typeof Square }[] = [
  { id: '1:1', icon: Square },
  { id: '16:9', icon: Monitor },
  { id: '9:16', icon: Smartphone },
];

export function GenerateView({
  presets,
  assets,
  session,
  onManageAssets,
}: GenerateViewProps) {
  const { hasApiKey, apiKey, textToImageModel, imageToImageModel } =
    useSettings();
  const {
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
  } = session;

  const [showCustomAspectModal, setShowCustomAspectModal] = useState(false);
  const [customAspectInput, setCustomAspectInput] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedPreset = presets.find((p) => p.id === selectedPresetId) ?? null;
  const presetAssetCount = selectedPreset?.assetIds.length ?? 0;

  // タブ復帰時も内容に合わせて高さを復元
  useEffect(() => {
    const el = textAreaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [userInput]);

  const handleCustomAspectSubmit = () => {
    if (/^[1-9]\d*:[1-9]\d*$/.test(customAspectInput)) {
      setAspectRatio(customAspectInput);
      setShowCustomAspectModal(false);
      setCustomAspectInput('');
    } else {
      alert('「幅:高さ」の形式で数値を入力してください');
    }
  };

  const toggleAsset = (id: string) =>
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleGenerate = async () => {
    if (!selectedPresetId && selectedAssetIds.length === 0 && !userInput.trim()) {
      alert('指示か素材を選ぶか、プロンプトを入力してください。');
      return;
    }
    if (!hasApiKey) {
      setError('APIキーが設定されていません。「設定」画面から登録してください。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    // 指示に紐づく素材 + 手動選択した素材をまとめる（重複は除外）
    const assetIdSet = new Set<string>();
    selectedPreset?.assetIds.forEach((id) => assetIdSet.add(id));
    selectedAssetIds.forEach((id) => assetIdSet.add(id));

    let allImages: AssetImage[] = [];
    assetIdSet.forEach((id) => {
      const asset = assets.find((a) => a.id === id);
      if (asset?.images) allImages = [...allImages, ...asset.images];
    });

    const instruction = selectedPreset ? selectedPreset.instruction : '';
    const finalPrompt =
      `${instruction}\n■画像作成のプロンプト: ${userInput || '特になし'}`.trim();

    try {
      const resultUrl =
        allImages.length > 0
          ? await generateImageToImage(
              finalPrompt,
              allImages,
              aspectRatio,
              apiKey,
              imageToImageModel,
            )
          : await generateTextToImage(
              finalPrompt,
              aspectRatio,
              apiKey,
              textToImageModel,
            );
      setGeneratedImage(resultUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNew = () => {
    clear();
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `tc-image-${Date.now()}.jpg`;
    a.click();
  };

  const canGenerate =
    !isGenerating &&
    (!!selectedPresetId || selectedAssetIds.length > 0 || !!userInput.trim());

  return (
    <div
      ref={scrollRef}
      className="custom-scrollbar flex h-full flex-col overflow-y-auto pb-24 md:pb-6"
    >
      {/* APIキー未設定の警告 */}
      {!hasApiKey && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            画像生成には APIキーが必要です。「設定」画面から登録してください。
          </p>
        </div>
      )}

      {/* プリセット（カスタム指示）選択 */}
      <div className="border-b border-slate-100 bg-white pb-3 pt-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-4">
          <h2 className="text-sm font-bold text-slate-800">
            カスタム指示を選択
            <span className="ml-1 font-normal text-slate-400">（任意）</span>
          </h2>
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
                onClick={() =>
                  setSelectedPresetId(isSelected ? null : preset.id)
                }
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
          {/* 素材の直接選択 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">
                素材を選択
                <span className="ml-1 text-xs font-normal text-slate-400">
                  （任意）
                </span>
              </label>
              {assets.length === 0 ? (
                <button
                  onClick={onManageAssets}
                  className="text-xs font-bold text-emerald-600"
                >
                  素材を登録
                </button>
              ) : (
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center rounded-full border border-dashed border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> 追加
                </button>
              )}
            </div>
            {(selectedAssetIds.length > 0 || presetAssetCount > 0) && (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                {selectedAssetIds.map((id) => {
                  const asset = assets.find((a) => a.id === id);
                  return asset ? (
                    <Chip
                      key={id}
                      label={asset.name}
                      imageUrl={asset.images[0]?.base64}
                      onRemove={() => toggleAsset(id)}
                    />
                  ) : null;
                })}
                {presetAssetCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Layers className="h-3 w-3" />
                    指示の素材 {presetAssetCount} 件も使用
                  </span>
                )}
              </div>
            )}
          </div>

          {/* プロンプト */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="gen-userinput"
                className="text-sm font-bold text-slate-700"
              >
                画像作成のプロンプト
              </label>
              {userInput && (
                <button
                  onClick={() => setUserInput('')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  クリア
                </button>
              )}
            </div>
            <textarea
              id="gen-userinput"
              ref={textAreaRef}
              className="min-h-[80px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="例：どしゃ降りの雨の中、笑顔で立っている..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>

          {/* アスペクト比 */}
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

          {/* 生成 / 新規作成 */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex flex-1 items-center justify-center space-x-2 rounded-2xl py-4 font-bold text-white shadow-lg transition-all ${
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
            {(generatedImage || userInput) && !isGenerating && (
              <button
                onClick={handleNew}
                aria-label="新規作成（プロンプトと結果をクリア）"
                className="flex items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <RefreshCw className="h-5 w-5" />
                <span className="hidden sm:inline">新規</span>
              </button>
            )}
          </div>
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
                onClick={handleNew}
                className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-4 py-2.5 text-sm font-bold text-white shadow-lg backdrop-blur"
              >
                <RefreshCw className="h-4 w-4" /> 新規作成
              </button>
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

      {/* 素材選択シート */}
      <AssetPickerSheet
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        assets={assets}
        selectedIds={selectedAssetIds}
        onToggle={toggleAsset}
      />

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
