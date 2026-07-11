
import { Calendar } from 'lucide-react';
import { getInitials } from '@/utils/userUtils';
import { formatDisplayDate, formatSimpleDate } from '@/utils/dateUtils';

// text
export const TextCell = ({ title }: { title: string | number }) => (
    <div className="flex flex-col min-w-0 justify-center">
        <span className="text-[14px] font-bold text-slate-700 leading-tight tracking-tight truncate">
            {title}
        </span>
    </div>
);

// Date
export const DateCell = ({
    date,
    dateOnly = false,
}: {
    date: string | Date | null | undefined;
    dateOnly?: boolean;
}) => (
    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-50 border border-slate-100/50 group-hover:bg-white transition-colors duration-200">
        <Calendar size={12} className="text-slate-400 shrink-0" />
        
        <span className="text-[11px] font-semibold text-slate-600 tabular-nums tracking-tight whitespace-nowrap">
            {dateOnly ? formatSimpleDate(date) : formatDisplayDate(date)}
        </span>
    </div>
);

// status
export const StatusBadge = ({ status = 'active' }: { status?: string }) => {
    const normalized = status.toLowerCase().replace(/_/g, ' ');
    const key = status.toLowerCase();

    const isInactive = key === 'inactive' || key === 'rejected' || key === 'cancelled';
    const isPending = key === 'pending' || key === 'incomplete' || key === 'ready';
    const isApproved = key === 'approved' || key === 'active' || key === 'completed';
    const isOffboarding = key === 'offboarding';

    let classes = 'bg-slate-50 text-slate-400 border-slate-100';
    let dot = 'bg-slate-300';

    if (isOffboarding) {
        classes = 'bg-rose-50/50 text-rose-600 border-rose-100/50';
        dot = 'bg-rose-500';
    } else if (key === 'incomplete') {
        classes = 'bg-amber-50/50 text-amber-700 border-amber-100/50';
        dot = 'bg-amber-500';
    } else if (key === 'ready') {
        classes = 'bg-sky-50/50 text-sky-700 border-sky-100/50';
        dot = 'bg-sky-500';
    } else if (isPending) {
        classes = 'bg-amber-50/50 text-amber-600 border-amber-100/50';
        dot = 'bg-amber-500';
    } else if (isApproved && !isInactive) {
        classes = 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50';
        dot = 'bg-emerald-500 animate-pulse shadow-emerald-200';
    } else if (isInactive) {
        classes = 'bg-slate-50 text-slate-400 border-slate-100';
        dot = 'bg-slate-300';
    }

    return (
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-300 ${classes}`}>
            <div className={`h-1.5 w-1.5 rounded-full shadow-sm ${dot}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
                {normalized}
            </span>
        </div>
    );
};

// role badge
export const RoleBadge = ({ roleName }: { roleName?: string }) => {
    if (!roleName) {
        return (
            <span className="text-[10px] font-bold text-slate-300 italic uppercase tracking-wider">
                Unassigned
            </span>
        );
    }

    return (
        <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/50 text-slate-600 text-[10px] font-bold uppercase tracking-wider shadow-sm/5 cursor-default hover:bg-slate-200/50 transition-colors">
            {roleName}
        </div>
    );
};

// multiple tags
export const TagsCell = ({ tags, emptyText = "None assigned"}: {
    tags: { id: number | string, name: string }[], 
    emptyText?: string
}) => {
    if (!tags || tags.length === 0) {
        return <span className="text-[11px] text-slate-300 italic font-medium">{emptyText}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5 py-1 max-w-[400px]">
            {tags.map((tag) => (
                <span 
                    key={tag.id} 
                    className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-50/80 border border-slate-200/60 rounded-md uppercase tracking-wider hover:bg-slate-100/80 transition-colors cursor-default"
                >
                    {tag.name.replace(/-/g, ' ')}
                </span>
            ))}
        </div>
    );
};

// user avatar
export const UserCell = ({
    name,
    email,
    subtitle,
}: {
    name: string;
    email?: string;
    subtitle?: string | null;
}) => {
    return (
        <div className="flex items-center gap-3 py-1">
            <div className="h-9 w-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-[11px] border border-blue-100/50 shadow-sm shrink-0 tracking-tighter">
                {getInitials(name)}
            </div>

            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold text-slate-700 leading-none mb-1 truncate">{name}</span>
                {email && (
                    <span className="text-[11px] text-slate-400 font-medium truncate">{email}</span>
                )}
                {subtitle && (
                    <span className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{subtitle}</span>
                )}
            </div>
        </div>
    );
};