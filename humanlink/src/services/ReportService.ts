import api from '@/api/axios';
import { API_ROUTES } from '@/constants';

export type ReportFormat = 'csv' | 'xlsx';
export type ReportType = 'attendance-summary' | 'leave-utilization' | 'payroll-register';

function filenameFromDisposition(header: string | undefined, fallback: string): string {
    if (!header) return fallback;
    const match = /filename="?([^"]+)"?/i.exec(header);
    return match?.[1] ?? fallback;
}

async function downloadReport(
    url: string,
    params: Record<string, string | number>,
    fallbackName: string,
): Promise<void> {
    const response = await api.get(url, {
        params,
        responseType: 'blob',
    });

    const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'text/csv',
    });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filenameFromDisposition(
        response.headers['content-disposition'],
        fallbackName,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
}

export const ReportService = {
    async downloadAttendanceSummary(year: number, month: number, format: ReportFormat = 'csv'): Promise<void> {
        await downloadReport(
            API_ROUTES.REPORTS.ATTENDANCE_SUMMARY,
            { year, month, format },
            `attendance-summary-${year}-${String(month).padStart(2, '0')}.${format === 'xlsx' ? 'xls' : 'csv'}`,
        );
    },

    async downloadLeaveUtilization(year: number, format: ReportFormat = 'csv'): Promise<void> {
        await downloadReport(
            API_ROUTES.REPORTS.LEAVE_UTILIZATION,
            { year, format },
            `leave-utilization-${year}.${format === 'xlsx' ? 'xls' : 'csv'}`,
        );
    },

    async downloadPayrollRegister(year: number, month: number, format: ReportFormat = 'csv'): Promise<void> {
        await downloadReport(
            API_ROUTES.REPORTS.PAYROLL_REGISTER,
            { year, month, format },
            `payroll-register-${year}-${String(month).padStart(2, '0')}.${format === 'xlsx' ? 'xls' : 'csv'}`,
        );
    },
};
