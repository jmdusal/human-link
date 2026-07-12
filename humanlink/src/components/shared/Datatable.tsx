import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type Header,
    type Cell,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import Searchbar from '@/components/shared/Searchbar';
import Select from '@/components/ui/Select';

const PAGE_SIZE_OPTIONS = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '30', label: '30' },
] as const;

interface DataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    loading?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    /** Controlled search — parent owns filtering when provided with onSearchChange */
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    /** Extra controls rendered beside the search (e.g. status filter) */
    toolbarExtra?: ReactNode;
    /** Optional count label shown in the footer (e.g. "17 people") */
    countLabel?: string;
    /** Optional row click handler (skipped for the actions column) */
    onRowClick?: (row: TData) => void;
}

function isStickyRightColumn(columnId: string, meta?: unknown) {
    if (columnId === 'actions') return true;
    return Boolean((meta as { sticky?: string } | undefined)?.sticky === 'right');
}

function getStickyClasses(stickyRight: boolean, isHeader = false) {
    if (!stickyRight) return isHeader ? 'sticky top-0 z-10' : '';
    return isHeader
        ? 'sticky top-0 right-0 z-20 border-l border-slate-100 dark:border-slate-800'
        : 'sticky right-0 z-10 border-l border-slate-100 bg-white group-hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:group-hover:bg-slate-800/80';
}

function buildPageItems(pageIndex: number, pageCount: number): (number | 'ellipsis')[] {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, i) => i);
    }

    const items: (number | 'ellipsis')[] = [0];
    const start = Math.max(1, pageIndex - 1);
    const end = Math.min(pageCount - 2, pageIndex + 1);

    if (start > 1) items.push('ellipsis');
    for (let i = start; i <= end; i += 1) items.push(i);
    if (end < pageCount - 2) items.push('ellipsis');
    items.push(pageCount - 1);

    return items;
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
    if (sorted === 'asc') return <ArrowUp size={12} className="text-blue-600" />;
    if (sorted === 'desc') return <ArrowDown size={12} className="text-blue-600" />;
    return <ArrowUpDown size={12} className="text-slate-300 opacity-0 transition-opacity group-hover/th:opacity-100" />;
}

function HeaderContent<TData>({ header }: { header: Header<TData, unknown> }) {
    const canSort = header.column.getCanSort();
    const sorted = header.column.getIsSorted();
    const stickyRight = isStickyRightColumn(header.column.id, header.column.columnDef.meta);
    const label = flexRender(header.column.columnDef.header, header.getContext());

    if (!canSort) {
        return (
            <div className={stickyRight ? 'flex justify-end' : undefined}>
                {label}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={header.column.getToggleSortingHandler()}
            className={`group/th inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-xs font-semibold text-slate-500 transition-colors hover:text-blue-600 ${
                stickyRight ? 'ml-auto' : ''
            }`}
        >
            {label}
            <SortIcon sorted={sorted} />
        </button>
    );
}

export function DataTable<TData>({
    columns,
    data,
    loading,
    showSearch = true,
    searchPlaceholder = 'Search records...',
    searchValue,
    onSearchChange,
    toolbarExtra,
    countLabel,
    onRowClick,
}: DataTableProps<TData>) {
    const isSearchControlled = typeof onSearchChange === 'function';
    const [internalFilter, setInternalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const globalFilter = isSearchControlled ? (searchValue ?? '') : internalFilter;
    const setGlobalFilter = isSearchControlled ? onSearchChange : setInternalFilter;

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter: isSearchControlled ? '' : globalFilter, sorting },
        onGlobalFilterChange: isSearchControlled ? undefined : setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: isSearchControlled ? undefined : getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        initialState: { pagination: { pageSize: 10 } },
    });

    const pageCount = table.getPageCount() || 1;
    const pageIndex = table.getState().pagination.pageIndex;
    const filteredCount = isSearchControlled
        ? data.length
        : table.getFilteredRowModel().rows.length;
    const pageItems = useMemo(() => buildPageItems(pageIndex, pageCount), [pageIndex, pageCount]);
    const showToolbar = showSearch || Boolean(toolbarExtra);

    const handleRowClick = (row: TData, cell: Cell<TData, unknown>, event: MouseEvent) => {
        if (!onRowClick) return;
        if (isStickyRightColumn(cell.column.id, cell.column.columnDef.meta)) return;

        const target = event.target as HTMLElement;
        if (target.closest('button, a, input, [role="menu"]')) return;

        onRowClick(row);
    };

    if (loading) {
        return (
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                    <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-5 py-4">
                            <div className="h-4 w-[28%] animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="h-4 w-[18%] animate-pulse rounded bg-slate-50 dark:bg-slate-800/60" />
                            <div className="h-4 w-[22%] animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-50 dark:bg-slate-800/60" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            {showToolbar && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                        {showSearch && (
                            <Searchbar
                                value={globalFilter}
                                onChange={setGlobalFilter}
                                placeholder={searchPlaceholder}
                            />
                        )}
                        {toolbarExtra}
                    </div>
                    {showSearch && globalFilter && (
                        <p className="shrink-0 text-xs text-slate-400">
                            {filteredCount} result{filteredCount === 1 ? '' : 's'}
                        </p>
                    )}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full min-w-full border-separate border-spacing-0 text-left">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const stickyRight = isStickyRightColumn(
                                        header.column.id,
                                        header.column.columnDef.meta,
                                    );

                                    return (
                                        <th
                                            key={header.id}
                                            className={`whitespace-nowrap border-b border-slate-100 bg-slate-50/95 px-5 py-3 text-left text-xs font-semibold text-slate-500 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-400 ${getStickyClasses(stickyRight, true)}`}
                                            style={{ width: header.column.getSize() }}
                                        >
                                            <HeaderContent header={header} />
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`group animate-in fade-in duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {row.getVisibleCells().map((cell) => {
                                        const stickyRight = isStickyRightColumn(
                                            cell.column.id,
                                            cell.column.columnDef.meta,
                                        );

                                        return (
                                            <td
                                                key={cell.id}
                                                className={`border-b border-slate-100 px-5 py-3.5 align-middle dark:border-slate-800 ${getStickyClasses(stickyRight)}`}
                                                style={{ width: cell.column.getSize() }}
                                                onClick={(event) => handleRowClick(row.original, cell, event)}
                                            >
                                                <div className="text-sm text-slate-600 transition-colors group-hover:text-slate-800 dark:text-slate-300 dark:group-hover:text-slate-100">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-16">
                                    <div className="flex animate-in fade-in flex-col items-center justify-center gap-2 text-center duration-200">
                                        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                                            <Inbox size={20} strokeWidth={1.75} />
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No matching records</p>
                                        <p className="max-w-xs text-xs text-slate-400">
                                            {globalFilter
                                                ? 'Try a different search term.'
                                                : 'Nothing to show here yet.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="relative z-20 flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {countLabel && (
                        <>
                            <span className="truncate font-medium text-slate-600 dark:text-slate-300">{countLabel}</span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                        </>
                    )}
                    <span className="shrink-0 tabular-nums">
                        Page <span className="font-medium text-slate-800 dark:text-slate-100">{pageIndex + 1}</span> of{' '}
                        <span className="font-medium text-slate-800 dark:text-slate-100">{pageCount}</span>
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">Rows</span>
                        <div className="w-[68px]">
                            <Select
                                options={PAGE_SIZE_OPTIONS}
                                value={String(table.getState().pagination.pageSize)}
                                onChange={(value) => table.setPageSize(Number(value))}
                                placeholder="Rows"
                                size="sm"
                                menuMaxHeightClass="max-h-40"
                                menuPlacement="top"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Previous page"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {pageItems.map((item, index) =>
                            item === 'ellipsis' ? (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="flex h-7 w-7 items-center justify-center text-xs text-slate-300 dark:text-slate-600"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => table.setPageIndex(item)}
                                    aria-label={`Go to page ${item + 1}`}
                                    aria-current={item === pageIndex ? 'page' : undefined}
                                    className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-1.5 text-xs font-medium tabular-nums transition-all ${
                                        item === pageIndex
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300'
                                    }`}
                                >
                                    {item + 1}
                                </button>
                            ),
                        )}

                        <button
                            type="button"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Next page"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
