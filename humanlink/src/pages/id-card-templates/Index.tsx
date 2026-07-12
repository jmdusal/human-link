import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import IdCardTemplateForm from '@/pages/id-card-templates/IdCardTemplateForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';
import TableActions from '@/components/shared/TableActions';
import { TextCell, StatusBadge } from '@/components/shared/TableCells';
import { useAuth } from '@/context/AuthContext';
import type { IdCardTemplate } from '@/types';
import { IdCardTemplateService } from '@/services/IdCardTemplateService';
import { useIdCardTemplates } from '@/hooks/use-id-card-templates';

const columnHelper = createColumnHelper<IdCardTemplate>();

export default function IdCardTemplateIndex() {
    const { can } = useAuth();
    const { templates, setTemplates, loading } = useIdCardTemplates(true);

    const [selectedTemplate, setSelectedTemplate] = useState<IdCardTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<IdCardTemplate | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);

    const handleAdd = () => {
        setSelectedTemplate(null);
        setIsFormOpen(true);
    };

    const handleEdit = (template: IdCardTemplate) => {
        setSelectedTemplate(template);
        setIsFormOpen(true);
    };

    const closePreview = useCallback(() => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewTemplate(null);
        setIsPreviewOpen(false);
        setPreviewLoading(false);
    }, [previewUrl]);

    const handlePreview = async (template: IdCardTemplate) => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setPreviewTemplate(template);
        setIsPreviewOpen(true);
        setPreviewLoading(true);

        try {
            const url = await IdCardTemplateService.preview(template.id);
            setPreviewUrl(url);
        } catch (err) {
            console.error('Preview Error:', err);
            toast.error('Failed to preview ID card template.');
            setIsPreviewOpen(false);
            setPreviewTemplate(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSuccess = (templateData: IdCardTemplate) => {
        if (selectedTemplate) {
            setTemplates((prev) =>
                prev.map((template) => (template.id === templateData.id ? templateData : template))
            );
        } else {
            setTemplates((prev) => [templateData, ...prev]);
        }
    };

    const handleError = (error: unknown) => {
        console.error('Form Error:', error);
    };

    const handleDeleteClick = (template: IdCardTemplate) => {
        setSelectedTemplate(template);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTemplate) return;
        setIsDeleting(true);

        try {
            await IdCardTemplateService.delete(selectedTemplate.id);
            setTemplates((prev) => prev.filter((template) => template.id !== selectedTemplate.id));
            toast.success('ID card template removed successfully.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Delete Error:', err);
        } finally {
            setIsDeleting(false);
            setSelectedTemplate(null);
        }
    };

    const columns = useMemo(
        () => [
            columnHelper.accessor('name', {
                header: 'Template',
                cell: (info) => <TextCell title={info.getValue()} />,
            }),
            columnHelper.accessor('isActive', {
                header: 'Active',
                cell: (info) => (
                    <StatusBadge status={info.getValue() ? 'active' : 'inactive'} />
                ),
            }),
            columnHelper.display({
                id: 'actions',
                size: 50,
                header: () => <div className="text-right">Actions</div>,
                cell: (info) => (
                    <TableActions
                        actions={[
                            {
                                label: 'Preview',
                                icon: Eye,
                                onClick: () => handlePreview(info.row.original),
                                show: can('id-card-templates-view'),
                            },
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('id-card-templates-edit'),
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('id-card-templates-delete'),
                            },
                        ]}
                    />
                ),
            }),
        ],
        [can]
    );

    return (
        <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                        ID Card Templates
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                        Company template used to generate employee ID cards.
                    </p>
                </div>

                {can('id-card-templates-create') && templates.length === 0 && (
                    <Button variant="primary" icon={Plus} onClick={handleAdd}>
                        New Template
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={templates}
                loading={loading}
                showSearch={true}
                countLabel={`${templates.length} ${templates.length === 1 ? 'template' : 'templates'}`}
                onRowClick={can('id-card-templates-view') ? handlePreview : undefined}
            />

            <AnimatePresence>
                {isPreviewOpen && (
                    <ContractTemplatePreviewModal
                        key={previewTemplate ? `preview-${previewTemplate.id}` : 'preview'}
                        isOpen={isPreviewOpen}
                        onClose={closePreview}
                        title={previewTemplate?.name || 'ID card preview'}
                        subtitle="Image preview"
                        pdfUrl={previewUrl}
                        loading={previewLoading}
                        previewKind="image"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFormOpen && (
                    <IdCardTemplateForm
                        key={selectedTemplate ? `edit-${selectedTemplate.id}` : 'create-template'}
                        isOpen={isFormOpen}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={handleSuccess}
                        onError={handleError}
                        selectedTemplate={selectedTemplate}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <ModalConfirmation
                        key="delete-confirmation"
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete ID Card Template"
                        message={`Are you sure you want to delete ${selectedTemplate?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
