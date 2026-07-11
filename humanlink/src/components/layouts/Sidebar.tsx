import { useMemo } from 'react';
import { navItems } from '@/routes/routes';
import { useAuth } from '@/context/AuthContext';
import { NavItem } from '@/components/layouts/NavItem';
import { NavParent } from '@/components/layouts/NavParent';
import { motion, AnimatePresence } from 'framer-motion';

type NavEntry = (typeof navItems)[number] & {
    category?: string;
    children?: Array<{ path: string; label: string; permission?: string }>;
    permission?: string;
    hidden?: boolean;
    hideFromNav?: boolean;
    hideIfCan?: string;
};

const CATEGORY_ORDER = [
    'Overview',
    'Time & Work',
    'People',
    'Leave',
    'Pay',
    'Access',
    'System',
];

interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export default function Sidebar({
    isCollapsed = false,
}: SidebarProps) {
    const { can } = useAuth();

    const groupedItems = useMemo(() => {
        const allowed = (navItems as NavEntry[]).filter((item) => {
            const hasPermission = !item.permission || can(item.permission);
            const isNotHidden = !item.hidden && !item.hideFromNav;
            const notHiddenByCapability = !item.hideIfCan || !can(item.hideIfCan);

            return hasPermission && isNotHidden && notHiddenByCapability;
        });

        const groups = new Map<string, NavEntry[]>();

        for (const item of allowed) {
            const category = item.category ?? 'Overview';
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category)!.push(item);
        }

        return CATEGORY_ORDER
            .filter((category) => (groups.get(category)?.length ?? 0) > 0)
            .map((category) => ({
                category,
                items: groups.get(category)!,
            }));
    }, [can]);

    const showCategoryLabel = (category: string, index: number) => {
        if (isCollapsed) return false;
        if (category === 'Overview' && index === 0) return false;
        return true;
    };

    return (
        <aside className={`relative ${isCollapsed ? 'w-20' : 'w-64'} bg-[#F0F2F5] border-r border-slate-300/50 flex flex-col p-4 transition-all duration-300 ease-in-out h-screen sticky top-0`}>
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold shrink-0">
                    HL
                </div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold tracking-tight whitespace-nowrap"
                        >
                            HumanLink
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-4">
                {groupedItems.map(({ category, items }, groupIndex) => (
                    <div key={category} className="space-y-1">
                        {showCategoryLabel(category, groupIndex) && (
                            <p className="px-4 pt-1 pb-1 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                {category}
                            </p>
                        )}

                        {items.map((item) => {
                            if (item.children && item.children.length > 0) {
                                const visibleChildren = item.children.filter(
                                    (child) => !child.permission || can(child.permission)
                                );

                                if (visibleChildren.length === 0) {
                                    return null;
                                }

                                return (
                                    <NavParent
                                        key={item.label}
                                        icon={item.icon}
                                        label={item.label}
                                        isCollapsed={isCollapsed}
                                        items={visibleChildren}
                                        parentPath={(item as { path?: string }).path}
                                    >
                                        {visibleChildren.map((child) => {
                                            const fullPath = child.path?.startsWith('/')
                                                ? child.path
                                                : `${(item as { path?: string }).path}/${child.path}`.replace(/\/+/g, '/');
                                            return (
                                                <NavItem
                                                    key={fullPath}
                                                    to={fullPath}
                                                    label={child.label || 'Overview'}
                                                    isChild
                                                    isCollapsed={isCollapsed}
                                                />
                                            );
                                        })}
                                    </NavParent>
                                );
                            }

                            return (
                                <NavItem
                                    key={item.path}
                                    to={item.path!}
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                />
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
