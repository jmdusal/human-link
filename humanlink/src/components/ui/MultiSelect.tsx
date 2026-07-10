import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { X, Check, Search, ChevronDown, UserPlus } from 'lucide-react';
import { getInitials } from '@/utils/userUtils';

interface Option {
    value: number;
    label: string;
    email?: string;
}

interface MultiSelectProps {
    label?: string;
    options: Option[];
    selectedValues: any[];
    onChange: (items: any[]) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    id?: string;
    lockedIds?: number[];
    showRole?: boolean;
    showInitials?: boolean;
}

export default function MultiSelect({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = 'Add members...',
    error,
    helperText,
    id,
    lockedIds = [],
    showRole = false,
    showInitials = true,
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const generatedId = useId();
    const inputId = id || generatedId;

    const isLocked = (userId: number) => lockedIds.includes(userId);

    const filteredOptions = useMemo(() => {
        const query = search.toLowerCase();
        return options.filter((opt) =>
            opt.label.toLowerCase().includes(query) ||
            opt.email?.toLowerCase().includes(query)
        );
    }, [options, search]);

    const handleSelect = (option: Option) => {
        const exists = selectedValues.some((v) => (typeof v === 'object' ? v.id : v) === option.value);
        if (exists) {
            if (isLocked(option.value)) return;
            onChange(selectedValues.filter((v) => v.id !== option.value));
            return;
        }

        onChange([
            ...selectedValues,
            {
                id: option.value,
                name: option.label,
                email: option.email,
                pivot: { role: 'member' },
            },
        ]);
    };

    const toggleRole = (e: React.MouseEvent, userId: number) => {
        e.stopPropagation();
        if (isLocked(userId)) return;

        const updated = selectedValues.map((v) => {
            if (v.id === userId) {
                const currentRole = v.pivot?.role || 'member';
                const nextRole = currentRole === 'member' ? 'admin' : 'member';
                return { ...v, pivot: { ...v.pivot, role: nextRole } };
            }
            return v;
        });
        onChange(updated);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-3 text-left w-full relative" ref={containerRef}>
            {(label || helperText) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    {label && (
                        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800">
                            {label}
                        </label>
                    )}
                    {helperText && (
                        <span className="text-[12px] font-medium text-slate-400">
                            {helperText}
                        </span>
                    )}
                </div>
            )}

            <div
                id={inputId}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full min-h-[48px] flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/80 border rounded-xl text-sm
                    transition-all duration-150 outline-none cursor-pointer
                    ${isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/15 bg-white'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white'
                    }
                    ${error ? 'border-red-500 ring-red-50' : ''}
                `}
            >
                <div className="flex flex-wrap gap-2 items-center flex-1 min-w-0">
                    {selectedValues.length === 0 && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <UserPlus size={16} className="shrink-0" />
                            <span className="font-medium">{placeholder}</span>
                        </div>
                    )}

                    {selectedValues.map((val) => (
                        <div
                            key={val.id}
                            className={`flex items-center gap-2 pl-1.5 pr-1.5 py-1 rounded-lg border bg-white shadow-sm transition-all ${
                                isLocked(val.id)
                                    ? 'border-slate-200'
                                    : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {showInitials && (
                                <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 ${
                                        isLocked(val.id) ? 'bg-slate-800' : 'bg-blue-600'
                                    }`}
                                >
                                    {getInitials(val.name)}
                                </div>
                            )}

                            <span className="text-[12px] font-semibold text-slate-700 tracking-tight">
                                {val.name}
                            </span>

                            {showRole && (
                                <button
                                    type="button"
                                    disabled={isLocked(val.id)}
                                    onClick={(e) => toggleRole(e, val.id)}
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide transition-all border shrink-0 ${
                                        isLocked(val.id)
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : val.pivot?.role === 'admin'
                                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-700 hover:bg-white'
                                    }`}
                                >
                                    {isLocked(val.id) ? 'Owner' : (val.pivot?.role || 'member')}
                                </button>
                            )}

                            {!isLocked(val.id) && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(selectedValues.filter((v) => v.id !== val.id));
                                    }}
                                    className="p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label={`Remove ${val.name}`}
                                >
                                    <X size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {selectedValues.length > 0 && (
                        <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                            {selectedValues.length}
                        </span>
                    )}
                    <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-slate-100 bg-slate-50/80">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            autoFocus
                            className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-900 font-medium"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="p-1.5 max-h-64 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.some((v) => v.id === option.value);
                                const locked = isLocked(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        disabled={locked && isSelected}
                                        className={`
                                            w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors text-left
                                            ${isSelected
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }
                                            ${locked && isSelected ? 'opacity-80 cursor-default' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {showInitials && (
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold uppercase shrink-0 ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {getInitials(option.label)}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className={`text-sm truncate ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                                                    {option.label}
                                                </p>
                                                {option.email && (
                                                    <p className="text-[11px] text-slate-400 truncate font-medium">
                                                        {option.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check size={16} strokeWidth={2.5} className="text-blue-600 shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-8 text-center">
                                <p className="text-sm font-medium text-slate-500">No people found</p>
                                <p className="text-[12px] text-slate-400 mt-1">Try a different name or email</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}
