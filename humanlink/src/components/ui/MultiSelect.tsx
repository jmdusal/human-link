import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { X, Check, Search, ChevronDown } from 'lucide-react'; // Added ChevronDown
import { getInitials } from '@/utils/userUtils';

interface Option { 
    value: number; 
    label: string; 
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selectedValues: any[]; 
    onChange: (items: any[]) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    id?: string;
    lockedIds?: number[];
    showRole?: boolean
}

export default function MultiSelect({ 
    label, 
    options, 
    selectedValues, 
    onChange, 
    placeholder = "Add members...", 
    error, 
    helperText, 
    id, 
    lockedIds = [],
    showRole = false
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    
    const generatedId = useId();
    const inputId = id || generatedId;

    const isLocked = (userId: number) => lockedIds.includes(userId);

    const filteredOptions = useMemo(() => {
        return options.filter(opt => 
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const handleSelect = (option: Option) => {
        const exists = selectedValues.some(v => v.id === option.value);
        if (exists) {
            if (isLocked(option.value)) return;
            onChange(selectedValues.filter(v => v.id !== option.value));
        } else {
            
            const newItem: any = { 
                id: option.value, 
                name: option.label,
            };
            
            if (showRole) {
                newItem.pivot = { role: 'member' };
            }
            
            onChange([...selectedValues, { 
                id: option.value, 
                name: option.label,
                pivot: { role: 'member' } 
            }]);
        }
    };

    const toggleRole = (e: React.MouseEvent, userId: number) => {
        e.stopPropagation();
        if (isLocked(userId)) return;

        const updated = selectedValues.map(v => {
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
        <div className="space-y-1.5 text-left w-full relative" ref={containerRef}>
            
            {/* LABEL SECTION - Matched to Select */}
            <div className="flex items-center justify-between">
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    {label}
                </label>
                {helperText && (
                    <span className="text-[11px] font-normal text-slate-400">
                        {helperText}
                    </span>
                )}
            </div>
            
            {/* MAIN INPUT AREA - Matched to Select */}
            <div 
                id={inputId}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full min-h-[38px] flex items-center justify-between px-3 py-1.5 bg-white border rounded-md text-sm 
                    transition-all duration-150 outline-none shadow-sm cursor-pointer
                    ${isOpen 
                        ? 'border-blue-500 ring-1 ring-blue-500/20' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }
                    ${error ? 'border-red-500 ring-red-50' : ''}
                `}
            >
                <div className="flex flex-wrap gap-1.5 items-center">
                    {selectedValues.length === 0 && (
                        <span className="text-slate-400 font-normal">{placeholder}</span>
                    )}
                    
                    {selectedValues.map(val => (
                        <div 
                            key={val.id} 
                            className={`flex items-center gap-1.5 pl-1 pr-1 py-0.5 rounded border transition-all duration-200 ${
                                isLocked(val.id) 
                                ? 'bg-slate-100 border-slate-200 text-slate-900' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase shrink-0 ${
                                isLocked(val.id) ? 'bg-slate-800' : 'bg-blue-500'
                            }`}>
                                {getInitials(val.name)}
                            </div>

                            <span className="text-[11px] font-semibold tracking-tight">{val.name}</span>
                            
                            {showRole && (
                                <button
                                    type="button"
                                    disabled={isLocked(val.id)}
                                    onClick={(e) => toggleRole(e, val.id)}
                                    className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tight transition-all border shrink-0 ${
                                        isLocked(val.id) 
                                            ? 'bg-slate-900 text-white border-slate-900' 
                                            : val.pivot?.role === 'admin'
                                                ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                                    }`}
                                >
                                    {isLocked(val.id) ? 'OWNER' : (val.pivot?.role || 'member')}
                                </button>
                            )}
                            
                            {!isLocked(val.id) && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onChange(selectedValues.filter(v => v.id !== val.id)); }}
                                    className="p-0.5 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <X size={10} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center px-3 py-2 border-b border-slate-50 bg-slate-50/50">
                        <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                        <input
                            autoFocus
                            className="w-full text-sm outline-none bg-transparent placeholder:text-slate-400 text-slate-900"
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="p-1 max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.some(v => v.id === option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-md transition-colors
                                            ${isSelected 
                                                ? 'bg-blue-50 text-blue-700 font-semibold' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold">
                                                {getInitials(option.label)}
                                            </div>
                                            {option.label}
                                        </div>
                                        {isSelected && <Check size={14} strokeWidth={2.5} className="text-blue-600" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-slate-400">
                                No members found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
