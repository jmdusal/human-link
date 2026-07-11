import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createColumnHelper } from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';
import { Eye, FileSpreadsheet, Trash2, UserRound, Wallet } from 'lucide-react';
import { DataTable } from '@/components/shared/Datatable';
import TableActions from '@/components/shared/TableActions';
import { TextCell, UserCell } from '@/components/shared/TableCells';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import GenerateIndividualPayslipModal from '@/components/modals/payrolls/GenerateIndividualPayslipModal';
import MonthlyPayrollSummaryModal from '@/components/modals/payrolls/MonthlyPayrollSummaryModal';
import PayslipViewModal from '@/components/modals/payrolls/PayslipViewModal';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import { useAuth } from '@/context/AuthContext';
import { usePayrolls } from '@/hooks/use-payrolls';
import { useUsers } from '@/hooks/use-users';
import { PayrollService } from '@/services/PayrollService';
import type { Payslip } from '@/types';
import { formatCurrency } from '@/utils/formatUtils';

const columnHelper = createColumnHelper<Payslip>();

const MONTH_OPTIONS = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
    { label: '13th Month', value: '13' },
] as const;

function periodLabel(year: number, month: number): string {
    if (month === 13) {
        return `13th Month ${year}`;
    }

    return new Date(year, month - 1, 1).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
    });
}

function toAmount(value: string | number): number {
    const parsed = typeof value === 'string' ? parseFloat(value) : value;
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function PayrollIndex() {
    const { can, hasRole, user } = useAuth();
    const canManage = hasRole('super-admin') || user?.userType === 'hr' || can('users-edit') || can('payrolls-create');

    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(() => now.getFullYear());
    const [month, setMonth] = useState(() => now.getMonth() + 1);

    const yearOptions = useMemo(() => {
        const currentYear = now.getFullYear();
        return Array.from({ length: 7 }, (_, index) => {
            const value = String(currentYear - 3 + index);
            return { label: value, value };
        });
    }, [now]);

    const { payslips, loading, setPayslips, fetchPayslips } = usePayrolls(true, year, month);
    const { userOptions } = useUsers(canManage);

    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [isGenerateIndividualOpen, setIsGenerateIndividualOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const selectOptions = useMemo(
        () => userOptions.map((user) => ({
            label: `${user.name} (${user.email})`,
            value: String(user.id),
        })),
        [userOptions],
    );

    const monthTotals = useMemo(() => {
        return payslips.reduce(
            (acc, payslip) => {
                acc.grossPay += toAmount(payslip.grossPay);
                acc.netPay += toAmount(payslip.netPay ?? 0);
                return acc;
            },
            { grossPay: 0, netPay: 0 },
        );
    }, [payslips]);

    const handleGenerate13th = async () => {
        setIsGenerating(true);
        try {
            const result = await PayrollService.generateThirteenthMonth(year);
            toast.success(result.message || `Generated ${result.meta.generated ?? 0} 13th-month payslip(s).`);
            setMonth(13);
            setPayslips(result.data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to generate 13th month.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAll = async () => {
        if (month === 13) {
            await handleGenerate13th();
            return;
        }

        setIsGenerating(true);
        try {
            const result = await PayrollService.generate({ year, month });
            setPayslips(result.data);
            toast.success(result.message || `Generated ${result.meta.generated ?? 0} payslip(s).`);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to generate payroll.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleIndividualSuccess = (payslip: Payslip) => {
        if (payslip.year === year && payslip.month === month) {
            setPayslips((prev) => {
                const without = prev.filter((item) => item.id !== payslip.id && !(item.userId === payslip.userId));
                return [payslip, ...without];
            });
        } else {
            fetchPayslips();
        }
    };

    const handleView = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setIsViewOpen(true);
    };

    const handlePayslipUpdated = (updated: Payslip) => {
        setSelectedPayslip(updated);
        setPayslips((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
    };

    const handleDeleteClick = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPayslip) return;

        setIsDeleting(true);
        try {
            await PayrollService.delete(selectedPayslip.id);
            setPayslips((prev) => prev.filter((item) => item.id !== selectedPayslip.id));
            toast.success('Payslip deleted.');
            setIsDeleteOpen(false);
            setSelectedPayslip(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete payslip.');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = useMemo(() => [
        columnHelper.accessor((row) => row.user?.name ?? 'Unknown', {
            id: 'employee',
            header: 'Employee',
            cell: (info) => (
                <UserCell
                    name={info.getValue()}
                    email={info.row.original.user?.email ?? ''}
                />
            ),
        }),
        columnHelper.accessor('daysWorked', {
            header: 'Days',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('paidLeaveDays', {
            header: 'Paid Leave',
            cell: (info) => <TextCell title={info.getValue() ?? 0} />,
        }),
        columnHelper.accessor('hoursWorked', {
            header: 'Hours',
            cell: (info) => <TextCell title={info.getValue()} />,
        }),
        columnHelper.accessor('dailyRate', {
            header: 'Daily Rate',
            cell: (info) => <TextCell title={`₱${formatCurrency(info.getValue())}`} />,
        }),
        columnHelper.accessor('basicPay', {
            header: 'Basic Pay',
            cell: (info) => <TextCell title={`₱${formatCurrency(info.getValue())}`} />,
        }),
        columnHelper.accessor('allowancePay', {
            header: 'Allowance',
            cell: (info) => <TextCell title={`₱${formatCurrency(info.getValue())}`} />,
        }),
        columnHelper.accessor('grossPay', {
            header: 'Gross Pay',
            cell: (info) => <TextCell title={`₱${formatCurrency(info.getValue())}`} />,
        }),
        columnHelper.accessor('netPay', {
            header: 'Net Pay',
            cell: (info) => <TextCell title={`₱${formatCurrency(info.getValue() ?? 0)}`} />,
        }),
        columnHelper.display({
            id: 'actions',
            size: 50,
            header: () => <div className="text-right">Actions</div>,
            cell: (info) => (
                <TableActions
                    actions={[
                        {
                            label: 'View Payslip',
                            icon: Eye,
                            onClick: () => handleView(info.row.original),
                            show: true,
                        },
                        {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => handleDeleteClick(info.row.original),
                            variant: 'danger',
                            show: can('payrolls-delete'),
                        },
                    ]}
                />
            ),
        }),
    ], [can]);

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payroll</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Generate monthly payslips from attendance and employee rates (PHP).
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-[110px]">
                            <Select
                                options={yearOptions}
                                value={String(year)}
                                onChange={(value) => setYear(Number(value))}
                                placeholder="Year"
                            />
                        </div>
                        <div className="w-[160px]">
                            <Select
                                options={MONTH_OPTIONS}
                                value={String(month)}
                                onChange={(value) => setMonth(Number(value))}
                                placeholder="Month"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {canManage && month !== 13 && (
                            <Button
                                variant="primary"
                                icon={FileSpreadsheet}
                                onClick={handleGenerateAll}
                                loading={isGenerating}
                            >
                                Generate All
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            icon={Wallet}
                            onClick={() => setIsSummaryOpen(true)}
                            disabled={payslips.length === 0}
                        >
                            Full Summary
                        </Button>
                        {canManage && (
                            <>
                                {month !== 13 && (
                                    <Button
                                        variant="secondary"
                                        icon={UserRound}
                                        onClick={() => setIsGenerateIndividualOpen(true)}
                                    >
                                        Individual
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    icon={Wallet}
                                    onClick={handleGenerate13th}
                                    loading={isGenerating}
                                >
                                    13th Month
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {payslips.length > 0 && (
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-slate-500 font-medium">
                        {payslips.length} payslip{payslips.length === 1 ? '' : 's'} for {periodLabel(year, month)}
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                        Gross: ₱{formatCurrency(monthTotals.grossPay)} · Net: ₱{formatCurrency(monthTotals.netPay)}
                    </p>
                </div>
            )}

            <DataTable
                columns={columns}
                data={payslips}
                loading={loading}
                showSearch={true}
            />

            <AnimatePresence>
                {isViewOpen && (
                    <PayslipViewModal
                        isOpen={isViewOpen}
                        onClose={() => {
                            setIsViewOpen(false);
                            setSelectedPayslip(null);
                        }}
                        payslip={selectedPayslip}
                        onPayslipUpdated={handlePayslipUpdated}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isSummaryOpen && (
                    <MonthlyPayrollSummaryModal
                        isOpen={isSummaryOpen}
                        onClose={() => setIsSummaryOpen(false)}
                        payslips={payslips}
                        year={year}
                        month={month}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isGenerateIndividualOpen && (
                    <GenerateIndividualPayslipModal
                        isOpen={isGenerateIndividualOpen}
                        onClose={() => setIsGenerateIndividualOpen(false)}
                        onSuccess={handleIndividualSuccess}
                        year={year}
                        month={month}
                        userOptions={selectOptions}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteOpen && (
                    <ModalConfirmation
                        isOpen={isDeleteOpen}
                        onClose={() => {
                            setIsDeleteOpen(false);
                            setSelectedPayslip(null);
                        }}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete Payslip"
                        message={`Delete payslip for ${selectedPayslip?.user?.name ?? 'this employee'}?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
