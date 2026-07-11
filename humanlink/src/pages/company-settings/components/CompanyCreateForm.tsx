import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import type { CompanyFormData } from '@/types';
import { formatSlug } from '@/utils/formatUtils';

interface CompanyCreateFormProps {
    form: CompanyFormData;
    creating: boolean;
    onChange: (form: CompanyFormData) => void;
    onSubmit: () => void;
}

export default function CompanyCreateForm({
    form,
    creating,
    onChange,
    onSubmit,
}: CompanyCreateFormProps) {
    return (
        <Card className="!p-4 sm:!p-5 space-y-3 sm:space-y-4 w-full min-w-0">
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">Create company</h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    After create, this company becomes active and you will only edit this one here.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                <Input
                    label="Name"
                    value={form.name}
                    onChange={(e) =>
                        onChange({
                            ...form,
                            name: e.target.value,
                            slug: formatSlug(e.target.value),
                        })
                    }
                />
                <Input label="Slug" value={form.slug} readOnly className="bg-slate-50" />
                <Input
                    label="Legal name"
                    value={form.legal_name}
                    onChange={(e) => onChange({ ...form, legal_name: e.target.value })}
                />
                <Input
                    label="Timezone"
                    value={form.timezone}
                    onChange={(e) => onChange({ ...form, timezone: e.target.value })}
                />
                <div className="lg:col-span-2 min-w-0">
                    <Input
                        label="Address"
                        value={form.address}
                        onChange={(e) => onChange({ ...form, address: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={onSubmit}
                    disabled={creating || !form.name}
                >
                    {creating ? 'Creating…' : 'Create company'}
                </Button>
            </div>
        </Card>
    );
}
