import { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarDays, ChevronLeft, ChevronRight, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import api from '@/api/axios';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/constants';
import type { Schedule } from '@/types/models';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import Searchbar from '@/components/Searchbar';
// import ScheduleForm from './ScheduleForm'; 

export default function ScheduleIndex() {
    const { can } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(true);
    // const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const filteredSchedules = useMemo(() => {
        return schedules.filter(item => 
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
            console.error("Failed to fetch schedules:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch whenever the user changes the month
    useEffect(() => {
        fetchSchedules();
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Schedules</h1>
                        <p className="text-slate-400 text-sm font-medium">Visualize shifts, and rest days across the team.</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                    <Searchbar 
                        value={globalFilter} 
                        onChange={setGlobalFilter} 
                        placeholder="Search users..." 
                    />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2">
                        <button 
                            onClick={handlePrevMonth} 
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                        >
                            <ChevronLeft size={18}/>
                        </button>
                        
                        <button 
                            onClick={handleToday}
                            className="px-3 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                            Today
                        </button>

                        <span className="px-4 font-bold text-slate-700 min-w-[160px] text-center border-x border-slate-100">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                        
                        <button 
                            onClick={handleNextMonth} 
                            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                        >
                            <ChevronRight size={18}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Calendar Content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
                {/* {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="text-blue-600 animate-spin" size={32} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Updating View...</span>
                        </div>
                    </div>
                )} */}
                
                <ScheduleCalendar 
                    data={filteredSchedules} 
                    // loading={loading}
                    currentDate={currentDate}
                />
            </div>

            {/* <ScheduleForm 
                isOpen={isFormOpen} 
                onClose={() => setIsFormOpen(false)} 
                onSuccess={fetchSchedules}
            /> */}
        </div>
    );
}