import type { User, UserFormData } from '@/types';
import { getToday } from '@/utils/dateUtils';

export const DAYS_NAME = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

export const EMPLOYMENT_TYPE_OPTIONS = [
    { value: 'regular', label: 'Regular' },
    { value: 'probationary', label: 'Probationary' },
    { value: 'contractor', label: 'Contractor' },
];

// generates a blank 7-day schedule template
export const createEmptySchedules = (startDate: string) => Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    shiftStart: '08:00',
    shiftEnd: '17:00',
    breakMinutes: 60,
    isRestDay: i === 0 || i === 6,
    isNightShift: false,
    startDate: startDate,
}));

export const INITIAL_USER_FORM_STATE: UserFormData = {
    name: '',
    email: '',
    password: '',
    sendInvite: true,
    role: 'user',
    status: 'active',
    userTypeId: '',
    hiredAt: getToday(),
    departmentId: '',
    positionId: '',
    jobTitle: '',
    department: '',
    employmentType: 'regular',
    mobile: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    sssNumber: '',
    philhealthNumber: '',
    pagibigNumber: '',
    tin: '',
    monthlyRate: '',
    dailyRate: '',
    hourlyRate: '',
    allowanceMonthly: '0.00',
    effectiveDate: getToday(),
    isActive: true,
    weeklyData: createEmptySchedules(getToday()),
    scheduleStartDate: getToday(),
};

export const formatUserFormData = (user: User): UserFormData => {
    const today = getToday();
    const { rate, schedule, roles, name, email, status, userTypeId, details, hiredAt } = user;
    const mainStartDate = schedule?.startDate || today;
    const displaySchedules = schedule?.weeklyData?.length ? schedule.weeklyData : createEmptySchedules(today);

    return {
        name,
        email,
        status,
        password: '',
        sendInvite: false,
        role: roles?.[0]?.name || 'user',
        userTypeId: userTypeId ? String(userTypeId) : '',
        hiredAt: hiredAt || today,
        departmentId: details?.departmentId ? String(details.departmentId) : '',
        positionId: details?.positionId ? String(details.positionId) : '',
        jobTitle: details?.jobTitle ?? '',
        department: details?.department ?? '',
        employmentType: details?.employmentType ?? '',
        mobile: details?.mobile ?? '',
        emergencyContactName: details?.emergencyContactName ?? '',
        emergencyContactPhone: details?.emergencyContactPhone ?? '',
        emergencyContactRelationship: details?.emergencyContactRelationship ?? '',
        sssNumber: details?.sssNumber ?? '',
        philhealthNumber: details?.philhealthNumber ?? '',
        pagibigNumber: details?.pagibigNumber ?? '',
        tin: details?.tin ?? '',
        monthlyRate: rate?.monthlyRate ? Number(rate.monthlyRate).toFixed(2) : '',
        dailyRate: rate?.dailyRate || '',
        hourlyRate: rate?.hourlyRate || '',
        allowanceMonthly: rate?.allowanceMonthly ? Number(rate.allowanceMonthly).toFixed(2) : '0.00',
        effectiveDate: rate?.effectiveDate || today,
        isActive: rate?.isActive ?? true,
        scheduleStartDate: mainStartDate,
        weeklyData: displaySchedules.map((s: any) => ({
            ...s,
            breakMinutes: 60,
            isRestDay: !!s.isRestDay,
            isNightShift: !!s.isNightShift,
            startDate: mainStartDate
        })),
    };
};

export const getInitials = (name: string): string => {
    if (!name) return '?';

    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    return parts[0].slice(0, 2).toUpperCase();
};

export const getCompanyEmailDomain = (companySlug?: string | null): string => {
    if (!companySlug) return '';

    const domain = companySlug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '');

    return domain ? `${domain}.com` : '';
};
