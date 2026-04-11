export interface Status {
    id: number;
    workspaceId: number;
    name: string;
    colorHex: string;
    position: number;
}

export interface StatusFormData {
    workspaceId: number;
    name: string;
    colorHex: string;
    position: number;
}