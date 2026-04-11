import { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Pagination from '@/components/shared/ModalTabPagination';
import { usePageTitle } from '@/hooks/use-title';

interface SettingsTabProps {
    data: any;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function SettingsTab({ data, searchQuery, setSearchQuery }: SettingsTabProps) {
    usePageTitle("Settings")
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredStages = (data.statuses || []).filter((status: any) =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStages = filteredStages.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">
                        Configure workflow columns for {data.name}.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <Searchbar 
                        value={searchQuery} 
                        onChange={handleSearch} 
                        placeholder="Filter stages..." 
                    />
                    
                    <Button 
                        variant="primary" 
                        icon={Plus}
                        onClick={() => {/* Open New Stage Modal */}}
                    >
                        New Stage
                    </Button>
                </div>
            </div>

            <div className="flex-1">
                {paginatedStages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {paginatedStages.map((status: any, index: number) => (
                            <div 
                                key={status.id || index} 
                                className="group relative flex flex-col p-6 rounded-[32px] bg-white hover:bg-slate-50/80 transition-all duration-500 ease-out cursor-pointer border border-transparent hover:border-slate-100"
                            >
                                <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] pointer-events-none" />
                                
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-6">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm border border-transparent group-hover:border-white"
                                            style={{ backgroundColor: `${status.colorHex}15` }} 
                                        >
                                            <div 
                                                className="w-3 h-3 rounded-full shadow-sm" 
                                                style={{ backgroundColor: status.colorHex}} 
                                            />
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full group-hover:bg-white transition-colors">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Step {status.position + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:translate-x-1 transition-transform duration-300">
                                        {status.name}
                                    </h4>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed line-clamp-2">
                                        Stage color is set to {status.colorHex}.
                                    </p>
                                </div>

                                <div className="relative mt-8 pt-6 flex items-center justify-between border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Settings size={14} className="group-hover:text-blue-500 transition-colors" />
                                        <span className="text-[11px] font-bold uppercase tracking-tight">Configure</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-300">
                                        ID: {status.id}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 rounded-[40px] bg-slate-50/30">
                         <p className="text-slate-400 text-sm font-medium">No stages found.</p>
                    </div>
                )}
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredStages.length}
                onPageChange={setCurrentPage}
            />

            <div className="mt-20 border-t border-slate-100 pt-10">
                <div className="p-10 rounded-[40px] bg-red-50/20 border border-dashed border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-bold text-red-900">Archive Workspace</h4>
                        <p className="text-red-400 text-sm mt-1 font-medium max-w-sm">
                            Permanently remove this workspace and all associated projects. This cannot be undone.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-red-600 rounded-3xl text-sm font-bold shadow-sm hover:bg-red-600 hover:text-white transition-all hover:scale-105 active:scale-95">
                        Delete Workspace
                    </button>
                </div>
            </div>
        </div>
    );
}