import { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  Loader2,
  ImagePlus,
  User,
  Edit3,
} from 'lucide-react';
import type { Asset, AssetImage, AssetType } from '../../types';
import { compressImage } from '../../lib/image';
import { BottomSheet } from '../ui/BottomSheet';
import { FAB } from '../ui/FAB';

interface AssetsViewProps {
  assets: Asset[];
  onSave: (asset: Omit<Asset, 'updatedAt'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function AssetsView({ assets, onSave, onDelete }: AssetsViewProps) {
  const [tab, setTab] = useState<AssetType>('character');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [images, setImages] = useState<AssetImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = assets.filter((a) => a.type === tab);

  const openNewSheet = () => {
    setEditingId(null);
    setName('');
    setImages([]);
    setIsSheetOpen(true);
  };

  const openEditSheet = (asset: Asset) => {
    setEditingId(asset.id);
    setName(asset.name);
    setImages([...asset.images]);
    setIsSheetOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setIsCompressing(true);
    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file, 800, 0.7);
        setImages((prev) => [
          ...prev,
          { base64: compressedBase64, mimeType: 'image/jpeg' },
        ]);
      } catch (err) {
        console.error('圧縮失敗', err);
      }
    }
    setIsCompressing(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!name.trim() || images.length === 0) {
      alert('名前と最低1枚の画像が必要です。');
      return;
    }
    await onSave({
      id: editingId ?? `asset-${Date.now()}`,
      name: name.trim(),
      type: tab,
      images,
    });
    setIsSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('削除しますか？')) return;
    void onDelete(id);
  };

  return (
    <div className="relative flex h-full flex-col pb-24 md:pb-0">
      <div className="sticky top-0 z-10 flex space-x-2 border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <button
          onClick={() => setTab('character')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === 'character'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          キャラクター
        </button>
        <button
          onClick={() => setTab('background')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors ${
            tab === 'background'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          背景 / 小物
        </button>
      </div>

      <div className="custom-scrollbar grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-4 md:grid-cols-3">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="hide-scrollbar-arrows relative flex h-32 snap-x gap-1 overflow-x-auto bg-slate-100 p-2">
              {asset.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.base64}
                  className="h-full w-auto shrink-0 snap-center rounded-lg border border-black/5 object-cover"
                  alt=""
                />
              ))}
              <div className="absolute bottom-1 right-2 rounded bg-black/60 px-1.5 text-[10px] font-bold text-white backdrop-blur">
                {asset.images.length}枚
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 bg-white p-3">
              <span className="truncate pr-2 text-sm font-bold text-slate-800">
                {asset.name}
              </span>
              <div className="flex shrink-0 space-x-1">
                <button
                  onClick={() => openEditSheet(asset)}
                  aria-label="編集"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-500"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(asset.id)}
                  aria-label="削除"
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredAssets.length === 0 && (
          <div className="col-span-2 py-12 text-center text-slate-400 md:col-span-3">
            <User className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p className="text-sm font-medium">素材が登録されていません</p>
          </div>
        )}
      </div>

      <FAB onClick={openNewSheet} icon={Plus} label="素材を追加" />

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={editingId ? '素材の編集' : '素材の登録'}
        fullHeight
      >
        <div className="flex h-full flex-col space-y-6">
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold uppercase text-slate-500">
              呼び出し名 (タグ)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：うちのワンコ"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-bold text-slate-800 shadow-sm outline-none transition-all focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <label className="ml-1 text-xs font-bold uppercase text-slate-500">
                特徴画像 ({images.length}枚)
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity ${
                  isCompressing
                    ? 'bg-slate-100 text-slate-400 opacity-50'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {isCompressing ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <ImagePlus className="mr-1 h-3 w-3" />
                )}
                {isCompressing ? '処理中...' : '追加'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={img.base64}
                    className="h-full w-full object-cover"
                    alt="preview"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    aria-label="画像を削除"
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white backdrop-blur"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                disabled={isCompressing}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-colors ${
                  isCompressing
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-emerald-400 hover:bg-slate-100'
                }`}
              >
                {isCompressing ? (
                  <Loader2 className="mb-1 h-6 w-6 animate-spin" />
                ) : (
                  <Plus className="mb-1 h-6 w-6" />
                )}
                <span className="text-[10px] font-bold">追加</span>
              </button>
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isCompressing}
            className={`mt-auto w-full rounded-2xl py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ${
              isCompressing ? 'bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {editingId ? '更新する' : '登録する'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
