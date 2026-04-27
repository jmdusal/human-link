import React, { useEffect } from 'react';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';



import type { Tag, TagFormData } from '@/types';
import { TagService } from '@/services/TagService';
import { INITIAL_TAG_FORM_STATE, formatTagFormData } from '@/utils/tagUtils';
import { useForm } from '@/hooks/use-form';

interface TagFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tagData: Tag) => void;
    workspaceId: number;
    selectedTag: Tag | null;
}

export default function TagForm({ isOpen, onClose, onSuccess, workspaceId, selectedTag }: TagFormProps) {
    const form = useForm<TagFormData>(INITIAL_TAG_FORM_STATE(workspaceId));

    const onSubmit = (e: React.FormEvent) => {
        form.handleSubmit(e, () => TagService.saveTag(form.formData, selectedTag?.id),
            (data) => {
                onSuccess(data);
                onClose();
            },
            "Tag",
            !!selectedTag
        );
    };

    useEffect(() => {
        const state = selectedTag
            ? formatTagFormData(selectedTag) 
            : INITIAL_TAG_FORM_STATE(workspaceId);

        form.setFormData(state);
    }, [selectedTag, workspaceId, form.setFormData]); 

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={selectedTag ? "Edit Tag" : "Create New Tag"}
            description={selectedTag ? "MODIFY EXISTING CREDENTIALS" : "SETUP A NEW TAG"}
            isUpdate={!!selectedTag}
            loading={form.isSubmitting}
        >
            <div className="col-span-1 md:col-span-2 flex flex-col gap-5 py-2">
                <Input
                    label="Name"
                    placeholder="Enter name"
                    value={form.formData.name}
                    onChange={(e) => form.handleChange('name', e.target.value)}
                    error={form.errors.name?.[0]}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <Input
                        label="Pick Color"
                        type="color"
                        value={form.formData.color || '#626262'}
                        onChange={(e) => form.handleChange('color', e.target.value)}
                        className="h-10 p-1 cursor-pointer"
                    />

                    <Input
                        label="Custom Hex Code"
                        placeholder="#FFFFFF"
                        value={form.formData.color}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 7) {
                                form.handleChange('color', val);
                            }
                        }}
                        error={form.errors.colorHex?.[0]}
                    />
                </div>
            </div>
        </ModalForm>
    );
}
