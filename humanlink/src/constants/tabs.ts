import { 
  LayoutDashboard, 
  FolderKanban, 
  Kanban, 
  Users, 
  Settings,
  BarChart3,
  ListTodo,
  Tag
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface WorkspaceTab {
  id: 'overview' | 'projects' | 'board' | 'analytics' | 'members'| 'statuses'| 'tags' | 'settings';
  label: string;
  icon: LucideIcon;
}

export const WORKSPACE_TABS: WorkspaceTab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'board', label: 'Kanban Board', icon: Kanban },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'statuses', label: 'Statuses', icon: ListTodo },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
];
