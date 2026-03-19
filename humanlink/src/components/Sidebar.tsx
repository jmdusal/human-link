import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronDown, Settings, Globe, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { navItems } from '@/routes/routes';
import { useAuth } from '@/context/AuthContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isChild?: boolean;
  isCollapsed?: boolean;
}

const NavItem = ({ icon, label, to, isChild = false, isCollapsed = false }: NavItemProps) => (
    <NavLink
        to={to}
        end={to === '/dashboard'}
        className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
        isChild && !isCollapsed ? 'ml-9 text-xs' : 'text-sm'
        } ${isCollapsed ? 'justify-center px-0 mx-2' : ''} ${
            isActive
            ? 'bg-white shadow-sm text-blue-600 font-bold'
            : 'text-black hover:bg-slate-200/50 hover:text-slate-800 font-bold'
            }`}
    >
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </NavLink>
    // <NavLink
    //     to={to}
    //     end={to === '/dashboard'}
    //     className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-xl cursor-pointer transition-all ${
    //     isChild ? 'ml-9 text-xs' : 'text-sm'
    //     } ${
    //         isActive
    //         ? 'bg-white shadow-sm text-blue-600 font-bold'
    //         : 'text-black hover:bg-slate-200/50 hover:text-slate-800 font-bold'
    //         // : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
    //         }`}
    // >
    //     {icon}
    //     <span>{label}</span>
    // </NavLink>
);

interface NavParentProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    isCollapsed: React.ReactNode;
}

const NavParent = ({ icon, label, children, isCollapsed  }: NavParentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [isCollapsed, setIsCollapsed] = useState(false);
    if (isCollapsed) return <div className="flex justify-center py-3 text-slate-400">{icon}</div>;
    return (
        <div className="space-y-1">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer text-slate-500 hover:bg-slate-200/50 transition-all group"
            >
                <div className="flex items-center gap-4">
                    {icon} <span className="text-sm font-medium group-hover:text-slate-800">{label}</span>
                </div>
                <ChevronDown
                size={16} 
                className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} 
                />
            </div>
        
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="pb-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function Sidebar() {
    const { can, loading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    if (loading) return null; 
    
    const allowedItems = navItems.filter((item: any) => !item.permission || can(item.permission));

    const groupedNav = allowedItems.reduce((acc: any, item: any) => {
        const category = item.category || 'Main';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    
    return (
        // <aside className="w-64 bg-[#F0F2F5] border-r border-slate-300/50 flex flex-col p-4 shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)] h-full">
        <aside className={`relative ${isCollapsed ? 'w-20' : 'w-64'} bg-[#F0F2F5] border-r border-slate-300/50 flex flex-col p-4 transition-all duration-300 ease-in-out h-screen sticky top-0`}>
            
            {/* <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-all z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button> */}
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-lg flex items-center justify-center text-white font-bold">H</div>
                <span className="text-xl font-bold tracking-tight">HumanLink</span>
            </div>
            
            {/* <nav className="flex-1 space-y-6"> */}
            {/* <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6"> */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar space-y-6">
                {Object.entries(groupedNav).map(([category, items]: [string, any]) => (
                    <div key={category} className="space-y-1">
                        {/* Only show header if it's not the 'Main' (top) section */}
                        {category !== 'Main' && (
                            <p className="px-4 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">
                                {category}
                            </p>
                        )}
                        
                        {items.map((item: any) => (
                            <NavItem 
                                key={item.path} 
                                to={item.path}
                                icon={item.icon}
                                label={item.label}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </div>
                ))}

                <div className="pt-2">
                    {!isCollapsed && <p className="px-4 text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Security</p>}
                    <NavParent icon={<Settings size={18}/>} label="Configuration" isCollapsed={isCollapsed}>
                        <NavItem to="/settings" icon={<Globe size={14}/>} label="Global Settings" isChild isCollapsed={isCollapsed} />
                        <NavItem to="/security" icon={<Lock size={14}/>} label="Security Keys" isChild isCollapsed={isCollapsed} />
                    </NavParent>
                </div>
            </nav>

                {/* <nav className="flex-1 space-y-1">
                    {navItems
                        .filter((item: any) => {
                            return !item.permission || can(item.permission);
                        })
                        .map((item: any) => (
                            <NavItem 
                                key={item.path} 
                                to={item.path} 
                                icon={item.icon} 
                                label={item.label} 
                            />
                        ))
                    }

                    <NavParent icon={<Settings size={18}/>} label="Configuration">
                        <NavItem to="/settings" icon={<Globe size={14}/>} label="Global Settings" isChild />
                        <NavItem to="/security" icon={<Lock size={14}/>} label="Security Keys" isChild />
                    </NavParent>
                </nav> */}
            <div className="mt-auto p-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm backdrop-blur-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">System</p>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600">
                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                Active v4.2
                </div>
            </div>
        </aside>
    );
};