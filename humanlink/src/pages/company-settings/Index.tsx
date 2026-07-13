import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Mail, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import { useAuth } from '@/context/AuthContext';
import { CompanyService } from '@/services/CompanyService';
import type { Company, CompanyFormData } from '@/types';
import { formatSlug } from '@/utils/formatUtils';
import CompanyCreateForm from './components/CompanyCreateForm';
import CompanyEmailTab from './components/CompanyEmailTab';
import CompanyGeneralTab from './components/CompanyGeneralTab';

const EMPTY_FORM: CompanyFormData = {
    name: '',
    slug: '',
    legal_name: '',
    address: '',
    timezone: 'Asia/Manila',
    mail_mailer: '',
    mail_host: '',
    mail_port: '',
    mail_username: '',
    mail_password: '',
    mail_encryption: '',
    mail_from_address: '',
    mail_from_name: '',
};

const SETTINGS_TABS = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'email', label: 'Email', icon: Mail },
] as const;

type SettingsTabId = (typeof SETTINGS_TABS)[number]['id'];

function toForm(company: Company): CompanyFormData {
    return {
        name: company.name ?? '',
        slug: company.slug ?? '',
        legal_name: company.legal_name ?? '',
        address: company.address ?? '',
        timezone: company.timezone ?? 'Asia/Manila',
        mail_mailer: company.mail_mailer ?? '',
        mail_host: company.mail_host ?? '',
        mail_port: company.mail_port != null ? String(company.mail_port) : '',
        mail_username: company.mail_username ?? '',
        mail_password: '',
        mail_encryption: company.mail_encryption ?? '',
        mail_from_address: company.mail_from_address ?? '',
        mail_from_name: company.mail_from_name ?? '',
    };
}

function toPayload(form: CompanyFormData): Record<string, unknown> {
    const payload: Record<string, unknown> = {
        name: form.name,
        slug: form.slug,
        legal_name: form.legal_name || null,
        address: form.address || null,
        timezone: form.timezone || 'Asia/Manila',
        mail_mailer: form.mail_mailer || null,
        mail_host: form.mail_host || null,
        mail_port: form.mail_port ? Number(form.mail_port) : null,
        mail_username: form.mail_username || null,
        mail_encryption: form.mail_encryption || null,
        mail_from_address: form.mail_from_address || null,
        mail_from_name: form.mail_from_name || null,
    };

    if (form.mail_password.trim() !== '') {
        payload.mail_password = form.mail_password;
    }

    return payload;
}

export default function CompanySettingsPage() {
    const { user, hasRole, checkAuth, can, switchCompany } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const isPlatformAdmin = hasRole('super-admin');
    const canEdit = can('companies-edit') || isPlatformAdmin;
    const canCreate = can('companies-create') || isPlatformAdmin;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);
    const [createForm, setCreateForm] = useState<CompanyFormData>(EMPTY_FORM);
    const [showCreate, setShowCreate] = useState(false);
    const [mailPasswordSet, setMailPasswordSet] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingsTabId>('general');

    const loadCurrent = async () => {
        setLoading(true);
        try {
            const current = await CompanyService.current();
            setCompany(current);
            setForm(toForm(current));
            setMailPasswordSet(Boolean(current.mail_password_set));
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to load company settings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurrent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.company_id]);

    useEffect(() => {
        if (searchParams.get('create') === '1' && canCreate) {
            setShowCreate(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, canCreate, setSearchParams]);

    const handleNameChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            name: value,
            slug: formatSlug(value),
        }));
    };

    const handleFormPatch = (patch: Partial<CompanyFormData>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    };

    const handleSave = async () => {
        if (!canEdit || !company) return;
        setSaving(true);
        try {
            const payload = toPayload(form);
            const updated = await CompanyService.updateCurrent(payload as Partial<CompanyFormData>);
            setCompany(updated);
            setForm(toForm(updated));
            setMailPasswordSet(Boolean(updated.mail_password_set));
            await checkAuth();
            toast.success('Company settings saved.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
                'Failed to save company settings.';
            toast.error(String(message));
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async () => {
        if (!canCreate) return;
        setCreating(true);
        try {
            const created = await CompanyService.create({
                name: createForm.name,
                slug: createForm.slug,
                legal_name: createForm.legal_name,
                address: createForm.address,
                timezone: createForm.timezone,
                mail_mailer: '',
                mail_host: '',
                mail_port: '',
                mail_username: '',
                mail_password: '',
                mail_encryption: '',
                mail_from_address: '',
                mail_from_name: '',
            });

            await switchCompany(created.id);
            setCompany(created);
            setForm(toForm(created));
            setMailPasswordSet(Boolean(created.mail_password_set));
            setCreateForm(EMPTY_FORM);
            setShowCreate(false);
            setActiveTab('general');
            toast.success(`${created.name} created and set as active.`);
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
                'Failed to create company.';
            toast.error(String(message));
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <p className="text-sm text-slate-500">Loading company settings…</p>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 min-w-0">
                        <span className="truncate">Company Settings</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                        Editing the active company
                        {company?.name ? (
                            <>
                                {' '}
                                (<span className="font-medium text-slate-700 break-words">{company.name}</span>)
                            </>
                        ) : null}
                        . Switch companies from the header.
                    </p>
                </div>
                {canCreate && (
                    <Button
                        type="button"
                        variant={showCreate ? 'secondary' : 'primary'}
                        icon={Plus}
                        className="w-full sm:w-auto shrink-0"
                        onClick={() => setShowCreate((prev) => !prev)}
                    >
                        {showCreate ? 'Cancel' : 'New company'}
                    </Button>
                )}
            </div>

            {showCreate && canCreate && (
                <CompanyCreateForm
                    form={createForm}
                    creating={creating}
                    onChange={setCreateForm}
                    onSubmit={handleCreate}
                />
            )}

            {!showCreate && (
                <Card className="!p-0 w-full min-w-0 overflow-hidden">
                    <div className="px-3 pt-1 sm:px-5 sm:pt-2">
                        <Tabs
                            tabs={[...SETTINGS_TABS]}
                            activeTab={activeTab}
                            onTabChange={(id) => setActiveTab(id as SettingsTabId)}
                            className="w-full"
                        />
                    </div>

                    <div className="p-4 sm:p-5 space-y-4">
                        {activeTab === 'general' && (
                            <CompanyGeneralTab
                                form={form}
                                companyName={company?.name}
                                canEdit={canEdit}
                                onNameChange={handleNameChange}
                                onChange={handleFormPatch}
                            />
                        )}

                        {activeTab === 'email' && (
                            <CompanyEmailTab
                                form={form}
                                canEdit={canEdit}
                                mailPasswordSet={mailPasswordSet}
                                onChange={handleFormPatch}
                            />
                        )}

                        {canEdit && (
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    className="w-full sm:w-auto"
                                    onClick={handleSave}
                                    disabled={saving || !form.name}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}
