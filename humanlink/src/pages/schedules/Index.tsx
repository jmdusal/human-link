import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import type { Schedule } from '@/types';
import ScheduleCalendar from '@/components/features/schedules/ScheduleCalendar';
import ScheduleForm from '@/pages/schedules/ScheduleForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import { useAuth } from '@/context/AuthContext';
import { ScheduleService } from '@/services/ScheduleService';

export default function ScheduleIndex() {
    const { can, hasRole, user } = useAuth();
    const canManageSchedules = hasRole('super-admin')
        || user?.accessScope === 'company'
        || can('users-edit')
        || can('schedules-create')
        || can('schedules-edit');

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [scrollToDay, setScrollToDay] = useState<number | 'start'>('start');

    const filteredSchedules = useMemo(() => {
        const query = globalFilter.trim().toLowerCase();
        if (!query) return schedules;

        return schedules.filter((item) => {
            const name = item.user?.name?.toLowerCase() ?? '';
            const email = item.user?.email?.toLowerCase() ?? '';
            return name.includes(query) || email.includes(query);
        });
    }, [schedules, globalFilter]);

    const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const start = new Date(year, month, 1).toISOString().split('T')[0];
            const end = new Date(year, month + 1, 0).toISOString().split('T')[0];
            const data = await ScheduleService.list(start, end);
            setSchedules(data);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
            toast.error('Failed to load schedules.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [currentDate]);

    const handlePrevMonth = () => {
        setScrollToDay('start');
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setScrollToDay('start');
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        const now = new Date();
        setScrollToDay(now.getDate());
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    };

    const handleCreate = () => {
        setSelectedSchedule(null);
        setIsFormOpen(true);
    };

    const handleEditSchedule = (schedule: Schedule) => {
        if (!canManageSchedules) return;
        setSelectedSchedule(schedule);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedSchedule) return;
        setIsDeleting(true);
        try {
            await ScheduleService.delete(selectedSchedule.id);
            toast.success('Schedule deleted.');
            setIsDeleteOpen(false);
            setSelectedSchedule(null);
            fetchSchedules();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to delete schedule.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800">Schedules</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {canManageSchedules
                            ? 'Create, edit, and visualize employee shift patterns.'
                            : 'View your weekly shifts and rest days.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm">
                        <Button
                            variant="secondary"
                            icon={ChevronLeft}
                            onClick={handlePrevMonth}
                            aria-label="Previous month"
                            className="!border-0 !bg-transparent !shadow-none hover:!bg-blue-50 hover:!text-blue-700"
                        />
                        <div className="min-w-[148px] px-2 text-center text-sm font-bold text-slate-800">
                            {monthLabel}
                        </div>
                        <Button
                            variant="secondary"
                            icon={ChevronRight}
                            onClick={handleNextMonth}
                            aria-label="Next month"
                            className="!border-0 !bg-transparent !shadow-none hover:!bg-blue-50 hover:!text-blue-700"
                        />
                        <div className="mx-1 h-6 w-px bg-slate-200" />
                        <Button
                            onClick={handleToday}
                            className="!min-w-0 !rounded-lg !px-3 !py-1.5 !text-xs"
                        >
                            Today
                        </Button>
                    </div>

                    {canManageSchedules && (can('schedules-create') || can('users-edit') || hasRole('super-admin') || user?.accessScope === 'company') && (
                        <Button variant="primary" icon={Plus} onClick={handleCreate}>
                            New Schedule
                        </Button>
                    )}
                </div>
            </div>

            <ScheduleCalendar
                data={filteredSchedules}
                currentDate={currentDate}
                loading={loading}
                scrollToDay={scrollToDay}
                canEdit={canManageSchedules}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={can('schedules-delete') || hasRole('super-admin') || user?.accessScope === 'company' || can('users-edit')
                    ? handleDeleteClick
                    : undefined}
                showSearch={canManageSchedules}
                searchValue={globalFilter}
                onSearchChange={setGlobalFilter}
                searchPlaceholder="Search users..."
                resultCount={filteredSchedules.length}
            />

            <AnimatePresence>
                {isFormOpen && canManageSchedules && (
                    <ScheduleForm
                        key={selectedSchedule ? `schedule-${selectedSchedule.id}` : 'schedule-create'}
                        isOpen={isFormOpen}
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedSchedule(null);
                        }}
                        onSuccess={fetchSchedules}
                        schedule={selectedSchedule}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteOpen && (
                    <ModalConfirmation
                        isOpen={isDeleteOpen}
                        onClose={() => {
                            setIsDeleteOpen(false);
                            setSelectedSchedule(null);
                        }}
                        onConfirm={handleConfirmDelete}
                        loading={isDeleting}
                        title="Delete Schedule"
                        message={`Delete schedule for ${selectedSchedule?.user?.name ?? 'this employee'}?`}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
