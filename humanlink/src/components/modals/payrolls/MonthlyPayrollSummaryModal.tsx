import { useMemo } from 'react';
import { Printer, Wallet, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { Payslip } from '@/types';
import { formatCurrency } from '@/utils/formatUtils';
import { getInitials } from '@/utils/userUtils';

interface MonthlyPayrollSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    payslips: Payslip[];
    year: number;
    month: number;
}

function monthLabel(year: number, month: number): string {
    return new Date(year, month - 1, 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });
}

function toAmount(value: string | number): number {
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function MonthlyPayrollSummaryModal({
    isOpen,
    onClose,
    payslips,
    year,
    month,
}: MonthlyPayrollSummaryModalProps) {
    const totals = useMemo(() => {
        return payslips.reduce(
            (acc, payslip) => {
                acc.daysWorked += payslip.daysWorked;
                acc.hoursWorked += toAmount(payslip.hoursWorked);
                acc.basicPay += toAmount(payslip.basicPay);
                acc.allowancePay += toAmount(payslip.allowancePay);
                acc.grossPay += toAmount(payslip.grossPay);
                return acc;
            },
            {
                daysWorked: 0,
                hoursWorked: 0,
                basicPay: 0,
                allowancePay: 0,
                grossPay: 0,
            },
        );
    }, [payslips]);

    if (!isOpen) return null;

    const label = monthLabel(year, month);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Wallet className="text-white" size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Monthly Payroll Summary</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
                        Print
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-50 rounded-md text-slate-400 transition-colors group"
                    >
                        <X size={18} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
            </div>

            <div className="bg-slate-50/50 border-b border-slate-100 print:border-0 print:bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-inner">
                        <Wallet size={32} />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{label}</h2>
                        <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-sm text-slate-500 font-medium">
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] uppercase tracking-wider text-slate-600">
                                Full Payslip
                            </span>
                            <span>{payslips.length} employee{payslips.length === 1 ? '' : 's'}</span>
                        </div>
                    </div>

                    <div className="text-center md:text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total To Pay</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tight">
                            ₱{formatCurrency(totals.grossPay)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
                <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employees</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">{payslips.length}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Days</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">{totals.daysWorked}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Basic</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">₱{formatCurrency(totals.basicPay)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Allowance</p>
                            <p className="text-xl font-bold text-slate-800 mt-1">₱{formatCurrency(totals.allowancePay)}</p>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Employee</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Days</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Hours</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Daily Rate</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Basic Pay</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Allowance</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Gross Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payslips.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400 font-medium">
                                            No payslips generated for this month yet.
                                        </td>
                                    </tr>
                                ) : (
                                    payslips.map((payslip) => (
                                        <tr key={payslip.id} className="border-b border-slate-100 last:border-0">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[11px] font-bold uppercase shrink-0">
                                                        {getInitials(payslip.user?.name ?? 'U')}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">
                                                            {payslip.user?.name ?? 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-slate-400 truncate">
                                                            {payslip.user?.email ?? ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                {payslip.daysWorked}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                {payslip.hoursWorked}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                ₱{formatCurrency(payslip.dailyRate)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                ₱{formatCurrency(payslip.basicPay)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-700">
                                                ₱{formatCurrency(payslip.allowancePay)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900">
                                                ₱{formatCurrency(payslip.grossPay)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {payslips.length > 0 && (
                                <tfoot className="bg-slate-50 border-t border-slate-200">
                                    <tr>
                                        <td className="px-4 py-4 font-bold text-slate-900">Overall Total</td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                                            {totals.daysWorked}
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                                            {formatCurrency(totals.hoursWorked)}
                                        </td>
                                        <td className="px-4 py-4 text-right text-slate-400">—</td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                                            ₱{formatCurrency(totals.basicPay)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-bold text-slate-900">
                                            ₱{formatCurrency(totals.allowancePay)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-slate-900 text-base">
                                            ₱{formatCurrency(totals.grossPay)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    <p className="text-xs text-slate-400">
                        Overall total is the sum of all employee gross pay for {label} in Philippine peso.
                    </p>
                </div>
            </div>
        </div>
    );
}
