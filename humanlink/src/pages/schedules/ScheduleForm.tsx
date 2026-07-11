import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import ModalForm from '@/components/modals/ModalForm';
import Input from '@/components/ui/Input';
import DateInput from '@/components/ui/DateInput';
import Checkbox from '@/components/ui/Checkbox';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import type { Schedule, WeeklyScheduleDay } from '@/types';
import { DAYS_NAME, createEmptySchedules, getInitials } from '@/utils/userUtils';
import { ScheduleService } from '@/services/ScheduleService';
import { useUsers } from '@/hooks/use-users';
import { getToday } from '@/utils/dateUtils';

interface ScheduleFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    schedule: Schedule | null;
}

export default function ScheduleForm({ isOpen, onClose, onSuccess, schedule }: ScheduleFormProps) {
    const isCreate = !schedule;
    const { userOptions } = useUsers(isCreate && isOpen);

    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState(getToday());
    const [weeklyData, setWeeklyData] = useState<WeeklyScheduleDay[]>(createEmptySchedules(getToday()));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectOptions = useMemo(
        () => userOptions.map((user) => ({
            label: `${user.name} (${user.email})`,
            value: String(user.id),
        })),
        [userOptions],
    );

    useEffect(() => {
        if (!isOpen) return;

        if (!schedule) {
            setUserId('');
            setStartDate(getToday());
            setWeeklyData(createEmptySchedules(getToday()));
            return;
        }

        const nextStart = schedule.startDate || getToday();
        const nextWeekly = schedule.weeklyData?.length
            ? [...schedule.weeklyData]
                .map((day) => ({
                    dayOfWeek: Number(day.dayOfWeek),
                    shiftStart: String(day.shiftStart || '08:00').slice(0, 5),
                    shiftEnd: String(day.shiftEnd || '17:00').slice(0, 5),
                    isRestDay: !!day.isRestDay,
                    isNightShift: !!day.isNightShift,
                }))
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            : createEmptySchedules(nextStart);

        setUserId(String(schedule.userId ?? schedule.user?.id ?? ''));
        setStartDate(nextStart);
        setWeeklyData(nextWeekly);
    }, [schedule, isOpen]);

    const handleScheduleChange = (index: number, field: keyof WeeklyScheduleDay, value: string | boolean) => {
        setWeeklyData((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreate && !userId) {
            toast.error('Select an employee for this schedule.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isCreate) {
                await ScheduleService.create({
                    userId: Number(userId),
                    startDate,
                    weeklyData,
                });
                toast.success('Schedule created successfully.');
            } else if (schedule) {
                await ScheduleService.update(schedule.id, {
                    startDate,
                    weeklyData,
                });
                toast.success('Schedule updated successfully.');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.message
                || error?.response?.data?.errors?.user_id?.[0]
                || 'Failed to save schedule.';
            toast.error(typeof message === 'string' ? message : 'Failed to save schedule.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ModalForm
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={isCreate ? 'Create Schedule' : 'Edit Schedule'}
            description={isCreate ? 'Assign a weekly shift pattern' : (schedule?.user?.name || 'Weekly shift pattern')}
            isUpdate={!isCreate}
            loading={isSubmitting}
            size="4xl"
        >
            <div className="col-span-1 md:col-span-2 space-y-6">
                {isCreate ? (
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Employee</p>
                        <Select
                            options={selectOptions}
                            value={userId}
                            onChange={setUserId}
                            placeholder="Select employee"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold uppercase">
                            {getInitials(schedule?.user?.name || '?')}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-900">{schedule?.user?.name}</p>
                            <p className="text-sm text-slate-400 font-medium">Update weekly shifts and rest days</p>
                        </div>
                    </div>
                )}

                <Card className="!p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/80">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Effective Period</p>
                        <p className="text-sm font-medium text-slate-700 mt-0.5">Schedule starts on</p>
                    </div>
                    <div className="w-full sm:w-64">
                        <DateInput
                            value={startDate}
                            label=""
                            onChange={(date: Date | null) => {
                                if (date) {
                                    setStartDate(date.toISOString().split('T')[0]);
                                }
                            }}
                        />
                    </div>
                </Card>

                <Card className="!p-0 overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/50">
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Day</div>
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Shift Start</div>
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Shift End</div>
                        <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right pr-4">Status</div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {weeklyData.map((sched, index) => {
                            const isRest = sched.isRestDay;

                            return (
                                <div
                                    key={sched.dayOfWeek}
                                    className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-3.5 transition-colors ${
                                        isRest ? 'bg-slate-50/40' : 'bg-white hover:bg-slate-50/50'
                                    }`}
                                >
                                    <div className="col-span-3">
                                        <span className={`text-sm font-semibold tracking-tight ${isRest ? 'text-slate-400' : 'text-slate-800'}`}>
                                            {DAYS_NAME[sched.dayOfWeek]}
                                        </span>
                                    </div>

                                    <div className="col-span-3 flex justify-center">
                                        {!isRest ? (
                                            <Input
                                                type="time"
                                                value={sched.shiftStart}
                                                onChange={(e) => handleScheduleChange(index, 'shiftStart', e.target.value)}
                                                className="text-center font-medium"
                                                label=""
                                            />
                                        ) : (
                                            <div className="h-10 w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-300 font-bold uppercase">
                                                Off
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex justify-center">
                                        {!isRest ? (
                                            <Input
                                                type="time"
                                                value={sched.shiftEnd}
                                                onChange={(e) => handleScheduleChange(index, 'shiftEnd', e.target.value)}
                                                className="text-center font-medium"
                                                label=""
                                            />
                                        ) : (
                                            <div className="h-10 w-full flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-[10px] text-slate-300 font-bold uppercase">
                                                Off
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex items-center justify-end gap-3 pr-2">
                                        <span className={`text-sm font-semibold tracking-tight ${isRest ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {isRest ? 'Rest Day' : 'Working'}
                                        </span>
                                        <Checkbox
                                            checked={isRest}
                                            onChange={(e) => handleScheduleChange(index, 'isRestDay', e.target.checked)}
                                            className="scale-110 cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </ModalForm>
    );
}
