import { useMemo } from 'react';
import { navItems } from '@/routes/routes';
import { useAuth } from '@/context/AuthContext';
import { NavItem } from '@/components/layouts/NavItem';
import { NavParent } from '@/components/layouts/NavParent';
import { AnimatePresence, motion } from 'framer-motion';

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
    const { can, hasRole, user } = useAuth();
    const isHrNav = hasRole('super-admin') || user?.accessScope === 'company';

    const groupedItems = useMemo(() => {
        const allowed = (navItems as NavEntry[])
            .filter((item) => {
                const hasPermission = !item.permission || can(item.permission);
                const isNotHidden = !item.hidden && !item.hideFromNav;
                const notHiddenByCapability = !item.hideIfCan || !can(item.hideIfCan);
                // Company-wide reports belong in HR view only
                const isHrOnlyReport = item.path === '/reports' && !isHrNav;

                return hasPermission && isNotHidden && notHiddenByCapability && !isHrOnlyReport;
            })
            .map((item) => {
                if (!isHrNav && item.path === '/payrolls') {
                    return { ...item, label: 'My Payslips', title: 'My Payslips' };
                }
                if (!isHrNav && item.path === '/attendances') {
                    return { ...item, label: 'My Attendance', title: 'My Attendance' };
                }
                return item;
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
    }, [can, isHrNav]);

    const showCategoryLabel = (category: string, index: number) => {
        if (isCollapsed) return false;
        if (category === 'Overview' && index === 0) return false;
        return true;
    };

    return (
        <aside
            className={`sticky top-0 flex h-screen flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 ${
                isCollapsed ? 'w-[72px]' : 'w-60'
            }`}
        >
            <div className={`flex h-14 shrink-0 items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'justify-center px-2' : 'px-4'}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-bold tracking-tight text-white shadow-sm shadow-blue-600/20">
                    HL
                </div>
                <AnimatePresence initial={false}>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="truncate text-[15px] font-semibold tracking-tight text-slate-800 dark:text-slate-100"
                        >
                            HumanLink
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <nav className={`custom-scrollbar flex-1 space-y-5 overflow-x-hidden overflow-y-auto py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
                {groupedItems.map(({ category, items }, groupIndex) => (
                    <div key={category} className="space-y-0.5">
                        {showCategoryLabel(category, groupIndex) && (
                            <p className="px-3 pb-1.5 pt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
                                {category}
                            </p>
                        )}

                        {items.map((item) => {
                            if (item.children && item.children.length > 0) {
                                const visibleChildren = item.children.filter(
                                    (child) => !child.permission || can(child.permission),
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
