import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages（プロジェクトページ）の公開パス。
// 本番ビルドのみサブパス配信、開発時はルート配信にする。
const REPO_BASE = '/turtle-custom-image-creator/';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? REPO_BASE : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 自動更新ではなく、ユーザーが手動で確認・適用する方式
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'タートルイメージクリエイター',
        short_name: 'タートル',
        description:
          'カスタム指示やキャラクター設定を保存して、自由に画像をクリエイトするアプリ',
        lang: 'ja',
        theme_color: '#059669',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // 生成 API への通信はキャッシュせず常にネットワークへ
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
            method: 'POST',
          },
        ],
      },
    }),
  ],
}));
