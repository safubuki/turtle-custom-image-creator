import { Check } from 'lucide-react';
import type { Asset } from '../../types';
import { BottomSheet } from './BottomSheet';

interface AssetPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  title?: string;
}

/** 素材（キャラクター/背景）を複数選択するボトムシート。指示作成・画像生成で共用。 */
export function AssetPickerSheet({
  isOpen,
  onClose,
  assets,
  selectedIds,
  onToggle,
  title = '素材を選択',
}: AssetPickerSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="grid grid-cols-3 gap-3 pb-6 sm:grid-cols-4">
        {assets.length === 0 && (
          <p className="col-span-3 py-4 text-center text-sm text-slate-400 sm:col-span-4">
            先に素材を登録してください
          </p>
        )}
        {assets.map((asset) => {
          const isSelected = selectedIds.includes(asset.id);
          return (
            <button
              key={asset.id}
              onClick={() => onToggle(asset.id)}
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
  );
}
