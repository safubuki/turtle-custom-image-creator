import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { TabId } from './types';
import { useLibrary } from './hooks/useLibrary';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { GenerateView } from './components/views/GenerateView';
import { AssetsView } from './components/views/AssetsView';
import { PresetsView } from './components/views/PresetsView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('generate');
  const {
    assets,
    presets,
    isLoading,
    reload,
    saveAsset,
    deleteAsset,
    savePreset,
    deletePreset,
  } = useLibrary();

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center space-y-4 text-emerald-600">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="animate-pulse text-sm font-bold">システムを起動中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] justify-center bg-slate-100 font-sans text-slate-800">
      {/* PC ではサイドバー + 広い本文、モバイルでは縦積みの 1 カラム */}
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl md:max-w-6xl md:flex-row md:shadow-xl">
        <Sidebar active={activeTab} onChange={setActiveTab} />

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <Header />

          <main className="relative flex-1 overflow-hidden bg-slate-50">
            <div className="mx-auto h-full w-full max-w-3xl">
              {activeTab === 'generate' && (
                <GenerateView presets={presets} assets={assets} />
              )}
              {activeTab === 'assets' && (
                <AssetsView
                  assets={assets}
                  onSave={saveAsset}
                  onDelete={deleteAsset}
                />
              )}
              {activeTab === 'presets' && (
                <PresetsView
                  presets={presets}
                  assets={assets}
                  onSave={savePreset}
                  onDelete={deletePreset}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsView onDataChanged={reload} />
              )}
            </div>
          </main>

          <BottomNav active={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
