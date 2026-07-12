import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IdCard } from 'lucide-react';
import type { UserDocument } from '@/types';
import MyDocumentCard, { resolveDocumentUrl } from '@/components/shared/MyDocumentCard';
import ContractTemplatePreviewModal from '@/components/modals/contract-templates/ContractTemplatePreviewModal';

interface MyIdCardCardProps {
    idCard?: UserDocument | null;
    loading?: boolean;
    generating?: boolean;
    onGenerate?: () => void;
    className?: string;
}

export default function MyIdCardCard({
    idCard,
    loading = false,
    generating = false,
    onGenerate,
    className = '',
}: MyIdCardCardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);

    return (
        <>
            <MyDocumentCard
                title="My ID card"
                description="Your employee ID for workplace use."
                emptyTitle="No ID card yet"
                emptyDescription={
                    onGenerate
                        ? 'Generate your employee ID from the company template.'
                        : 'HR will issue your employee ID during onboarding.'
                }
                document={idCard}
                loading={loading}
                generating={generating}
                canGenerate={!!onGenerate && !idCard}
                generateLabel="Generate"
                onGenerate={onGenerate}
                onView={() => setPreviewOpen(true)}
                icon={IdCard}
                className={className}
            />

            <AnimatePresence>
                {previewOpen && idCard && (
                    <ContractTemplatePreviewModal
                        key={`id-card-preview-${idCard.id}`}
                        isOpen={previewOpen}
                        onClose={() => setPreviewOpen(false)}
                        title={idCard.fileName}
                        subtitle="Employee ID preview"
                        pdfUrl={resolveDocumentUrl(idCard.url)}
                        previewKind="image"
                    />
                )}
            </AnimatePresence>
        </>
    );
}
