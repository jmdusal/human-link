import { useState } from 'react';
import { Settings, Globe, Lock } from 'lucide-react';
import { navItems } from '@/routes/routes';
import { useAuth } from '@/context/AuthContext';
import { NavItem } from '@/components/layouts/NavItem';
import { NavParent } from '@/components/layouts/NavParent';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
    const { can, loading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (loading) return null;

    const allowedItems = navItems.filter((item: any) => {
        const hasPermission = !item.permission || can(item.permission);
        const isNotHidden = !item.hidden && !item.hideFromNav;
        const notHiddenByCapability = !item.hideIfCan || !can(item.hideIfCan);

        return hasPermission && isNotHidden && notHiddenByCapability;
    });

    return (
        <aside className={`relative ${isCollapsed ? 'w-20' : 'w-64'} bg-[#F0F2F5] border-r border-slate-300/50 flex flex-col p-4 transition-all duration-300 ease-in-out h-screen sticky top-0`}>
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">HL</div>
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
            
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-1">
                {allowedItems.map((item: any) => {
                    if (item.children && item.children.length > 0) {
                        const visibleChildren = item.children.filter(
                            (child: any) => !child.permission || can(child.permission)
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
                                parentPath={item.path}
                            >
                                {visibleChildren.map((child: any) => {
                                    const fullPath = child.path?.startsWith('/') 
                                        ? child.path 
                                        : `${item.path}/${child.path}`.replace(/\/+/g, '/');
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
                            to={item.path} 
                            icon={item.icon} 
                            label={item.label} 
                            isCollapsed={isCollapsed} 
                        />
                    );
                })}

                <div className="pt-2">
                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Security</p>}
                    <NavParent icon={<Settings size={18}/>} label="Configuration" isCollapsed={isCollapsed} parentPath="" items={[{path: '/settings'}, {path: '/security'}]}>
                        <NavItem to="/settings" icon={<Globe size={14}/>} label="Global Settings" isChild isCollapsed={isCollapsed} />
                        <NavItem to="/security" icon={<Lock size={14}/>} label="Security Keys" isChild isCollapsed={isCollapsed} />
                    </NavParent>
                </div>
            </nav>
        </aside>
    );
}