import type { ContractTemplate, ContractTemplateFormData } from '@/types';

export const CONTRACT_PLACEHOLDERS = [
    '{{company_name}}',
    '{{employee_name}}',
    '{{email}}',
    '{{job_title}}',
    '{{department}}',
    '{{employment_type}}',
    '{{hired_at}}',
    '{{monthly_rate}}',
    '{{daily_rate}}',
    '{{hourly_rate}}',
    '{{generated_at}}',
] as const;

export const INITIAL_CONTRACT_TEMPLATE_FORM_STATE: ContractTemplateFormData = {
    name: '',
    employmentType: '',
    body: '',
    isActive: true,
};

export const formatContractTemplateFormData = (template: ContractTemplate): ContractTemplateFormData => ({
    name: template.name || '',
    employmentType: template.employmentType || '',
    body: template.body || '',
    isActive: !!template.isActive,
});
