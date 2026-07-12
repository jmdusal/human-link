import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');

    const updatePosition = () => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = 176;
        const menuHeight = menuRef.current?.offsetHeight || 160;
        const gap = 4;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < menuHeight + gap;

        setDropdownPosition(openUp ? 'top' : 'bottom');
        setCoords({
            top: openUp ? rect.top - gap : rect.bottom + gap,
            left: Math.max(8, rect.right - menuWidth),
        });
    };

    useEffect(() => {
        if (!isOpen) return;

        updatePosition();
        const frame = requestAnimationFrame(updatePosition);

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }
            setIsOpen(false);
        };

        const handleClose = () => setIsOpen(false);

        window.addEventListener('scroll', handleClose, true);
        window.addEventListener('resize', handleClose);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', handleClose, true);
            window.removeEventListener('resize', handleClose);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const visibleActions = actions.filter(action => action.show !== false);

    const menu = isOpen && createPortal(
        <div
            ref={menuRef}
            role="menu"
            className={`
                fixed z-[9999] w-44 overflow-hidden rounded-xl border border-slate-200 bg-white
                shadow-lg shadow-slate-200/50
                animate-in fade-in zoom-in-95 duration-150
                dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40
                ${dropdownPosition === 'top' ? '-translate-y-full origin-bottom-right' : 'origin-top-right'}
            `}
            style={{
                top: coords.top,
                left: coords.left,
            }}
        >
            <div className="bg-white p-1 dark:bg-slate-900">
                {visibleActions.map((action, index) => {
                    const isDanger = action.variant === 'danger';
                    return (
                        <React.Fragment key={action.label}>
                            {isDanger && index !== 0 && (
                                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            )}
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    action.onClick();
                                    setIsOpen(false);
                                }}
                                className={`
                                    flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none bg-transparent
                                    px-3 py-2 text-left text-xs font-medium transition-colors
                                    ${isDanger
                                        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'}
                                `}
                            >
                                <action.icon size={14} className={isDanger ? 'text-red-500' : 'text-slate-400'} />
                                {action.label}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>,
        document.body,
    );

    return (
        <div className="relative flex justify-end">
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer rounded-lg border-none p-1.5 outline-none transition-all
                    ${isOpen
                        ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'}
                `}
            >
                <MoreHorizontal size={16} />
            </button>
            {menu}
        </div>
    );
}
