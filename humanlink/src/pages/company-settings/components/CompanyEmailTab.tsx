import Input from '@/components/ui/Input';
import type { CompanyFormData } from '@/types';

interface CompanyEmailTabProps {
    form: CompanyFormData;
    canEdit: boolean;
    mailPasswordSet: boolean;
    onChange: (patch: Partial<CompanyFormData>) => void;
}

const selectClassName =
    'w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm disabled:bg-slate-50';

export default function CompanyEmailTab({
    form,
    canEdit,
    mailPasswordSet,
    onChange,
}: CompanyEmailTabProps) {
    const mailer = form.mail_mailer || '';
    const isLogMailer = mailer === 'log';
    const isSmtpMailer = mailer === 'smtp' || mailer === 'sendmail';

    return (
        <div className="space-y-3 sm:space-y-4 min-w-0">
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">Email settings</h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    For local testing, choose <span className="font-medium text-slate-700">Log (Telescope)</span>.
                    Leave as system default to use <code className="text-[11px]">MAIL_MAILER</code> from <code className="text-[11px]">.env</code>.
                    Use SMTP only for real delivery.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                <div className="min-w-0">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                        Mailer
                    </label>
                    <select
                        value={mailer}
                        disabled={!canEdit}
                        onChange={(e) => {
                            const next = e.target.value;
                            onChange({
                                mail_mailer: next,
                                ...(next === 'log' || next === ''
                                    ? {
                                          mail_host: '',
                                          mail_port: '',
                                          mail_username: '',
                                          mail_password: '',
                                          mail_encryption: '',
                                      }
                                    : {}),
                            });
                        }}
                        className={selectClassName}
                    >
                        <option value="">System default (.env)</option>
                        <option value="log">Log (Telescope / local)</option>
                        <option value="smtp">SMTP</option>
                        <option value="sendmail">Sendmail</option>
                    </select>
                </div>
                <Input
                    label="From name"
                    value={form.mail_from_name}
                    onChange={(e) => onChange({ mail_from_name: e.target.value })}
                    disabled={!canEdit}
                />
                <Input
                    label="From email"
                    type="email"
                    value={form.mail_from_address}
                    onChange={(e) => onChange({ mail_from_address: e.target.value })}
                    disabled={!canEdit}
                />

                {isLogMailer && (
                    <div className="lg:col-span-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-xs text-blue-800 leading-relaxed">
                        Emails are written to the log (not sent). Open{' '}
                        <a
                            href="http://localhost:8000/telescope/mail"
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold underline underline-offset-2"
                        >
                            Telescope → Mail
                        </a>{' '}
                        to inspect them. Ensure <code className="text-[11px]">MAIL_MAILER=log</code> is also fine
                        system-wide in <code className="text-[11px]">.env</code>.
                    </div>
                )}

                {isSmtpMailer && (
                    <>
                        <Input
                            label="SMTP host"
                            value={form.mail_host}
                            onChange={(e) => onChange({ mail_host: e.target.value })}
                            disabled={!canEdit}
                            placeholder="smtp.mailprovider.com"
                        />
                        <Input
                            label="Port"
                            value={form.mail_port}
                            onChange={(e) => onChange({ mail_port: e.target.value })}
                            disabled={!canEdit}
                            placeholder="587"
                            inputMode="numeric"
                        />
                        <div className="min-w-0">
                            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                                Encryption
                            </label>
                            <select
                                value={form.mail_encryption || 'tls'}
                                disabled={!canEdit}
                                onChange={(e) => onChange({ mail_encryption: e.target.value })}
                                className={selectClassName}
                            >
                                <option value="tls">TLS</option>
                                <option value="ssl">SSL</option>
                                <option value="">None</option>
                            </select>
                        </div>
                        <Input
                            label="Username"
                            value={form.mail_username}
                            onChange={(e) => onChange({ mail_username: e.target.value })}
                            disabled={!canEdit}
                            autoComplete="off"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={form.mail_password}
                            onChange={(e) => onChange({ mail_password: e.target.value })}
                            disabled={!canEdit}
                            autoComplete="new-password"
                            helperText={
                                mailPasswordSet
                                    ? 'Password is set. Leave blank to keep the current one.'
                                    : 'Optional. Stored encrypted.'
                            }
                        />
                    </>
                )}
            </div>
        </div>
    );
}
