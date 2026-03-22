import { useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender, 
    type ColumnDef 
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import Searchbar  from '@/components/Searchbar';

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
        state: {
            globalFilter 
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: { pagination: { pageSize: 10 } }
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showSearch && (
                <Searchbar 
                    value={globalFilter} 
                    onChange={setGlobalFilter}
                    placeholder="Search users..." 
                />
                // <div className="flex items-center justify-between gap-4">
                //     <div className="relative flex-1 max-w-sm">
                //         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                //         <input
                //             type="text" 
                //             value={globalFilter ?? ''}
                //             onChange={e => setGlobalFilter(e.target.value)}
                //             placeholder="Search users..." 
                //             className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-4 ring-blue-500/5 focus:border-blue-500/50 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-400" 
                //         />
                //     </div>
                //     <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer">
                //         <SlidersHorizontal size={14} />
                //         Filters
                //     </button>
                // </div>
            )}

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm shadow-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-slate-50/50 border-b border-slate-100">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-600">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="p-20 text-center">
                                        <p className="text-sm font-medium text-slate-400">No matching records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-tight">
                        Showing <span className="text-slate-900">{table.getRowModel().rows.length}</span> of <span className="text-slate-900">{table.getFilteredRowModel().rows.length}</span> results
                    </div>
                                    
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Rows</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold px-2 py-1 outline-none text-slate-600"
                            >
                                {[10, 20, 30].map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-1">
                            <button 
                                onClick={() => table.previousPage()} 
                                disabled={!table.getCanPreviousPage()}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronLeft size={16} className="text-slate-600" />
                            </button>
                            <button 
                                onClick={() => table.nextPage()} 
                                disabled={!table.getCanNextPage()}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                                <ChevronRight size={16} className="text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}