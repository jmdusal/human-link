import { useState } from 'react';
import { Plus, ListTodo, Trash2, Pencil, LayoutGrid, List } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Pagination from '@/components/shared/ModalTabPagination';
import { usePageTitle } from '@/hooks/use-title';
import ReorderStatusForm from '@/pages/statuses/ReorderStatusForm';
import type { Status } from '@/types';

interface SettingsTabProps {
    statuses: Status[];
    data: any;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleEditStatus: (status: Status) => void;
    handleDeleteStatus: (status: Status) => void;
    setSelectedStatus: (status: Status | null) => void;
    setIsStatusFormOpen: (open: boolean) => void;
    onSuccess: (newList: Status[]) => void;
}

export default function StatusesTab({
    statuses,
    data,
    searchQuery,
    setSearchQuery,
    handleEditStatus,
    handleDeleteStatus,
    setSelectedStatus,
    setIsStatusFormOpen,
    onSuccess,
}: SettingsTabProps) {
    usePageTitle('Statuses');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [isReorderOpen, setIsReorderOpen] = useState(false);
    const itemsPerPage = viewMode === 'grid' ? 8 : 10;

    const sortedStatuses = [...(statuses || [])].sort((a, b) => a.position - b.position);
    const gridOrderKey = sortedStatuses.map((s) => `${s.id}-${s.position}`).join('|');

    const filteredStatuses = sortedStatuses.filter((status: Status) =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStatuses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStatuses = filteredStatuses.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    const handleViewMode = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        setCurrentPage(1);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Statuses</h3>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Configure workflow columns for {data.name}.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
                        <button
                            onClick={() => handleViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => handleViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                            aria-label="List view"
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <Searchbar
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Filter statuses..."
                    />

                    <Button variant="primary" onClick={() => setIsReorderOpen(true)}>
                        Reorder Positions
                    </Button>

                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                            setSelectedStatus(null);
                            setIsStatusFormOpen(true);
                        }}
                    >
                        New Status
                    </Button>
                </div>
            </div>

            <div className="flex-1" key={gridOrderKey}>
                {paginatedStatuses.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedStatuses.map((status: Status) => (
                                <Card
                                    key={`${status.id}-${status.position}`}
                                    hover
                                    onClick={() => handleEditStatus(status)}
                                    className="group relative flex flex-col cursor-pointer"
                                >
                                    <div
                                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                                        style={{ backgroundColor: status.colorHex }}
                                    />

                                    <div className="relative z-10 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-6">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-500 ring-4 ring-transparent group-hover:ring-white shadow-sm"
                                                style={{ backgroundColor: `${status.colorHex}20` }}
                                            >
                                                <div
                                                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)] border-2 border-white group-hover:scale-125 transition-transform"
                                                    style={{ backgroundColor: status.colorHex }}
                                                />
                                            </div>

                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full group-hover:bg-white transition-colors shadow-sm">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                    Position {status.position}
                                                </span>
                                            </div>
                                        </div>

                                        <h4 className="text-[17px] font-semibold text-slate-900 mb-1 tracking-tight">
                                            {status.name}
                                        </h4>

                                        <div className="flex-1">
                                            <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                                                Mapped to hex{' '}
                                                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                                    {status.colorHex}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="mt-6 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-700 ease-out group-hover:w-full"
                                                style={{ backgroundColor: status.colorHex, width: '100%' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="relative mt-6 pt-5 flex items-center justify-between border-t border-slate-100/80 z-10">
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out translate-y-1 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditStatus(status);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit status"
                                            >
                                                <Pencil size={13} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteStatus(status);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete status"
                                            >
                                                <Trash2 size={13} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="!p-0 overflow-hidden">
                            <div className="px-6 py-3 bg-slate-50/80 flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <div className="flex-[1.4]">Status</div>
                                <div className="flex-1 text-center">Color</div>
                                <div className="flex-1 text-center">Position</div>
                                <div className="w-20 text-right">Actions</div>
                            </div>

                            {paginatedStatuses.map((status: Status) => (
                                <div
                                    key={`${status.id}-${status.position}`}
                                    onClick={() => handleEditStatus(status)}
                                    className="px-6 py-3.5 flex items-center border-b border-slate-50 last:border-b-0 hover:bg-slate-50/70 transition-colors cursor-pointer"
                                >
                                    <div className="flex-[1.4] flex items-center gap-3 min-w-0">
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${status.colorHex}20` }}
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full border-2 border-white"
                                                style={{ backgroundColor: status.colorHex }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{status.name}</p>
                                            <p className="text-[11px] text-slate-400 font-mono truncate">{status.colorHex}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex justify-center">
                                        <div
                                            className="w-16 h-2 rounded-full"
                                            style={{ backgroundColor: status.colorHex }}
                                        />
                                    </div>

                                    <div className="flex-1 flex justify-center">
                                        <span className="text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide border bg-slate-50 border-slate-200 text-slate-600">
                                            #{status.position}
                                        </span>
                                    </div>

                                    <div className="w-20 flex justify-end gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditStatus(status);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStatus(status);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </Card>
                    )
                ) : (
                    <Card className="flex flex-col items-center justify-center py-20">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
                            <ListTodo size={24} className="text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                            {searchQuery ? 'No matches found' : 'No statuses yet'}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2 max-w-[260px] text-center font-medium leading-relaxed">
                            {searchQuery
                                ? `We couldn't find any status matching "${searchQuery}"`
                                : 'Create statuses to build your board workflow.'}
                        </p>
                    </Card>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredStatuses.length}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <ReorderStatusForm
                isOpen={isReorderOpen}
                onClose={() => setIsReorderOpen(false)}
                existingStatuses={statuses}
                onSuccess={onSuccess}
            />
        </div>
    );
}
