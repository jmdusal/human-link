import type { ProjectMember } from '@/types/ProjectMember';
import type { Task } from '@/types/Task';

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  projectMembers?: ProjectMember[];
  tasks?: Task[];
}

export interface ProjectFormData {
  name: string;
  workspaceId: number;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate: string;
  projectMembers: ProjectMember[];
}