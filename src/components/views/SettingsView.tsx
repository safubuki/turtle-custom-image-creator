import { useEffect, useRef, useState } from 'react';
import {
  KeyRound,
  Check,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Database,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Cpu,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { usePwaUpdate } from '../../hooks/usePwaUpdate';
import { exportData, importData } from '../../lib/backup';
import {
  DEFAULT_TEXT_TO_IMAGE_MODEL,
  DEFAULT_IMAGE_TO_IMAGE_MODEL,
} from '../../lib/models';
import { PasswordInput } from '../ui/PasswordInput';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface SettingsViewProps {
  /** インポートでデータが変わったら呼ぶ（一覧の再読み込み用） */
  onDataChanged: () => void | Promise<void>;
}

export function SettingsView({ onDataChanged }: SettingsViewProps) {
  const {
    apiKey,
    hasApiKey,
    saveApiKey,
    clearApiKey,
    textToImageModel,
    imageToImageModel,
    saveModels,
  } = useSettings();
  const [draft, setDraft] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  // 保存済みキーが読み込まれたら入力欄へ反映
  useEffect(() => {
    setDraft(apiKey);
  }, [apiKey]);

  // --- AIモデル設定 ---
  const [t2iDraft, setT2iDraft] = useState(textToImageModel);
  const [i2iDraft, setI2iDraft] = useState(imageToImageModel);
  const [modelSaved, setModelSaved] = useState(false);

  useEffect(() => {
    setT2iDraft(textToImageModel);
  }, [textToImageModel]);
  useEffect(() => {
    setI2iDraft(imageToImageModel);
  }, [imageToImageModel]);

  const modelsDirty =
    t2iDraft.trim() !== textToImageModel || i2iDraft.trim() !== imageToImageModel;

  const handleSaveModels = async () => {
    await saveModels({
      textToImageModel: t2iDraft,
      imageToImageModel: i2iDraft,
    });
    setModelSaved(true);
    window.setTimeout(() => setModelSaved(false), 2000);
  };

  const handleResetModels = () => {
    setT2iDraft(DEFAULT_TEXT_TO_IMAGE_MODEL);
    setI2iDraft(DEFAULT_IMAGE_TO_IMAGE_MODEL);
  };

  const isDirty = draft.trim() !== apiKey.trim();

  const handleSave = async () => {
    await saveApiKey(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = async () => {
    if (!window.confirm('保存済みのAPIキーを削除しますか？')) return;
    await clearApiKey();
    setDraft('');
  };

  // --- データのエクスポート / インポート ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setDataMsg(null);
    setIsExporting(true);
    try {
      await exportData();
      setDataMsg('エクスポートしました。端末の保存先をご確認ください。');
    } catch (e) {
      setDataMsg(e instanceof Error ? e.message : 'エクスポートに失敗しました');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setDataMsg(null);
    setIsImporting(true);
    try {
      const result = await importData(file);
      await onDataChanged();
      setDataMsg(
        `インポート完了：素材 ${result.assets} 件 / 指示 ${result.presets} 件を取り込みました。`,
      );
    } catch (e) {
      setDataMsg(e instanceof Error ? e.message : 'インポートに失敗しました');
    } finally {
      setIsImporting(false);
    }
  };

  // --- アプリの更新確認 ---
  const { isChecking, checkForUpdate, applyUpdate } = usePwaUpdate();
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setUpdateMsg(null);
    const result = await checkForUpdate();
    if (result === 'update-available') {
      setShowUpdateDialog(true);
    } else if (result === 'up-to-date') {
      setUpdateMsg('お使いのバージョンは最新です。');
    } else {
      setUpdateMsg(
        'この環境では更新確認を利用できません（インストール済みアプリでご利用ください）。',
      );
    }
  };

  return (
    <div className="custom-scrollbar h-full overflow-y-auto pb-24 md:pb-6">
      <div className="space-y-6 p-4">
        {/* ===== APIキー設定 ===== */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">APIキー設定</h2>
              <p className="text-xs text-slate-500">
                Google Generative Language API のキーを登録します
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <label className="ml-1 text-xs font-bold uppercase text-slate-500">
              APIキー
            </label>
            <PasswordInput
              value={draft}
              onChange={setDraft}
              placeholder="AIza..."
              aria-label="APIキー"
            />

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                  hasApiKey
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {hasApiKey ? '登録済み' : '未登録'}
              </span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!isDirty || !draft.trim()}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all ${
                  !isDirty || !draft.trim()
                    ? 'cursor-not-allowed bg-slate-300'
                    : 'bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="h-5 w-5" /> 保存しました
                  </>
                ) : (
                  '保存する'
                )}
              </button>
              {hasApiKey && (
                <button
                  onClick={handleClear}
                  aria-label="APIキーを削除"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              APIキーを取得する (Google AI Studio)
            </a>
          </div>
        </section>

        {/* ===== AIモデル設定 ===== */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Cpu className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">AIモデル</h2>
              <p className="text-xs text-slate-500">
                使用するモデル名（変更時のみ編集してください）
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="space-y-1">
              <label className="ml-1 text-xs font-bold uppercase text-slate-500">
                テキスト→画像（素材なし）
              </label>
              <input
                type="text"
                value={t2iDraft}
                onChange={(e) => setT2iDraft(e.target.value)}
                placeholder={DEFAULT_TEXT_TO_IMAGE_MODEL}
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="ml-1 text-xs font-bold uppercase text-slate-500">
                画像→画像（素材あり）
              </label>
              <input
                type="text"
                value={i2iDraft}
                onChange={(e) => setI2iDraft(e.target.value)}
                placeholder={DEFAULT_IMAGE_TO_IMAGE_MODEL}
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveModels}
                disabled={!modelsDirty}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-all ${
                  !modelsDirty
                    ? 'cursor-not-allowed bg-slate-300'
                    : 'bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95'
                }`}
              >
                {modelSaved ? (
                  <>
                    <Check className="h-5 w-5" /> 保存しました
                  </>
                ) : (
                  '保存する'
                )}
              </button>
              <button
                onClick={handleResetModels}
                className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                既定に戻す
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              空欄で保存すると既定値（テキスト→画像:{' '}
              {DEFAULT_TEXT_TO_IMAGE_MODEL} / 画像→画像:{' '}
              {DEFAULT_IMAGE_TO_IMAGE_MODEL}）が使われます。
            </p>
          </div>
        </section>

        {/* ===== データのバックアップ ===== */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">データ管理</h2>
              <p className="text-xs text-slate-500">
                素材・指示（画像を含む）の書き出し / 取り込み
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={isExporting || isImporting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
                エクスポート
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExporting || isImporting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {isImporting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                インポート
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept="application/json,.json"
                className="hidden"
              />
            </div>
            {dataMsg && (
              <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {dataMsg}
              </p>
            )}
            <p className="text-[11px] leading-relaxed text-slate-400">
              エクスポートすると画像を含む 1 つの JSON
              ファイルが端末に保存されます。インポートでは同じデータを
              IndexedDB に取り込みます（同じ項目は上書き）。
            </p>
          </div>
        </section>

        {/* ===== アプリの更新 ===== */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <RefreshCw className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">アプリの更新</h2>
              <p className="text-xs text-slate-500">
                新しいバージョンがあるか手動で確認します
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <button
              onClick={handleCheckUpdate}
              disabled={isChecking}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> 確認中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" /> 更新を確認
                </>
              )}
            </button>
            {updateMsg && (
              <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                {updateMsg}
              </p>
            )}
          </div>
        </section>

        {/* ===== セキュリティ注意 ===== */}
        <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div className="space-y-1 text-xs leading-relaxed text-slate-600">
            <p className="font-bold text-slate-700">保存について</p>
            <p>
              入力したキーやデータはこの端末のブラウザ内（IndexedDB）にのみ保存され、外部サーバーには送信されません（画像生成 API
              への通信を除く）。一度保存すれば次回以降も自動で読み込まれます。
            </p>
            <p className="text-slate-400">
              共用端末では利用後に削除することをおすすめします。
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showUpdateDialog}
        title="更新があります"
        message="新しいバージョンが利用可能です。今すぐ更新しますか？（更新するとアプリが再読み込みされます）"
        confirmLabel="OK"
        cancelLabel="キャンセル"
        onConfirm={() => {
          setShowUpdateDialog(false);
          void applyUpdate();
        }}
        onCancel={() => setShowUpdateDialog(false)}
      />
    </div>
  );
}
