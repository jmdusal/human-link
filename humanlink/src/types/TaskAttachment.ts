export interface TaskAttachment {
    id: number;
    taskId: number;
    userId: number;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    createdAt: string;
    updatedAt: string;
}
