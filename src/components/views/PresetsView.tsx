import { useState } from 'react';
import { Plus, Trash2, Folder, Check, Edit3 } from 'lucide-react';
import type { Asset, Preset } from '../../types';
import { BottomSheet } from '../ui/BottomSheet';
import { FAB } from '../ui/FAB';
import { Chip } from '../ui/Chip';

interface PresetsViewProps {
  presets: Preset[];
  assets: Asset[];
  onSave: (preset: Omit<Preset, 'updatedAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function PresetsView({
  presets,
  assets,
  onSave,
  onDelete,
}: PresetsViewProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  const openNewSheet = () => {
    setEditingId(null);
    setName('');
    setInstruction('');
    setSelectedAssetIds([]);
    setIsSheetOpen(true);
  };

  const openEditSheet = (preset: Preset) => {
    setEditingId(preset.id);
    setName(preset.name);
    setInstruction(preset.instruction);
    setSelectedAssetIds([...preset.assetIds]);
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !instruction.trim()) {
      alert('名前とテキストは必須です。');
      return;
    }
    await onSave({
      id: editingId ?? `preset-${Date.now()}`,
      name: name.trim(),
      assetIds: selectedAssetIds,
      instruction: instruction.trim(),
    });
    setIsSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('削除しますか？')) return;
    void onDelete(id);
  };

  return (
    <div className="relative flex h-full flex-col pb-24 md:pb-0">
      <div className="custom-scrollbar grid grid-cols-1 content-start gap-3 overflow-y-auto p-4 md:grid-cols-2">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="relative flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-800">{preset.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => openEditSheet(preset)}
                  aria-label="編集"
                  className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-500"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  aria-label="削除"
                  className="rounded-lg bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {preset.assetIds.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {preset.assetIds.map((id) => {
                  const a = assets.find((x) => x.id === id);
                  return a ? (
                    <Chip
                      key={id}
                      label={a.name}
                      imageUrl={a.images[0]?.base64}
                    />
                  ) : null;
                })}
              </div>
            )}
            <div className="relative rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                {preset.instruction}
              </p>
            </div>
          </div>
        ))}
        {presets.length === 0 && (
          <div className="py-12 text-center text-slate-400 md:col-span-2">
            <Folder className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">指示がありません</p>
          </div>
        )}
      </div>

      <FAB onClick={openNewSheet} icon={Plus} label="指示を追加" />

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingId ? '指示の編集' : '指示の作成'}
        fullHeight
      >
        <div className="flex h-full flex-col space-y-5">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase text-slate-500">
              タイトル
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：いつもの二人組"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase text-slate-500">
              紐づける素材
            </label>
            <div className="flex min-h-[60px] flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
              {selectedAssetIds.length === 0 && (
                <span className="pl-1 text-sm text-slate-400">素材なし</span>
              )}
              {selectedAssetIds.map((id) => {
                const asset = assets.find((a) => a.id === id);
                return asset ? (
                  <Chip
                    key={id}
                    label={asset.name}
                    imageUrl={asset.images[0]?.base64}
                    onRemove={() =>
                      setSelectedAssetIds((prev) =>
                        prev.filter((x) => x !== id),
                      )
                    }
                  />
                ) : null;
              })}
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="inline-flex items-center rounded-full border border-dashed border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                <Plus className="mr-1 h-4 w-4" /> 追加
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col space-y-1">
            <label className="ml-1 text-xs font-bold uppercase text-slate-500">
              ベースプロンプト
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例：「いつもの飼育小屋」で..."
              className="w-full flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed text-slate-700 shadow-sm outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-auto w-full rounded-2xl bg-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:bg-emerald-600 active:scale-95"
          >
            {editingId ? '更新する' : '保存する'}
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        title="素材を選択"
      >
        <div className="grid grid-cols-3 gap-3 pb-6 sm:grid-cols-4">
          {assets.length === 0 && (
            <p className="col-span-3 py-4 text-center text-sm text-slate-400 sm:col-span-4">
              先に素材を登録してください
            </p>
          )}
          {assets.map((asset) => {
            const isSelected = selectedAssetIds.includes(asset.id);
            return (
              <button
                key={asset.id}
                onClick={() =>
                  setSelectedAssetIds((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== asset.id)
                      : [...prev, asset.id],
                  )
                }
                className={`flex flex-col items-center rounded-2xl border-2 p-2 transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border border-slate-200">
                  {asset.images[0] ? (
                    <img
                      src={asset.images[0].base64}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="h-full w-full bg-slate-100" />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[1px]">
                      <Check className="h-8 w-8 rounded-full bg-white p-1 text-emerald-600" />
                    </div>
                  )}
                </div>
                <span className="line-clamp-2 text-center text-[10px] font-bold leading-tight">
                  {asset.name}
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
