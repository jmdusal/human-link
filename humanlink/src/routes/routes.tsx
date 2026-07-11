import { lazy } from 'react';
import { LayoutDashboard, Users, History, Shield, ShieldCheck, CalendarDays, Clock3, Wallet, UserRound } from 'lucide-react';

const Overview = lazy(() => import('@/pages/Overview'));
const ActivityLogIndex = lazy(() => import('@/pages/activity-logs/Index'));
const UserIndex = lazy(() => import('@/pages/users/Index'));
const RoleIndex = lazy(() => import('@/pages/roles/Index'));
const PermissionIndex = lazy(() => import('@/pages/permissions/Index'));
const WorkspaceIndex = lazy(() => import('@/pages/workspaces/Index'));

const LeavePolicyIndex = lazy(() => import('@/pages/leave-policies/Index'));
const LeaveBalanceIndex = lazy(() => import('@/pages/leave-balances/Index'));
const LeaveRequestIndex = lazy(() => import('@/pages/leave-requests/Index'));
const LeaveCalendarIndex = lazy(() => import('@/pages/leave-calendar/Index'));
const ScheduleIndex = lazy(() => import('@/pages/schedules/Index'));
const AttendanceIndex = lazy(() => import('@/pages/attendances/Index'));
const PayrollIndex = lazy(() => import('@/pages/payrolls/Index'));
const MyProfileIndex = lazy(() => import('@/pages/me/Index'));

const Workspace = lazy(() => import('@/pages/workspaces/Workspace'));
const AcceptInvitation = lazy(() => import('@/pages/workspaces/AcceptInvitation'));


export const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        title: 'Dashboard | Admin Panel',
        icon: <LayoutDashboard size={18}/>, 
        component: <Overview /> 
    },
    {
        path: '/my-profile',
        label: 'My Profile',
        title: 'My Profile',
        icon: <UserRound size={18}/>,
        component: <MyProfileIndex />,
        hideFromNav: true,
    },
    {
        path: '/attendances',
        label: 'Attendance',
        title: 'Attendance',
        category: 'Manage',
        icon: <Clock3 size={18}/>,
        component: <AttendanceIndex />,
        permission: 'attendances-view'
    },
    {
        path: '/payrolls',
        label: 'Payroll',
        title: 'Payroll',
        category: 'Manage',
        icon: <Wallet size={18}/>,
        component: <PayrollIndex />,
        permission: 'payrolls-view'
    },
    {
        path: '/users',
        label: 'Users',
        title: 'Users',
        category: 'Manage',
        icon: <Users size={18}/>,
        component: <UserIndex />,
        permission: 'users-view'
    },
    {
        path: '/workspaces',
        label: 'Workspaces',
        title: 'Workspaces',
        category: 'Manage',
        icon: <LayoutDashboard size={18}/>,
        component: <WorkspaceIndex />,
        permission: 'workspaces-view',
        // hidden: true
    },
    {
        path: '/schedules',
        label: 'Schedules',
        title: 'Schedules',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        component: <ScheduleIndex />,
        permission: 'schedules-view'
    },
    {
        path: '/leave-calendar',
        label: 'Leave Calendar',
        title: 'Leave Calendar',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        component: <LeaveCalendarIndex />,
        permission: 'leave-calendar-view',
        hideIfCan: 'leaves-view',
    },
    {
        path: '/leave-requests',
        label: 'Leave Request',
        title: 'Leave Requests',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        component: <LeaveRequestIndex />,
        permission: 'leave-requests-view',
        // Hide for admins who already see Requests under Leaves
        hideIfCan: 'leaves-view',
    },
    {
        label: 'Leaves',
        title: 'Leaves',
        category: 'Manage',
        icon: <CalendarDays size={18}/>,
        permission: 'leaves-view',
        children: [
            {
                path: '/leave-policies',
                label: 'Policies',
                title: 'Leave Policy',
                component: <LeavePolicyIndex />,
                permission: 'leave-policies-view'
            },
            {
                path: '/leave-balances',
                label: 'Balances',
                title: 'Leave Balance',
                component: <LeaveBalanceIndex />,
                permission: 'leave-balances-view'  
            },
            {
                path: '/leave-requests',
                label: 'Requests',
                title: 'Leave Requests',
                component: <LeaveRequestIndex />,
                permission: 'leave-requests-view'
            },
            {
                path: '/leave-calendar',
                label: 'Calendar',
                title: 'Leave Calendar',
                component: <LeaveCalendarIndex />,
                permission: 'leave-calendar-view'
            },
        ]
    },
    {
        path: '/roles',
        label: 'Roles',
        title: 'Role Management',
        category: 'Access',
        icon: <Shield size={18}/>,
        component: <RoleIndex />,
        permission: 'roles-view'
    },
    {
        path: '/permissions',
        label: 'Permissions',
        title: 'Permission Management',
        category: 'Access',
        icon: <ShieldCheck size={18}/>,
        component: <PermissionIndex />,
        permission: 'permissions-view'
    },
    {
        path: '/activity-logs',
        label: 'Activity Logs',
        title: 'Activity Logs',
        category: 'System',
        icon: <History size={18}/>,
        component: <ActivityLogIndex />,
        permission: 'activity-logs-view'
    },
    // hidden
    {
        path: '/workspaces/:slug',
        label: 'Activity aghahaha',
        title: 'Workspace Dashboard',
        component: <Workspace />,
        permission: 'workspaces-view',
        hidden: true
    },
    {
        path: '/invitations/accept/:token',
        label: 'Accept Invitation',
        title: 'Accept Invitation',
        component: <AcceptInvitation />,
        permission: 'workspaces-view',
        hidden: true
    },
];
