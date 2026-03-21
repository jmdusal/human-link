import type { User } from '@/types/models'; 

export const DAYS_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const INITIAL_FORM_STATE = (today: string) => ({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
    monthlyRate: '',
    dailyRate: '',
    hourlyRate: '',
    allowanceMonthly: '0.00',
    effectiveDate: today,
    isActive: true,
    weeklyData: createEmptySchedules(today),
    scheduleStartDate: today
});

// generates a blank 7-day schedule template 
export const createEmptySchedules = (startDate: string) => 
    Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        shiftStart: '08:00',
        shiftEnd: '17:00',
        breakMinutes: 60,
        isRestDay: i === 0 || i === 6,
        isNightShift: false,
        startDate: startDate,
    }));

export const formatUserFormData = (user: User, today: string) => {
    const { rate, schedule, roles, name, email, status } = user;
    const mainStartDate = schedule?.startDate || today;
    const displaySchedules = schedule?.weeklyData?.length ? schedule.weeklyData : createEmptySchedules(today);

    return {
        name,
        email,
        status,
        password: '',
        role: roles?.[0]?.name || 'user',
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

export const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; 
};
