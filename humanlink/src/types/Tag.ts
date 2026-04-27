export interface Tag {
    id: number;
    workspaceId: number;
    name: string;
    color: string; 
}

export interface TagFormData {
    workspaceId: number;
    name: string;
    color: string;
}