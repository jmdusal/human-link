import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import FormLabel from '@/components/FormLabel';

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
}

export default function Select({ label, helperText, options, value, onChange, placeholder = "Select option" }: SelectProps) {
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
                    w-full flex items-center justify-between px-3 py-2 bg-white border rounded-md text-sm 
                    transition-all duration-150 outline-none shadow-sm
                    ${isOpen 
                        ? 'border-blue-500 ring-1 ring-blue-500/20' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }
                `}
            >
                <span className={`truncate ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-1">
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
                                        w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-md transition-colors
                                        ${isSelected 
                                            ? 'bg-blue-50 text-blue-700 font-semibold' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }
                                    `}
                                >
                                    {option.label}
                                    {isSelected && <Check size={14} strokeWidth={2.5} className="text-blue-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}