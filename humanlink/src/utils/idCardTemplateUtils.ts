import type { IdCardTemplate, IdCardTemplateFormData } from '@/types';

export const ID_CARD_PLACEHOLDERS = [
    '{{company_name}}',
    '{{employee_name}}',
    '{{email}}',
    '{{job_title}}',
    '{{department}}',
    '{{employment_type}}',
    '{{hired_at}}',
    '{{generated_at}}',
    '{{initials}}',
] as const;

export const INITIAL_ID_CARD_TEMPLATE_FORM_STATE: IdCardTemplateFormData = {
    name: '',
    body: '',
    isActive: true,
};

export const formatIdCardTemplateFormData = (template: IdCardTemplate): IdCardTemplateFormData => ({
    name: template.name || '',
    body: template.body || '',
    isActive: !!template.isActive,
});
