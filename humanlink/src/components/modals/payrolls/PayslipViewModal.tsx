import { useEffect, useState } from 'react';
import { Download, Plus, Printer, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import type { Payslip } from '@/types';
import type { PayslipAdjustmentFormData, PayslipAdjustmentType } from '@/types/PayslipAdjustment';
import { formatCurrency } from '@/utils/formatUtils';
import { formatDisplayDate } from '@/utils/dateUtils';
import { PayrollService } from '@/services/PayrollService';

interface PayslipViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    payslip: Payslip | null;
    onPayslipUpdated?: (payslip: Payslip) => void;
}

function monthLabel(year: number, month: number): string {
    if (month === 13) return `13th Month Pay — ${year}`;
    return new Date(year, month - 1, 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });
}

function amount(value?: string | number | null): string {
    return formatCurrency(value ?? 0);
}

function formatHours(ms: number): string {
    return (ms / 3_600_000).toFixed(2);
}

const ADJUSTMENT_TYPE_OPTIONS = [
    { label: 'Earning', value: 'earning' },
    { label: 'Deduction', value: 'deduction' },
];

export default function PayslipViewModal({
    isOpen,
    onClose,
    payslip: initialPayslip,
    onPayslipUpdated,
}: PayslipViewModalProps) {
    const { can, hasRole } = useAuth();
    const canAdjust = hasRole('super-admin') || hasRole('hr-manager') || can('payrolls-edit') || can('payrolls-create');

    const [payslip, setPayslip] = useState<Payslip | null>(initialPayslip);
    const [downloading, setDownloading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [savingAdjustment, setSavingAdjustment] = useState(false);
    const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
    const [adjustmentForm, setAdjustmentForm] = useState<PayslipAdjustmentFormData>({
        type: 'earning',
        label: '',
        amount: 0,
        reason: '',
    });

    useEffect(() => {
        setPayslip(initialPayslip);
        setShowAdjustmentForm(false);
    }, [initialPayslip]);

    useEffect(() => {
        if (!isOpen || !initialPayslip?.id) return;

        let cancelled = false;
        setLoadingDetail(true);

        PayrollService.show(initialPayslip.id)
            .then((detail) => {
                if (!cancelled) {
                    setPayslip(detail);
                    onPayslipUpdated?.(detail);
                }
            })
            .catch(() => {
                // Keep list payload if detail fetch fails.
            })
            .finally(() => {
                if (!cancelled) setLoadingDetail(false);
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, initialPayslip?.id]);

    if (!isOpen || !payslip) return null;

    const adjustments = payslip.adjustments ?? [];
    const breakdown = payslip.attendanceBreakdown ?? [];

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            await PayrollService.downloadPdf(payslip.id);
            toast.success('Payslip PDF downloaded.');
        } catch {
            toast.error('Failed to download PDF.');
        } finally {
            setDownloading(false);
        }
    };

    const handleAddAdjustment = async () => {
        if (!adjustmentForm.label.trim() || !adjustmentForm.amount) {
            toast.error('Label and amount are required.');
            return;
        }

        setSavingAdjustment(true);
        try {
            const result = await PayrollService.addAdjustment(payslip.id, {
                ...adjustmentForm,
                amount: Number(adjustmentForm.amount),
            });
            const updated = result.payslip
                ? { ...payslip, ...result.payslip, adjustments: result.payslip.adjustments ?? payslip.adjustments }
                : await PayrollService.show(payslip.id);
            setPayslip(updated);
            onPayslipUpdated?.(updated);
            setAdjustmentForm({ type: 'earning', label: '', amount: 0, reason: '' });
            setShowAdjustmentForm(false);
            toast.success('Adjustment added.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to add adjustment.');
        } finally {
            setSavingAdjustment(false);
        }
    };

    const handleRemoveAdjustment = async (adjustmentId: number) => {
        setSavingAdjustment(true);
        try {
            const updated = await PayrollService.removeAdjustment(payslip.id, adjustmentId);
            const next = updated ?? await PayrollService.show(payslip.id);
            setPayslip(next);
            onPayslipUpdated?.(next);
            toast.success('Adjustment removed.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to remove adjustment.');
        } finally {
            setSavingAdjustment(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm print:hidden"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 print:shadow-none print:border-0 print:max-w-none print:rounded-none"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Payslip</h2>
                        <p className="text-sm text-slate-400">{monthLabel(payslip.year, payslip.month)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" icon={Download} onClick={handleDownloadPdf} disabled={downloading}>
                            PDF
                        </Button>
                        <Button variant="secondary" icon={Printer} onClick={handlePrint}>
                            Print
                        </Button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div id="payslip-print" className="p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Human Link</p>
                            <h3 className="text-xl font-bold text-slate-900 mt-1">Employee Payslip</h3>
                            <p className="text-sm text-slate-500 mt-1">{monthLabel(payslip.year, payslip.month)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Currency</p>
                            <p className="text-sm font-semibold text-slate-700">{payslip.currency}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-slate-50 border border-slate-100 p-4">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Employee</p>
                            <p className="text-sm font-bold text-slate-800 mt-1">{payslip.user?.name ?? '—'}</p>
                            <p className="text-xs text-slate-500">{payslip.user?.email ?? ''}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Period</p>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                {formatDisplayDate(payslip.periodStart)} – {formatDisplayDate(payslip.periodEnd)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {payslip.daysWorked} day(s) · {payslip.paidLeaveDays ?? 0} paid leave · {payslip.hoursWorked} hrs
                            </p>
                        </div>
                    </div>

                    {(loadingDetail || breakdown.length > 0) && (
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                                <h4 className="text-sm font-semibold text-slate-700">Attendance feeding this payslip</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Transparent link from timesheet hours to pay.</p>
                            </div>
                            {loadingDetail && breakdown.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-slate-400">Loading attendance…</p>
                            ) : breakdown.length === 0 ? (
                                <p className="px-4 py-6 text-sm text-slate-400">No attendance rows in this period.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-white border-b border-slate-100">
                                        <tr>
                                            <th className="text-left px-4 py-2 text-slate-500 font-medium">Date</th>
                                            <th className="text-right px-4 py-2 text-slate-500 font-medium">Hours</th>
                                            <th className="text-right px-4 py-2 text-slate-500 font-medium">OT</th>
                                            <th className="text-right px-4 py-2 text-slate-500 font-medium">Late</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakdown.map((row) => (
                                            <tr key={row.id} className="border-b border-slate-50">
                                                <td className="px-4 py-2 text-slate-700">{formatDisplayDate(row.date)}</td>
                                                <td className="px-4 py-2 text-right">{formatHours(row.totalMs)}</td>
                                                <td className="px-4 py-2 text-right">{formatHours(row.overtimeMs ?? 0)}</td>
                                                <td className="px-4 py-2 text-right">{formatHours(row.lateMs ?? 0)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Earnings</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Basic pay</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.basicPay)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Allowance</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.allowancePay)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Overtime</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.overtimePay)}</td>
                                </tr>
                                {Number(payslip.thirteenthMonthPay ?? 0) > 0 && (
                                    <tr className="border-b border-slate-100">
                                        <td className="px-4 py-3 text-slate-700">13th month</td>
                                        <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.thirteenthMonthPay)}</td>
                                    </tr>
                                )}
                                {adjustments.filter((item) => item.type === 'earning').map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100">
                                        <td className="px-4 py-3 text-slate-700">
                                            {item.label}
                                            <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Adj</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">₱{amount(item.amount)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <td className="px-4 py-3 font-bold">Gross pay</td>
                                    <td className="px-4 py-3 text-right font-bold">₱{amount(payslip.grossPay)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Deductions</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">SSS (EE)</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.sssEe)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">PhilHealth (EE)</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.philhealthEe)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Pag-IBIG (EE)</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.pagibigEe)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Withholding tax</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.withholdingTax)}</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="px-4 py-3 text-slate-700">Other deductions</td>
                                    <td className="px-4 py-3 text-right font-medium">₱{amount(payslip.otherDeductions)}</td>
                                </tr>
                                {adjustments.filter((item) => item.type === 'deduction').map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100">
                                        <td className="px-4 py-3 text-slate-700">
                                            {item.label}
                                            <span className="ml-2 text-[10px] uppercase tracking-wider text-rose-600 font-bold">Adj</span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">₱{amount(item.amount)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <td className="px-4 py-3 font-bold">Total deductions</td>
                                    <td className="px-4 py-3 text-right font-bold">₱{amount(payslip.totalDeductions)}</td>
                                </tr>
                                <tr className="bg-emerald-50">
                                    <td className="px-4 py-3 font-bold text-emerald-800">Net pay</td>
                                    <td className="px-4 py-3 text-right font-bold text-emerald-800">₱{amount(payslip.netPay)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden print:hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700">Manual adjustments</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Editable earnings/deductions after generation.</p>
                            </div>
                            {canAdjust && (
                                <Button
                                    variant="secondary"
                                    icon={Plus}
                                    onClick={() => setShowAdjustmentForm((prev) => !prev)}
                                >
                                    Add
                                </Button>
                            )}
                        </div>

                        {showAdjustmentForm && (
                            <div className="p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Select
                                    options={ADJUSTMENT_TYPE_OPTIONS}
                                    value={adjustmentForm.type}
                                    onChange={(value) =>
                                        setAdjustmentForm((prev) => ({
                                            ...prev,
                                            type: value as PayslipAdjustmentType,
                                        }))
                                    }
                                    placeholder="Type"
                                />
                                <input
                                    type="text"
                                    value={adjustmentForm.label}
                                    onChange={(event) =>
                                        setAdjustmentForm((prev) => ({ ...prev, label: event.target.value }))
                                    }
                                    placeholder="Label"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={adjustmentForm.amount || ''}
                                    onChange={(event) =>
                                        setAdjustmentForm((prev) => ({
                                            ...prev,
                                            amount: Number(event.target.value),
                                        }))
                                    }
                                    placeholder="Amount"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="text"
                                    value={adjustmentForm.reason ?? ''}
                                    onChange={(event) =>
                                        setAdjustmentForm((prev) => ({ ...prev, reason: event.target.value }))
                                    }
                                    placeholder="Reason (optional)"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <div className="sm:col-span-2">
                                    <Button
                                        variant="primary"
                                        loading={savingAdjustment}
                                        onClick={handleAddAdjustment}
                                    >
                                        Save adjustment
                                    </Button>
                                </div>
                            </div>
                        )}

                        {adjustments.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-slate-400">No adjustments yet.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {adjustments.map((item) => (
                                    <li key={item.id} className="px-4 py-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                {item.label}
                                                <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400">
                                                    {item.type}
                                                </span>
                                            </p>
                                            {item.reason && (
                                                <p className="text-xs text-slate-400 mt-0.5">{item.reason}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-slate-700">
                                                ₱{amount(item.amount)}
                                            </span>
                                            {canAdjust && (
                                                <button
                                                    type="button"
                                                    disabled={savingAdjustment}
                                                    onClick={() => handleRemoveAdjustment(item.id)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
