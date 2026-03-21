import { lazy } from 'react';
import { LayoutDashboard, Users, Database, History, Shield, ShieldCheck, CalendarDays, Clock } from 'lucide-react';

const Overview = lazy(() => import('@/pages/Overview'));
const Team = lazy(() => import('@/pages/Team'));
const Login = lazy(() => import('@/pages/authentication/Login'));

const ActivityLogIndex = lazy(() => import('@/pages/activity-logs/Index'));
const UserIndex = lazy(() => import('@/pages/users/Index'));
const LeavePolicyIndex = lazy(() => import('@/pages/leave-policies/Index'));
const ScheduleIndex = lazy(() => import('@/pages/schedules/Index'));

const RoleIndex = lazy(() => import('@/pages/roles/Index'));
const PermissionIndex = lazy(() => import('@/pages/permissions/Index'));

export const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        title: 'Dashboard | Admin Panel',
        icon: <LayoutDashboard size={18}/>, 
        component: <Overview /> 
    },
    {
        path: '/users',
        label: 'Users',
        title: 'User Management',
        category: 'Manage',
        icon: <Users size={18}/>,
        component: <UserIndex />,
        permission: 'user-view'
    },
    {
        path: '/schedules',
        label: 'Schedules',
        title: 'Schedules',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        component: <ScheduleIndex />,
        permission: 'schedule-view'
    },
    {
        path: '/projects',
        label: 'Projects',
        category: 'Manage',
        icon: <Database size={18}/>, 
        component: <div>Projects</div>
    },
    { 
        path: '/team',
        label: 'Team Members',
        category: 'Manage',
        icon: <Users size={18}/>, 
        component: <Team /> 
    },
    
    {
        path: '/leave-policies',
        label: 'Leave Policy',
        title: 'Leave Policy Management',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        component: <LeavePolicyIndex />,
        permission: 'leave-policy-view'
    },
    {
        path: '/testhahaha',
        label: 'Simple',
        category: 'Manage',
        icon: <Database size={18}/>, 
        component: <div>wsahgahahahaha</div>
    },
    {
        path: '/roles',
        label: 'Roles',
        title: 'Role Management',
        category: 'Access',
        icon: <Shield size={18}/>,
        component: <RoleIndex />,
        permission: 'role-view'
    },
    {
        path: '/permissions',
        label: 'Permissions',
        title: 'Permissiond Management',
        category: 'Access',
        icon: <ShieldCheck size={18}/>,
        component: <PermissionIndex />,
        permission: 'permission-view'
    },
    {
        path: '/activity-logs',
        label: 'Activity Logs',
        title: 'Activity Logs',
        category: 'System',
        icon: <History size={18}/>,
        component: <ActivityLogIndex />,
        permission: 'activity-log-view'
    },
    
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    // {
    //     path: '/testhahaha',
    //     label: 'test',
    //     category: 'System',
    //     icon: <Database size={18}/>, 
    //     component: <div>wsahgahahahaha</div>
    // },
    
    
    
    // { path: '/login', label: 'Login', icon: <Users size={18}/>, component: <Login /> },
];