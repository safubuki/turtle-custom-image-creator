import { Image as ImageIcon, X } from 'lucide-react';

interface ChipProps {
  label: string;
  imageUrl?: string;
  onRemove?: () => void;
}

/** 素材を表す小さなタグ（サムネイル付き） */
export function Chip({ label, imageUrl, onRemove }: ChipProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 py-1 pl-1 pr-3 shadow-sm">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="mr-2 h-6 w-6 rounded-full border border-white object-cover"
        />
      ) : (
        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200">
          <ImageIcon className="h-3 w-3 text-emerald-600" />
        </div>
      )}
      <span className="mr-2 text-sm font-medium text-emerald-800">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`${label} を削除`}
          className="rounded-full bg-white p-0.5 text-emerald-400 hover:text-emerald-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
