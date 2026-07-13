import Input from '@/components/ui/Input';
import type { CompanyFormData } from '@/types';

interface CompanyGeneralTabProps {
    form: CompanyFormData;
    companyName?: string | null;
    canEdit: boolean;
    onNameChange: (value: string) => void;
    onChange: (patch: Partial<CompanyFormData>) => void;
}

export default function CompanyGeneralTab({
    form,
    companyName,
    canEdit,
    onNameChange,
    onChange,
}: CompanyGeneralTabProps) {
    return (
        <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                <Input
                    label="Name"
                    value={form.name}
                    onChange={(e) => onNameChange(e.target.value)}
                    disabled={!canEdit}
                />
                <Input label="Slug" value={form.slug} readOnly className="bg-slate-50" />
                <Input
                    label="Legal name"
                    value={form.legal_name}
                    onChange={(e) => onChange({ legal_name: e.target.value })}
                    disabled={!canEdit}
                />
                <Input
                    label="Timezone"
                    value={form.timezone}
                    onChange={(e) => onChange({ timezone: e.target.value })}
                    disabled={!canEdit}
                />
                <div className="lg:col-span-2 min-w-0">
                    <Input
                        label="Address"
                        value={form.address}
                        onChange={(e) => onChange({ address: e.target.value })}
                        disabled={!canEdit}
                    />
                </div>
            </div>
        </div>
    );
}
