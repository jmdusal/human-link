import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import type { Schedule } from '@/types';
import ScheduleCalendar from '@/components/features/schedules/ScheduleCalendar';
import ScheduleForm from '@/pages/schedules/ScheduleForm';
import ModalConfirmation from '@/components/modals/ModalConfirmation';
import Searchbar from '@/components/shared/Searchbar';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { ScheduleService } from '@/services/ScheduleService';

export default function ScheduleIndex() {
    const { can, hasRole, user } = useAuth();
    const canManageSchedules = hasRole('super-admin')
        || user?.userType === 'hr'
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
        return schedules.filter((item) =>
            item.user?.name.toLowerCase().includes(globalFilter.toLowerCase())
        );
    }, [schedules, globalFilter]);

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
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Schedules</h1>
                    <p className="text-slate-400 text-sm font-medium">
                        {canManageSchedules
                            ? 'Create, edit, and visualize employee shift patterns.'
                            : 'View your weekly shifts and rest days.'}
                    </p>
                </div>
                {canManageSchedules && (can('schedules-create') || can('users-edit') || hasRole('super-admin') || user?.userType === 'hr') && (
                    <Button variant="primary" icon={Plus} onClick={handleCreate}>
                        New Schedule
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                {canManageSchedules ? (
                    <div className="relative flex-1 max-w-sm">
                        <Searchbar
                            value={globalFilter}
                            onChange={setGlobalFilter}
                            placeholder="Search users..."
                        />
                    </div>
                ) : (
                    <div className="flex-1" />
                )}

                <Card className="!p-1.5 flex items-center gap-1 w-fit">
                    <Button
                        variant="ghost"
                        icon={ChevronLeft}
                        onClick={handlePrevMonth}
                        aria-label="Previous month"
                    />

                    <Button variant="secondary" onClick={handleToday}>
                        Today
                    </Button>

                    <span className="px-4 font-semibold text-slate-700 min-w-[150px] text-center text-sm">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>

                    <Button
                        variant="ghost"
                        icon={ChevronRight}
                        onClick={handleNextMonth}
                        aria-label="Next month"
                    />
                </Card>
            </div>

            <ScheduleCalendar
                data={filteredSchedules}
                currentDate={currentDate}
                loading={loading}
                scrollToDay={scrollToDay}
                canEdit={canManageSchedules}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={can('schedules-delete') || hasRole('super-admin') || user?.userType === 'hr' || can('users-edit')
                    ? handleDeleteClick
                    : undefined}
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
