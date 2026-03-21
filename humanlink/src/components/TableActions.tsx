import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';

interface ActionItem {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'danger';
    show?: boolean;
}

interface TableActionsProps {
    actions: ActionItem[];
}

export default function TableActions({ actions }: TableActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = 160;

            if (spaceBelow < menuHeight) {
                setDropdownPosition('top');
                setCoords({
                    top: rect.top - 4, // 4px gap
                    left: rect.right - 176, // 176px is w-44
                });
            } else {
                setDropdownPosition('bottom');
                setCoords({
                    top: rect.bottom + 4,
                    left: rect.right - 176,
                });
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            
            window.addEventListener('scroll', () => setIsOpen(false), true);
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', () => setIsOpen(false), true);
            };
        }
    }, [isOpen]);

    const visibleActions = actions.filter(action => action.show !== false);

    return (
        <div className="flex justify-end relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 rounded-md transition-all cursor-pointer border-none outline-none
                    ${isOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
                `}
            >
                <MoreHorizontal size={18} />
            </button>
            
            {isOpen && (
                <div 
                    className={`
                        fixed w-44 bg-white rounded-lg border border-slate-200 z-[9999] 
                        shadow-xl shadow-slate-200/60 overflow-hidden
                        animate-in fade-in zoom-in-95 duration-150
                        ${dropdownPosition === 'top' ? "-translate-y-full origin-bottom-right" : "origin-top-right"}
                    `}
                    style={{ 
                        top: coords.top, 
                        left: coords.left 
                    }}
                >
                    <div className="p-1 bg-white">
                        {visibleActions.map((action, index) => {
                            const isDanger = action.variant === 'danger';
                            return (
                                <React.Fragment key={action.label}>
                                    {isDanger && index !== 0 && (
                                        <div className="my-1 border-t border-slate-100" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            action.onClick();
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md 
                                            transition-colors border-none bg-transparent cursor-pointer text-left
                                            ${isDanger 
                                                ? 'text-red-600 hover:bg-red-50' 
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                        `}
                                    >
                                        <action.icon size={14} className={isDanger ? "text-red-500" : "text-slate-400"} />
                                        {action.label}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}