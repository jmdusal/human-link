import { useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender, 
    type ColumnDef 
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Searchbar  from '@/components/shared/Searchbar';

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    loading?: boolean;
    showSearch?: boolean;
}

export function DataTable<TData>({ columns, data, loading, showSearch = true }: DataTableProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full" 
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showSearch && (
                <Searchbar 
                    value={globalFilter} 
                    onChange={setGlobalFilter}
                    placeholder="Search records..."
                />
            )}

            <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50/50">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400 border-b border-slate-100">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody className="relative">
                            <AnimatePresence mode='popLayout' initial={false}>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map((row, index) => (
                                        <motion.tr
                                            key={row.id} // Important for TanStack tracking
                                            layout // Smoothly slides rows when filtering/sorting
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.99 }}
                                            transition={{ 
                                                duration: 0.2, 
                                                delay: index * 0.02, // Stagger effect
                                                ease: "easeOut" 
                                            }}
                                            className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 last:border-0"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td 
                                                    key={cell.id} 
                                                    className="px-6 py-4 border-b border-slate-100"
                                                    style={{ width: cell.column.getSize() }}
                                                >
                                                    <div className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </div>
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))
                                ) : (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <td colSpan={columns.length} className="p-20 text-center">
                                            <p className="text-sm font-medium text-slate-400">No matching records found.</p>
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Page <span className="text-slate-900">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-slate-900">{table.getPageCount()}</span>
                    </div>
                                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold px-2 py-1.5 outline-none text-slate-600 focus:border-blue-500/50 transition-all cursor-pointer"
                            >
                                {[10, 20, 30].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => table.previousPage()} 
                                disabled={!table.getCanPreviousPage()}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-20 transition-all active:scale-90"
                            >
                                <ChevronLeft size={14} className="text-slate-600" />
                            </button>
                            <button 
                                onClick={() => table.nextPage()} 
                                disabled={!table.getCanNextPage()}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-20 transition-all active:scale-90"
                            >
                                <ChevronRight size={14} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
