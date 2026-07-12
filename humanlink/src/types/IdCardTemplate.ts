export interface IdCardTemplate {
    id: number;
    name: string;
    body: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IdCardTemplateFormData {
    name: string;
    body: string;
    isActive: boolean;
}
