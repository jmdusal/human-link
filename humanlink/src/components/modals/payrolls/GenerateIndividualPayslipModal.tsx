import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Select from '@/components/ui/Select';
import { PayrollService } from '@/services/PayrollService';
import type { Payslip } from '@/types';

interface GenerateIndividualPayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (payslip: Payslip) => void;
    year: number;
    month: number;
    userOptions: { label: string; value: string }[];
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
    value: String(i + 1),
}));

export default function GenerateIndividualPayslipModal({
    isOpen,
    onClose,
    onSuccess,
    year,
    month,
    userOptions,
}: GenerateIndividualPayslipModalProps) {
    const [userId, setUserId] = useState('');
    const [selectedYear, setSelectedYear] = useState(String(year));
    const [selectedMonth, setSelectedMonth] = useState(String(month));
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const yearOptions = Array.from({ length: 6 }, (_, i) => {
        const y = new Date().getFullYear() - 2 + i;
        return { label: String(y), value: String(y) };
    });

    useEffect(() => {
        if (!isOpen) return;

        setUserId('');
        setSelectedYear(String(year));
        setSelectedMonth(String(month));
        setErrors({});
    }, [isOpen, year, month]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setErrors({ userId: ['Select an employee.'] });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const payslip = await PayrollService.generateIndividual({
                userId: Number(userId),
                year: Number(selectedYear),
                month: Number(selectedMonth),
            });
            toast.success('Payslip generated.');
            onSuccess(payslip);
            onClose();
        } catch (error: any) {
            const responseErrors = error?.response?.data?.errors;
            if (responseErrors) {
                setErrors({
                    userId: responseErrors.user_id ?? [],
                    year: responseErrors.year ?? [],
                    month: responseErrors.month ?? [],
                });
            }

            const message =
                error?.response?.data?.message
                || responseErrors?.user_id?.[0]
                || 'Failed to generate payslip.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title="Generate Individual Payslip"
            description="CREATE A PAYSLIP FOR ONE EMPLOYEE AND MONTH"
            loading={loading}
            size="xl"
            overflowVisible
        >
            <div className="flex flex-col gap-6 py-2 min-h-[280px]">
                <div>
                    <Select
                        label="Employee"
                        options={userOptions}
                        value={userId}
                        onChange={(value) => {
                            setUserId(value);
                            setErrors((prev) => ({ ...prev, userId: [] }));
                        }}
                        placeholder="Select employee"
                        menuMaxHeightClass="max-h-72"
                        wrapLabels
                    />
                    {errors.userId?.[0] && (
                        <p className="text-xs text-red-500 font-medium mt-1.5">{errors.userId[0]}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Month"
                        options={MONTH_OPTIONS}
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        menuMaxHeightClass="max-h-64"
                    />
                    <Select
                        label="Year"
                        options={yearOptions}
                        value={selectedYear}
                        onChange={setSelectedYear}
                    />
                </div>
            </div>
        </ModalForm>
    );
}
