import type { LucideIcon } from 'lucide-react';

export interface TabItem {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
    return (
        <nav
            className={`flex items-stretch gap-0 sm:gap-1 border-b border-slate-200 overflow-x-auto scrollbar-none -mx-1 px-1 ${className}`}
            role="tablist"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            relative flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-1.5 sm:gap-2
                            px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium whitespace-nowrap
                            border-b-2 -mb-px transition-colors outline-none min-w-0
                            ${isActive
                                ? 'border-blue-600 text-blue-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                            }
                        `}
                    >
                        {Icon ? (
                            <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                        ) : null}
                        <span className="truncate">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
