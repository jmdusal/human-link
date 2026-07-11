import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet } from 'lucide-react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { ReportService, type ReportFormat } from '@/services/ReportService';

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
] as const;

const FORMAT_OPTIONS = [
    { label: 'CSV', value: 'csv' },
    { label: 'Excel', value: 'xlsx' },
] as const;

type ReportKey = 'attendance' | 'leave' | 'payroll';

const REPORTS: Array<{
    key: ReportKey;
    title: string;
    description: string;
    needsMonth: boolean;
}> = [
    {
        key: 'attendance',
        title: 'Attendance summary',
        description: 'Days worked, hours, late, undertime, and overtime by employee for the selected month.',
        needsMonth: true,
    },
    {
        key: 'leave',
        title: 'Leave utilization',
        description: 'Total entitled, used, and remaining leave days per employee for the selected year.',
        needsMonth: false,
    },
    {
        key: 'payroll',
        title: 'Payroll register',
        description: 'Full payslip register with earnings, statutory deductions, adjustments, and net pay.',
        needsMonth: true,
    },
];

export default function ReportsIndex() {
    const { can, hasRole } = useAuth();
    const canExport = hasRole('super-admin') || hasRole('hr-manager') || can('reports-view') || can('payrolls-view');

    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(() => now.getFullYear());
    const [month, setMonth] = useState(() => now.getMonth() + 1);
    const [format, setFormat] = useState<ReportFormat>('csv');
    const [loadingKey, setLoadingKey] = useState<ReportKey | null>(null);

    const yearOptions = useMemo(() => {
        const currentYear = now.getFullYear();
        return Array.from({ length: 7 }, (_, index) => {
            const value = String(currentYear - 3 + index);
            return { label: value, value };
        });
    }, [now]);

    const handleDownload = async (key: ReportKey) => {
        if (!canExport) {
            toast.error('You do not have permission to export reports.');
            return;
        }

        setLoadingKey(key);
        try {
            if (key === 'attendance') {
                await ReportService.downloadAttendanceSummary(year, month, format);
            } else if (key === 'leave') {
                await ReportService.downloadLeaveUtilization(year, format);
            } else {
                await ReportService.downloadPayrollRegister(year, month, format);
            }
            toast.success('Report downloaded.');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to download report.');
        } finally {
            setLoadingKey(null);
        }
    };

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        Export attendance, leave utilization, and payroll register as CSV or Excel.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-[110px]">
                        <Select
                            options={yearOptions}
                            value={String(year)}
                            onChange={(value) => setYear(Number(value))}
                            placeholder="Year"
                        />
                    </div>
                    <div className="w-[150px]">
                        <Select
                            options={MONTH_OPTIONS}
                            value={String(month)}
                            onChange={(value) => setMonth(Number(value))}
                            placeholder="Month"
                        />
                    </div>
                    <div className="w-[120px]">
                        <Select
                            options={FORMAT_OPTIONS}
                            value={format}
                            onChange={(value) => setFormat(value as ReportFormat)}
                            placeholder="Format"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {REPORTS.map((report) => (
                    <div
                        key={report.key}
                        className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col gap-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-slate-600">
                                <FileSpreadsheet size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-800">{report.title}</h2>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{report.description}</p>
                                {report.needsMonth && (
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Uses selected year & month
                                    </p>
                                )}
                                {!report.needsMonth && (
                                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                        Uses selected year
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            icon={Download}
                            loading={loadingKey === report.key}
                            onClick={() => handleDownload(report.key)}
                            disabled={!canExport}
                            className="mt-auto w-full justify-center"
                        >
                            Download
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
