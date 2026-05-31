import { Wand2, Folder, User, Settings, type LucideIcon } from 'lucide-react';
import type { TabId } from '../../types';

export interface NavItem {
  id: TabId;
  icon: LucideIcon;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'generate', icon: Wand2, label: 'イメージ' },
  { id: 'presets', icon: Folder, label: '指示管理' },
  { id: 'assets', icon: User, label: '素材管理' },
  { id: 'settings', icon: Settings, label: '設定' },
];
