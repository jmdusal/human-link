import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { DataTable } from '@/components/shared/Datatable';
import Button from '@/components/ui/Button';
import ContractTemplateForm from '@/pages/contract-templates/ContractTemplateForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import TableActions from '@/components/shared/TableActions';
import { TextCell, StatusBadge, DateCell } from '@/components/shared/TableCells';
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
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewingId, setPreviewingId] = useState<number | null>(null);

    const handleAdd = () => {
        setSelectedTemplate(null);
        setIsFormOpen(true);
    };

    const handleEdit = (template: ContractTemplate) => {
        setSelectedTemplate(template);
        setIsFormOpen(true);
    };

    const handlePreview = async (template: ContractTemplate) => {
        setPreviewingId(template.id);
        try {
            await ContractTemplateService.preview(template.id);
        } catch (err) {
            console.error('Preview Error:', err);
            toast.error('Failed to preview contract template.');
        } finally {
            setPreviewingId(null);
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50/80 border border-blue-100/60 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
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
            columnHelper.accessor('createdAt', {
                header: 'Created',
                cell: (info) => (
                    info.getValue()
                        ? <DateCell date={info.getValue()} dateOnly />
                        : <TextCell title="—" />
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
                                label: previewingId === info.row.original.id ? 'Loading…' : 'Preview',
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
        [can, previewingId]
    );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Contract Templates
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">
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
            />

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
