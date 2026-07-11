import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import MyContractCard from '@/components/shared/MyContractCard';
import { AuthService } from '@/services/AuthService';
import { MeService, type TwoFactorSetup } from '@/services/MeService';
import { PayrollService } from '@/services/PayrollService';
import { usePayrolls } from '@/hooks/use-payrolls';
import { useAttendances } from '@/hooks/use-attendances';
import type { User, UserLeaveBalanceSummary } from '@/types';
import { formatCurrency } from '@/utils/formatUtils';
import { formatSimpleDate } from '@/utils/dateUtils';

function localDateKey(year: number, monthIndex: number, day: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function MyProfilePage() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const range = useMemo(() => {
        const lastDay = new Date(year, month, 0).getDate();
        return {
            start: localDateKey(year, month - 1, 1),
            end: localDateKey(year, month - 1, lastDay),
        };
    }, [year, month]);

    const [profile, setProfile] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaPassword, setMfaPassword] = useState('');

    const { payslips, loading: payslipsLoading } = usePayrolls(true, year, month);
    const { attendances, loading: attendanceLoading } = useAttendances(true, range.start, range.end);

    const myBalances = useMemo(() => {
        const balances = profile?.currentBalances ?? [];
        const byPolicy = new Map<number, UserLeaveBalanceSummary>();
        balances.forEach((balance) => {
            const policyId = balance.leavePolicyId ?? balance.leavePolicy?.id;
            if (!policyId) return;
            const existing = byPolicy.get(policyId);
            if (!existing || Number(balance.year) >= Number(existing.year)) {
                byPolicy.set(policyId, balance);
            }
        });
        return Array.from(byPolicy.values()).sort((a, b) =>
            (a.leavePolicy?.name ?? '').localeCompare(b.leavePolicy?.name ?? ''),
        );
    }, [profile?.currentBalances]);

    const myPayslips = useMemo(() => {
        if (!profile?.id) return [];
        return payslips.filter((payslip) => payslip.userId === profile.id);
    }, [payslips, profile?.id]);

    const myAttendances = useMemo(() => {
        if (!profile?.id) return [];
        return attendances.filter((item) => item.userId === profile.id);
    }, [attendances, profile?.id]);

    useEffect(() => {
        MeService.show()
            .then((user) => {
                setProfile(user);
                setName(user.name);
                setEmail(user.email);
            })
            .catch(() => toast.error('Failed to load profile.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await MeService.update({
                name,
                email,
                ...(password ? { password } : {}),
            });
            setProfile(updated);
            setPassword('');
            toast.success('Profile updated.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleResendVerification = async () => {
        setVerifying(true);
        try {
            await AuthService.sendVerificationEmail();
            toast.success('Verification email sent.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to send verification email.');
        } finally {
            setVerifying(false);
        }
    };

    const handleEnableTwoFactor = async () => {
        setMfaLoading(true);
        try {
            const setup = await MeService.enableTwoFactor();
            setTwoFactorSetup(setup);
            toast.success('Scan the secret in your authenticator app, then confirm.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to start 2FA setup.');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleConfirmTwoFactor = async () => {
        setMfaLoading(true);
        try {
            const updated = await MeService.confirmTwoFactor(mfaCode);
            setProfile(updated);
            setTwoFactorSetup(null);
            setMfaCode('');
            toast.success('Two-factor authentication enabled.');
        } catch (error: any) {
            toast.error(error?.response?.data?.errors?.code?.[0] || error?.response?.data?.message || 'Invalid code.');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleDisableTwoFactor = async () => {
        setMfaLoading(true);
        try {
            const updated = await MeService.disableTwoFactor(mfaPassword);
            setProfile(updated);
            setMfaPassword('');
            toast.success('Two-factor authentication disabled.');
        } catch (error: any) {
            toast.error(error?.response?.data?.errors?.password?.[0] || error?.response?.data?.message || 'Failed to disable 2FA.');
        } finally {
            setMfaLoading(false);
        }
    };

    const handleDownload = async (id: number) => {
        try {
            await PayrollService.downloadPdf(id);
            toast.success('Payslip downloaded.');
        } catch {
            toast.error('Failed to download payslip.');
        }
    };

    if (loading) {
        return <div className="text-sm text-slate-400 font-medium py-10 text-center">Loading profile...</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Profile</h1>
                <p className="text-sm text-slate-500 mt-1">
                    Update your contact details and review leave, attendance, payslips, and contract.
                </p>
            </div>

            <MyContractCard contract={profile?.latestContract} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-slate-200 space-y-4">
                    <div className="flex items-center gap-2">
                        <UserRound size={16} className="text-slate-500" />
                        <h2 className="text-sm font-bold text-slate-800">Account</h2>
                    </div>
                    <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input
                        label="New password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <div className="rounded-xl border border-slate-200 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Email verification</p>
                                <p className="text-xs text-slate-500">
                                    {profile?.emailVerifiedAt
                                        ? `Verified ${formatSimpleDate(profile.emailVerifiedAt)}`
                                        : 'Your email is not verified yet.'}
                                </p>
                            </div>
                            {!profile?.emailVerifiedAt && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    loading={verifying}
                                    onClick={handleResendVerification}
                                >
                                    Resend
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-3 space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Two-factor authentication</p>
                            <p className="text-xs text-slate-500">
                                {profile?.hasTwoFactorEnabled
                                    ? 'Enabled. Required at sign-in.'
                                    : 'Optional. Add an authenticator app for stronger sign-in.'}
                            </p>
                        </div>

                        {twoFactorSetup && !profile?.hasTwoFactorEnabled && (
                            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-600 break-all">
                                    Secret: <span className="font-mono">{twoFactorSetup.secret}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 break-all">{twoFactorSetup.qrCodeUrl}</p>
                                <p className="text-[11px] text-slate-500">
                                    Recovery codes (store safely): {twoFactorSetup.recoveryCodes.join(', ')}
                                </p>
                                <Input
                                    label="Confirm code from app"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    placeholder="123456"
                                />
                                <Button type="button" loading={mfaLoading} onClick={handleConfirmTwoFactor}>
                                    Confirm & enable
                                </Button>
                            </div>
                        )}

                        {profile?.hasTwoFactorEnabled ? (
                            <div className="space-y-2">
                                <Input
                                    label="Current password to disable"
                                    type="password"
                                    value={mfaPassword}
                                    onChange={(e) => setMfaPassword(e.target.value)}
                                />
                                <Button type="button" variant="danger" loading={mfaLoading} onClick={handleDisableTwoFactor}>
                                    Disable 2FA
                                </Button>
                            </div>
                        ) : !twoFactorSetup ? (
                            <Button type="button" variant="secondary" loading={mfaLoading} onClick={handleEnableTwoFactor}>
                                Set up 2FA
                            </Button>
                        ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2">
                        <div>
                            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">SSS</p>
                            <p>{profile?.details?.sssNumber || '—'}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">PhilHealth</p>
                            <p>{profile?.details?.philhealthNumber || '—'}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Pag-IBIG</p>
                            <p>{profile?.details?.pagibigNumber || '—'}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-wider text-[10px] text-slate-400">TIN</p>
                            <p>{profile?.details?.tin || '—'}</p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save changes
                    </Button>
                </Card>

                <Card className="border-slate-200 space-y-3">
                    <h2 className="text-sm font-bold text-slate-800">Leave credits</h2>
                    {myBalances.length === 0 ? (
                        <p className="text-sm text-slate-400">No leave credits assigned.</p>
                    ) : (
                        myBalances.map((balance) => {
                            const allowed = Number(balance.allowed ?? 0);
                            const used = Number(balance.used ?? 0);
                            return (
                                <div key={balance.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            {balance.leavePolicy?.name ?? 'Leave'}
                                        </p>
                                        <p className="text-xs text-slate-400">{balance.year}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">
                                        {(allowed - used).toFixed(1)} left
                                        <span className="text-slate-400 font-medium"> / {allowed}</span>
                                    </p>
                                </div>
                            );
                        })
                    )}
                </Card>
            </div>

            <Card className="border-slate-200 space-y-3">
                <h2 className="text-sm font-bold text-slate-800">This month&apos;s attendance</h2>
                {attendanceLoading ? (
                    <p className="text-sm text-slate-400">Loading...</p>
                ) : myAttendances.length === 0 ? (
                    <p className="text-sm text-slate-400">No attendance records this month.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                    <th className="py-2">Date</th>
                                    <th className="py-2">Status</th>
                                    <th className="py-2">Flags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAttendances.slice(0, 10).map((item) => (
                                    <tr key={item.id} className="border-b border-slate-50">
                                        <td className="py-2 font-medium text-slate-700">{formatSimpleDate(item.date)}</td>
                                        <td className="py-2 capitalize text-slate-600">{item.status}</td>
                                        <td className="py-2 text-xs text-slate-500">
                                            {(item.lateMs ?? 0) > 0 ? 'Late ' : ''}
                                            {(item.overtimeMs ?? 0) > 0 ? 'OT ' : ''}
                                            {(item.undertimeMs ?? 0) > 0 ? 'UT' : ''}
                                            {(item.lateMs ?? 0) === 0 && (item.overtimeMs ?? 0) === 0 && (item.undertimeMs ?? 0) === 0 ? '—' : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card className="border-slate-200 space-y-3">
                <h2 className="text-sm font-bold text-slate-800">Payslips ({now.toLocaleString('default', { month: 'long', year: 'numeric' })})</h2>
                {payslipsLoading ? (
                    <p className="text-sm text-slate-400">Loading...</p>
                ) : myPayslips.length === 0 ? (
                    <p className="text-sm text-slate-400">No payslip for this month yet.</p>
                ) : (
                    myPayslips.map((payslip) => (
                        <div key={payslip.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    Net ₱{formatCurrency(payslip.netPay ?? payslip.grossPay)}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Gross ₱{formatCurrency(payslip.grossPay)} · Deductions ₱{formatCurrency(payslip.totalDeductions ?? 0)}
                                </p>
                            </div>
                            <Button variant="secondary" icon={Download} onClick={() => handleDownload(payslip.id)}>
                                PDF
                            </Button>
                        </div>
                    ))
                )}
            </Card>
        </div>
    );
}
