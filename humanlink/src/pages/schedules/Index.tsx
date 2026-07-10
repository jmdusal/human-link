import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import Button from '@/components/ui/Button';
import { API_ROUTES } from '@/constants';
import type { Schedule } from '@/types';
import ScheduleCalendar from '@/components/features/schedules/ScheduleCalendar';
import ScheduleForm from '@/pages/schedules/ScheduleForm';
import Searchbar from '@/components/shared/Searchbar';
import Card from '@/components/ui/Card';

export default function ScheduleIndex() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

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

            const res = await api.get(`${API_ROUTES.SCHEDULES.LIST}?start=${start}&end=${end}`);
            setSchedules(res.data.data);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
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

    const handleEditSchedule = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setIsFormOpen(true);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Schedules</h1>
                    <p className="text-slate-400 text-sm font-medium">Visualize shifts and rest days.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Searchbar
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        placeholder="Search users..."
                    />
                </div>

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
                onEditSchedule={handleEditSchedule}
            />

            <AnimatePresence>
                {isFormOpen && (
                    <ScheduleForm
                        key={selectedSchedule ? `schedule-${selectedSchedule.id}` : 'schedule-form'}
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
        </div>
    );
}
