export type ContractEmploymentType = 'regular' | 'probationary' | 'contractor';

export interface ContractTemplate {
    id: number;
    name: string;
    employmentType: ContractEmploymentType;
    body: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ContractTemplateFormData {
    name: string;
    employmentType: ContractEmploymentType | '';
    body: string;
    isActive: boolean;
}
