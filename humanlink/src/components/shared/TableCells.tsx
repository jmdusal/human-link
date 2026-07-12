import { Calendar } from 'lucide-react';
import { getInitials } from '@/utils/userUtils';
import { formatDisplayDate, formatSimpleDate } from '@/utils/dateUtils';

// text
export const TextCell = ({ title }: { title: string | number }) => {
    const isEmpty = title === '' || title === '—' || title === '-';

    return (
        <div className="flex min-w-0 flex-col justify-center">
            <span
                className={`truncate text-sm leading-tight tracking-tight ${
                    isEmpty ? 'font-normal text-slate-300' : 'font-medium text-slate-800'
                }`}
            >
                {isEmpty ? '—' : title}
            </span>
        </div>
    );
};

// Date
export const DateCell = ({
    date,
    dateOnly = false,
}: {
    date: string | Date | null | undefined;
    dateOnly?: boolean;
}) => (
    <div className="inline-flex items-center gap-1.5 text-slate-500">
        <Calendar size={13} className="shrink-0 text-slate-400" />
        <span className="whitespace-nowrap text-xs font-medium tabular-nums tracking-tight text-slate-600">
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

    let classes = 'bg-slate-100 text-slate-500';
    let dot = 'bg-slate-400';

    if (isOffboarding) {
        classes = 'bg-rose-50 text-rose-700';
        dot = 'bg-rose-500';
    } else if (key === 'incomplete') {
        classes = 'bg-amber-50 text-amber-700';
        dot = 'bg-amber-500';
    } else if (key === 'ready') {
        classes = 'bg-sky-50 text-sky-700';
        dot = 'bg-sky-500';
    } else if (isPending) {
        classes = 'bg-amber-50 text-amber-700';
        dot = 'bg-amber-500';
    } else if (isApproved && !isInactive) {
        classes = 'bg-emerald-50 text-emerald-700';
        dot = 'bg-emerald-500';
    } else if (isInactive) {
        classes = 'bg-slate-100 text-slate-500';
        dot = 'bg-slate-400';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 ${classes}`}>
            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span className="text-[11px] font-medium capitalize tracking-wide">{normalized}</span>
        </div>
    );
};

// role badge
export const RoleBadge = ({ roleName }: { roleName?: string }) => {
    if (!roleName) {
        return (
            <span className="text-[11px] font-medium italic text-slate-300">
                Unassigned
            </span>
        );
    }

    return (
        <div className="inline-flex cursor-default items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70">
            {roleName}
        </div>
    );
};

// multiple tags
export const TagsCell = ({
    tags,
    emptyText = 'None assigned',
}: {
    tags: { id: number | string; name: string }[];
    emptyText?: string;
}) => {
    if (!tags || tags.length === 0) {
        return <span className="text-xs font-medium italic text-slate-300">{emptyText}</span>;
    }

    return (
        <div className="flex max-w-[400px] flex-wrap gap-1.5 py-0.5">
            {tags.map((tag) => (
                <span
                    key={tag.id}
                    className="inline-flex cursor-default items-center rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200/80 transition-colors hover:bg-slate-100"
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
        <div className="flex items-center gap-3 py-0.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-100/60 bg-blue-50 text-[11px] font-semibold tracking-tight text-blue-600">
                {getInitials(name)}
            </div>

            <div className="flex min-w-0 flex-col">
                <span className="mb-0.5 truncate text-sm font-medium leading-none text-slate-800">{name}</span>
                {email && (
                    <span className="truncate text-[11px] font-medium text-slate-400">{email}</span>
                )}
                {subtitle && (
                    <span className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{subtitle}</span>
                )}
            </div>
        </div>
    );
};
