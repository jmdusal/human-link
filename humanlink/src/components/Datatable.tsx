import { useState } from 'react';
import { 
    useReactTable, 
    getCoreRowModel, 
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender, 
    type ColumnDef 
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    loading?: boolean;
    showSearch?: boolean;
}

export function DataTable<TData>({ columns, data, loading, showSearch = true  }: DataTableProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 10
            } 
        }
    });

    if (loading) {
        return <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading data...</div>;
    }

    return (
        <div className="space-y-6">
            
            {/* Search Bar */}
            {showSearch && (
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={globalFilter ?? ''}
                            onChange={e => setGlobalFilter(e.target.value)}
                            placeholder="Search..." 
                            className="w-full bg-white border border-white shadow-sm rounded-2xl py-3 pl-12 pr-4 focus:ring-2 ring-blue-500/20 outline-none transition-all font-medium text-slate-600" 
                        />
                    </div>
                    {/* <button className="px-6 bg-white border border-white shadow-sm rounded-2xl font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer border-none">
                        Filters
                    </button> */}
                </div>
            )}
            
            {/* <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        placeholder="Search..." 
                        className="w-full bg-white border border-white shadow-sm rounded-2xl py-3 pl-12 pr-4 focus:ring-2 ring-blue-500/20 outline-none transition-all font-medium text-slate-600" 
                    />
                </div>
                <button className="px-6 bg-white border border-white shadow-sm rounded-2xl font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer border-none">
                    Filters
                </button>
            </div> */}

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
                <table className="w-full text-left border-collapse">
                    {/* Added border-b for the header boundary */}
                    <thead className="bg-slate-50/40 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 border-b border-slate-100">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-5">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-8 py-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="p-20 text-center text-slate-400 font-bold">
                                    No results found for "{globalFilter}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-8 py-5">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50/30 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-8 py-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="p-20 text-center text-slate-400 font-bold">
                                    No results found for "{globalFilter}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table> */}

                {/* Pagination Controls */}
                <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px] font-bold">
                    <div className="flex-1 text-slate-400">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                                    
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 uppercase tracking-tight">Rows per page</span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-slate-300 transition-colors font-bold text-slate-600"
                            >
                                {[5, 10, 20, 30, 40, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>{pageSize}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600">
                                <ChevronsLeft size={18} />
                            </button>
                            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600">
                                <ChevronLeft size={18} />
                            </button>
                            
                            <span className="flex items-center gap-1 px-4 min-w-fit">
                                <span className="text-slate-400">Page</span>
                                <span className="text-slate-800">{table.getState().pagination.pageIndex + 1}</span>
                                <span className="text-slate-300">of</span>
                                <span className="text-slate-800">{table.getPageCount()}</span>
                            </span>

                            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600">
                                <ChevronRight size={18} />
                            </button>
                            <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-all cursor-pointer border-none bg-transparent text-slate-400 hover:text-slate-600">
                                <ChevronsRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}