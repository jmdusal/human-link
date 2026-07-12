import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import FormLabel from '@/components/ui/FormLabel';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    helperText?: string;
    options: readonly Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Tailwind max-height class for the options list. Default: max-h-48 */
    menuMaxHeightClass?: string;
    /** Allow long option labels to wrap instead of truncating */
    wrapLabels?: boolean;
    /** Open menu above the trigger (useful in footers / near page bottom) */
    menuPlacement?: 'top' | 'bottom';
    /** Compact trigger for toolbars / table footers */
    size?: 'default' | 'sm';
}

export default function Select({
    label,
    helperText,
    options,
    value,
    onChange,
    placeholder = "Select option",
    menuMaxHeightClass = 'max-h-48',
    wrapLabels = false,
    menuPlacement = 'bottom',
    size = 'default',
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);
    const openUp = menuPlacement === 'top';

    return (
        <div className="space-y-1.5 text-left w-full relative" ref={containerRef}>

            {label && (
                <div className="flex items-center justify-between">
                    <FormLabel>{label}</FormLabel>
                    {helperText && (
                        <span className="text-[11px] font-normal text-slate-400">
                            {helperText}
                        </span>
                    )}
                </div>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between bg-white border rounded-md
                    transition-all duration-150 outline-none shadow-sm
                    dark:bg-slate-900
                    ${size === 'sm' ? 'gap-1.5 px-2.5 py-1.5 text-xs' : 'gap-3 px-3 py-2.5 text-sm'}
                    ${isOpen
                        ? 'border-blue-500 ring-1 ring-blue-500/20'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                    }
                `}
            >
                <span className={`text-left ${wrapLabels ? 'break-all' : 'truncate'} ${selectedOption ? 'text-slate-900 font-medium dark:text-slate-100' : 'text-slate-400'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    size={size === 'sm' ? 14 : 16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className={`
                        absolute z-[60] w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden
                        animate-in fade-in duration-200
                        dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/40
                        ${openUp
                            ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
                            : 'top-full mt-1.5 slide-in-from-top-1'
                        }
                    `}
                >
                    <div className={`p-1 overflow-y-auto custom-scrollbar ${menuMaxHeightClass}`}>
                        {options.map((option) => {
                            const isSelected = value === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-start justify-between gap-3 px-2.5 py-2.5 text-sm rounded-md transition-colors
                                        ${isSelected
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    <span className={`text-left ${wrapLabels ? 'break-all whitespace-normal' : 'truncate'}`}>
                                        {option.label}
                                    </span>
                                    {isSelected && <Check size={14} strokeWidth={2.5} className="text-blue-600 shrink-0 mt-0.5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}