import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8 pb-10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                Showing 
                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-900 font-mono">
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)}
                </span> 
                of 
                <span className="text-slate-900 font-mono">{totalItems}</span>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                </button>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50/50 border border-slate-100 rounded-2xl">
                    {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all duration-300 ${
                                    currentPage === pageNum 
                                        ? "bg-white text-blue-600 shadow-md shadow-blue-500/10 border border-blue-100 scale-105" 
                                        : "text-slate-400 hover:text-slate-600 hover:bg-white/80"
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                </div>

                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                >
                    <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
