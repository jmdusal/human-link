import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    // options: Option[];
    options: readonly Option[]; 
    value: string;
    onChange: (value: string) => void;
}

export default function Select({ label, options, value, onChange }: SelectProps) {
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
        <div className="space-y-2 text-left w-full relative" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    {label}
                </label>
            )}
            
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-[#f8fafc] border rounded-xl text-sm transition-all duration-200 outline-none
                    ${isOpen ? 'border-blue-400 bg-white ring-4 ring-blue-500/5' : 'border-slate-100 text-slate-600 hover:border-slate-200'}`}
            >
                <span className={selectedOption ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                    {selectedOption?.label || "Select an option"}
                </span>
                <ChevronDown 
                    size={16} 
                    className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1.5">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors
                                    ${value === option.value 
                                        ? 'bg-blue-50 text-blue-600 font-bold' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} strokeWidth={3} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}