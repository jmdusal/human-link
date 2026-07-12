import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ModalForm from '@/components/modals/ModalForm';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Switch from '@/components/ui/Switch';
import Textarea from '@/components/ui/Textarea';
import type { IdCardTemplate, IdCardTemplateFormData } from '@/types';
import { IdCardTemplateService } from '@/services/IdCardTemplateService';
import {
    ID_CARD_PLACEHOLDERS,
    INITIAL_ID_CARD_TEMPLATE_FORM_STATE,
    formatIdCardTemplateFormData,
} from '@/utils/idCardTemplateUtils';
import { useForm } from '@/hooks/use-form';

interface IdCardTemplateFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (template: IdCardTemplate) => void;
    onError: (error: unknown) => void;
    selectedTemplate: IdCardTemplate | null;
}

export default function IdCardTemplateForm({
    isOpen,
    onClose,
    onSuccess,
    selectedTemplate,
}: IdCardTemplateFormProps) {
    const form = useForm<IdCardTemplateFormData>(INITIAL_ID_CARD_TEMPLATE_FORM_STATE);
    const [previewing, setPreviewing] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(
            e,
            () => IdCardTemplateService.save(form.formData, selectedTemplate?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            'ID Card Template',
            !selectedTemplate
        );
    };

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setIsPreviewOpen(false);
        setPreviewing(false);
    };

    const handlePreview = async () => {
        if (!form.formData.body.trim()) {
            toast.error('Add template body before previewing.');
            return;
        }

        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setIsPreviewOpen(true);
        setPreviewing(true);
        try {
            const url = await IdCardTemplateService.previewDraft(form.formData.body);
            setPreviewUrl(url);
        } catch (error) {
            console.error('Preview Error:', error);
            toast.error('Failed to preview ID card template.');
            setIsPreviewOpen(false);
        } finally {
            setPreviewing(false);
        }
    };

    useEffect(() => {
        const state = selectedTemplate
            ? formatIdCardTemplateFormData(selectedTemplate)
            : INITIAL_ID_CARD_TEMPLATE_FORM_STATE;

        form.setFormData(state);
    }, [selectedTemplate, form.setFormData]);

    return (
        <>
            <ModalForm
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                title={selectedTemplate ? 'Edit ID Card Template' : 'Create ID Card Template'}
                description={selectedTemplate ? 'MODIFY EXISTING TEMPLATE' : 'SETUP A NEW TEMPLATE'}
                isUpdate={!!selectedTemplate}
                loading={form.isSubmitting}
                footerStart={
                    <Button
                        type="button"
                        variant="secondary"
                        loading={previewing}
                        onClick={handlePreview}
                    >
                        Preview
                    </Button>
                }
            >
                <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                    <Input
                        label="Name"
                        placeholder="e.g. Employee ID Card"
                        value={form.formData.name}
                        onChange={(e) => form.handleChange('name', e.target.value)}
                        error={form.errors.name?.[0]}
                    />
                    <Textarea
                        label="Template body"
                        helperText="Use placeholders below"
                        rows={14}
                        value={form.formData.body}
                        onChange={(e) => form.handleChange('body', e.target.value)}
                        error={form.errors.body?.[0]}
                        placeholder="Write ID card HTML with {{placeholders}}"
                    />
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Placeholders
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {ID_CARD_PLACEHOLDERS.map((token) => (
                                <button
                                    key={token}
                                    type="button"
                                    onClick={() =>
                                        form.handleChange('body', `${form.formData.body}${token}`)
                                    }
                                    className="rounded border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600 hover:border-slate-300"
                                >
                                    {token}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Switch
                        label="Active"
                        description="Inactive templates cannot be used to generate ID cards."
                        checked={form.formData.isActive}
                        onChange={(val) => form.handleChange('isActive', val)}
                    />
                </div>
            </ModalForm>

            <AnimatePresence>
                {isPreviewOpen && (
                    <ContractTemplatePreviewModal
                        isOpen={isPreviewOpen}
                        onClose={closePreview}
                        title={form.formData.name.trim() || 'Draft preview'}
                        subtitle="Image preview"
                        pdfUrl={previewUrl}
                        loading={previewing && !previewUrl}
                        previewKind="image"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
