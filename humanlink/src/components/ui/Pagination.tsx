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
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 pb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Showing <span className="text-slate-800">{startIndex + 1}</span> - <span className="text-slate-800">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="text-slate-800">{totalItems}</span>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex items-center px-2 gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                currentPage === i + 1 
                                    ? "bg-blue-600 text-white shadow-lg scale-110" 
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button 
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
