export type UserDocumentType = 'contract' | 'id_scan' | 'signed_policy';

export interface UserDocument {
    id: number;
    userId: number;
    type: UserDocumentType;
    typeLabel?: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy?: number | null;
    url: string;
    uploader?: { id: number; name: string } | null;
    createdAt?: string;
}
