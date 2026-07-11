import { Download, Printer, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import type { Payslip } from '@/types';
import { formatCurrency } from '@/utils/formatUtils';
import { formatDisplayDate } from '@/utils/dateUtils';
import { PayrollService } from '@/services/PayrollService';
import { useState } from 'react';

interface PayslipViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    payslip: Payslip | null;
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

export default function PayslipViewModal({ isOpen, onClose, payslip }: PayslipViewModalProps) {
    const [downloading, setDownloading] = useState(false);

    if (!isOpen || !payslip) return null;

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
                        </div>
                    </div>

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
                </div>
            </motion.div>
        </div>
    );
}
