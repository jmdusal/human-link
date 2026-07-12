import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { UserDocument } from '@/types';
import MyDocumentCard, { resolveDocumentUrl } from '@/components/shared/MyDocumentCard';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';

interface MyContractCardProps {
    contract?: UserDocument | null;
    loading?: boolean;
    generating?: boolean;
    onGenerate?: () => void;
    className?: string;
}

export default function MyContractCard({
    contract,
    loading = false,
    generating = false,
    onGenerate,
    className = '',
}: MyContractCardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <>
            <MyDocumentCard
                title="My contract"
                description="Your employment agreement on file."
                emptyTitle="No contract yet"
                emptyDescription={
                    onGenerate
                        ? 'Generate your contract from the company template.'
                        : 'HR will attach your contract during onboarding.'
                }
                document={contract}
                loading={loading}
                generating={generating}
                canGenerate={!!onGenerate && !contract}
                generateLabel="Generate"
                onGenerate={onGenerate}
                onView={() => setPreviewOpen(true)}
                icon={FileText}
                className={className}
            />

            <AnimatePresence>
                {previewOpen && contract && (
                    <ContractTemplatePreviewModal
                        key={`contract-preview-${contract.id}`}
                        isOpen={previewOpen}
                        onClose={() => setPreviewOpen(false)}
                        title={contract.fileName}
                        subtitle="Contract preview"
                        pdfUrl={resolveDocumentUrl(contract.url)}
                        previewKind="pdf"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
