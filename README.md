# タートルイメージクリエイター (turtle-custom-image-creator)

カスタム指示やキャラクター設定を保存でき、自由にカスタムな画像をクリエイトするアプリです。
Android スマホ・PC どちらのブラウザでも最適な形で表示されるレスポンシブ対応の Vite + React + TypeScript 製 PWA です。

**公開 URL**: https://safubuki.github.io/turtle-custom-image-creator/

## PWA（スマホにアプリとして追加）

- ブラウザで公開 URL を開き、メニューから「ホーム画面に追加」/「アプリをインストール」を選ぶとアプリとして使えます。
- オフラインでも起動でき、AI による画像生成時のみインターネット通信を行います。
- **更新確認**: アプリの「設定」→「アプリの更新」→「更新を確認」を押すと、新しいバージョンがあればダイアログ（OK / キャンセル）が表示され、OK で更新（再読み込み）されます。

## 主な機能

- **イメージ生成**: 保存した「カスタム指示」と参照素材を組み合わせて画像を生成（Google Generative Language API: Imagen / Gemini）。
- **素材管理**: キャラクター・背景/小物の画像を登録（アップロード時に自動で圧縮して保存）。
- **指示管理**: ベースプロンプト + 紐づける素材をプリセットとして保存。
- **設定**: APIキーを安全に登録・保持。
- **エクスポート / インポート**: 素材・指示（画像を含む）を 1 つの JSON ファイルとして端末に書き出し / 取り込み（「設定」→「データ管理」）。
- データは IndexedDB に保存され、オフラインでも素材・指示を閲覧できます。

## APIキーについて

- 画像生成には Google の APIキーが必要です。アプリ内の **設定** 画面から登録してください。
- 入力欄はパスワード形式（`●●●` で伏せ字）で、目のアイコンで表示/非表示を切り替えられます。
- キーはこの端末のブラウザ内（IndexedDB）にのみ保存され、外部サーバーには送信されません。
  一度保存すれば次回起動時に自動で読み込まれます。
- キーの取得: [Google AI Studio](https://aistudio.google.com/app/apikey)

## 開発

```bash
npm install      # 依存関係のインストール
npm run dev      # 開発サーバー起動
npm run build    # 型チェック + 本番ビルド
npm run preview  # ビルド成果物のプレビュー
npm run lint     # ESLint
```

## デプロイ（GitHub Pages 自動デプロイ）

- `main` ブランチへ push すると、GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）がビルドして GitHub Pages へ自動デプロイします。
- 初回実行時に `actions/configure-pages` が Pages を自動的に有効化します（ワークフローの `pages: write` 権限を使用）。
  - もし有効化されない場合は、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に一度だけ設定してください。

## 技術スタック

- Vite 6 / React 18 / TypeScript
- Tailwind CSS v4
- vite-plugin-pwa（Service Worker / manifest）
- lucide-react（アイコン）
- IndexedDB（素材・指示・設定の永続化）

## ディレクトリ構成

```
src/
├─ components/
│  ├─ layout/   # Header, Sidebar, BottomNav
│  ├─ ui/       # BottomSheet, FAB, Chip, PasswordInput, ConfirmDialog
│  └─ views/    # Generate / Assets / Presets / Settings
├─ context/     # SettingsContext（APIキー）
├─ hooks/       # useLibrary, useSettings, usePwaUpdate
├─ lib/         # db(IndexedDB), api(画像生成), image(圧縮), backup, pwa
└─ types.ts     # ドメイン型
scripts/        # PWA アイコン生成（generate-icons.mjs）
.github/workflows/deploy.yml  # GitHub Pages 自動デプロイ
```
