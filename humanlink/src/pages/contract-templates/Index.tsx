import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import ContractTemplateForm from '@/pages/contract-templates/ContractTemplateForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';
import TableActions from '@/components/shared/TableActions';
import { TextCell, StatusBadge } from '@/components/shared/TableCells';
import { useAuth } from '@/context/AuthContext';
import type { ContractTemplate } from '@/types';
import { ContractTemplateService } from '@/services/ContractTemplateService';
import { useContractTemplates } from '@/hooks/use-contract-templates';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/utils/userUtils';

const columnHelper = createColumnHelper<ContractTemplate>();

const employmentLabel = (value: string) =>
    EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label || value;

export default function ContractTemplateIndex() {
    const { can } = useAuth();
    const { templates, setTemplates, loading } = useContractTemplates(true);

    const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
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

    const handleEdit = (template: ContractTemplate) => {
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

    const handlePreview = async (template: ContractTemplate) => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        setPreviewTemplate(template);
        setIsPreviewOpen(true);
        setPreviewLoading(true);

        try {
            const url = await ContractTemplateService.preview(template.id);
            setPreviewUrl(url);
        } catch (err) {
            console.error('Preview Error:', err);
            toast.error('Failed to preview contract template.');
            setIsPreviewOpen(false);
            setPreviewTemplate(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSuccess = (templateData: ContractTemplate) => {
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

    const handleDeleteClick = (template: ContractTemplate) => {
        setSelectedTemplate(template);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTemplate) return;
        setIsDeleting(true);

        try {
            await ContractTemplateService.delete(selectedTemplate.id);
            setTemplates((prev) => prev.filter((template) => template.id !== selectedTemplate.id));
            toast.success('Contract template removed successfully.');
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
            columnHelper.accessor('employmentType', {
                header: 'Employment',
                cell: (info) => (
                    <span className="inline-flex items-center rounded-md border border-blue-100/60 bg-blue-50/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {employmentLabel(info.getValue())}
                    </span>
                ),
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
                                show: can('contract-templates-view'),
                            },
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => handleEdit(info.row.original),
                                show: can('contract-templates-edit'),
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                onClick: () => handleDeleteClick(info.row.original),
                                variant: 'danger',
                                show: can('contract-templates-delete'),
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
                        Contract Templates
                    </h1>
                    <p className="text-sm font-medium text-slate-400">
                        Org-level templates used to generate employee contracts.
                    </p>
                </div>

                {can('contract-templates-create') && (
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
                onRowClick={can('contract-templates-view') ? handlePreview : undefined}
            />

            <AnimatePresence>
                {isPreviewOpen && (
                    <ContractTemplatePreviewModal
                        key={previewTemplate ? `preview-${previewTemplate.id}` : 'preview'}
                        isOpen={isPreviewOpen}
                        onClose={closePreview}
                        title={previewTemplate?.name || 'Contract preview'}
                        subtitle={
                            previewTemplate
                                ? `${employmentLabel(previewTemplate.employmentType)} · PDF preview`
                                : 'PDF preview'
                        }
                        pdfUrl={previewUrl}
                        loading={previewLoading}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isFormOpen && (
                    <ContractTemplateForm
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
                        title="Delete Contract Template"
                        message={`Are you sure you want to delete ${selectedTemplate?.name}? This action is permanent.`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
