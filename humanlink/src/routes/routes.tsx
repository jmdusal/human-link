import { lazy } from 'react';
import {
    LayoutDashboard,
    Users,
    History,
    Shield,
    ShieldCheck,
    CalendarDays,
    Clock3,
    Wallet,
    UserRound,
    FileSpreadsheet,
    Folders,
    CalendarRange,
    ClipboardList,
    Umbrella,
} from 'lucide-react';

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
const ReportsIndex = lazy(() => import('@/pages/reports/Index'));
const MyProfileIndex = lazy(() => import('@/pages/me/Index'));

const Workspace = lazy(() => import('@/pages/workspaces/Workspace'));
const AcceptInvitation = lazy(() => import('@/pages/workspaces/AcceptInvitation'));

/**
 * Nav order is workflow-first so each persona reads cleanly after permission filtering:
 * - employee: Dashboard → Time & Work → Leave Request → Pay
 * - manager:  Dashboard → Time & Work → Leave Calendar/Request → Pay
 * - hr:       Dashboard → Time & Work → People → Leaves group → Pay
 * - super-admin: all of the above + Access + System
 */
export const navItems = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        title: 'Dashboard | Admin Panel',
        category: 'Overview',
        icon: <LayoutDashboard size={18} />,
        component: <Overview />,
    },
    {
        path: '/my-profile',
        label: 'My Profile',
        title: 'My Profile',
        icon: <UserRound size={18} />,
        component: <MyProfileIndex />,
        hideFromNav: true,
    },

    // --- Time & Work ---
    {
        path: '/attendances',
        label: 'Attendance',
        title: 'Attendance',
        category: 'Time & Work',
        icon: <Clock3 size={18} />,
        component: <AttendanceIndex />,
        permission: 'attendances-view',
    },
    {
        path: '/schedules',
        label: 'Schedules',
        title: 'Schedules',
        category: 'Time & Work',
        icon: <CalendarRange size={18} />,
        component: <ScheduleIndex />,
        permission: 'schedules-view',
    },
    {
        path: '/workspaces',
        label: 'Workspaces',
        title: 'Workspaces',
        category: 'Time & Work',
        icon: <Folders size={18} />,
        component: <WorkspaceIndex />,
        permission: 'workspaces-view',
    },

    // --- People ---
    {
        path: '/users',
        label: 'Users',
        title: 'Users',
        category: 'People',
        icon: <Users size={18} />,
        component: <UserIndex />,
        permission: 'users-view',
    },

    // --- Leave (flat items for employee/manager; hidden when Leaves group is available) ---
    {
        path: '/leave-requests',
        label: 'Request',
        title: 'Leave Requests',
        category: 'Leave',
        icon: <ClipboardList size={18} />,
        component: <LeaveRequestIndex />,
        permission: 'leave-requests-view',
        hideIfCan: 'leaves-view',
    },
    {
        path: '/leave-calendar',
        label: 'Calendar',
        title: 'Leave Calendar',
        category: 'Leave',
        icon: <CalendarDays size={18} />,
        component: <LeaveCalendarIndex />,
        permission: 'leave-calendar-view',
        hideIfCan: 'leaves-view',
    },
    {
        label: 'Leaves',
        title: 'Leaves',
        category: 'Leave',
        icon: <Umbrella size={18} />,
        permission: 'leaves-view',
        children: [
            {
                path: '/leave-requests',
                label: 'Requests',
                title: 'Leave Requests',
                component: <LeaveRequestIndex />,
                permission: 'leave-requests-view',
            },
            {
                path: '/leave-calendar',
                label: 'Calendar',
                title: 'Leave Calendar',
                component: <LeaveCalendarIndex />,
                permission: 'leave-calendar-view',
            },
            {
                path: '/leave-balances',
                label: 'Credits',
                title: 'Leave Credits',
                component: <LeaveBalanceIndex />,
                permission: 'leave-balances-view',
            },
            {
                path: '/leave-policies',
                label: 'Types',
                title: 'Leave Types',
                component: <LeavePolicyIndex />,
                permission: 'leave-policies-view',
            },
        ],
    },

    // --- Pay ---
    {
        path: '/payrolls',
        label: 'Payroll',
        title: 'Payroll',
        category: 'Pay',
        icon: <Wallet size={18} />,
        component: <PayrollIndex />,
        permission: 'payrolls-view',
    },
    {
        path: '/reports',
        label: 'Reports',
        title: 'Reports',
        category: 'Pay',
        icon: <FileSpreadsheet size={18} />,
        component: <ReportsIndex />,
        permission: 'reports-view',
    },

    // --- Access (super-admin) ---
    {
        path: '/roles',
        label: 'Roles',
        title: 'Role Management',
        category: 'Access',
        icon: <Shield size={18} />,
        component: <RoleIndex />,
        permission: 'roles-view',
    },
    {
        path: '/permissions',
        label: 'Permissions',
        title: 'Permission Management',
        category: 'Access',
        icon: <ShieldCheck size={18} />,
        component: <PermissionIndex />,
        permission: 'permissions-view',
    },

    // --- System (super-admin) ---
    {
        path: '/activity-logs',
        label: 'Activity Logs',
        title: 'Activity Logs',
        category: 'System',
        icon: <History size={18} />,
        component: <ActivityLogIndex />,
        permission: 'activity-logs-view',
    },

    // Hidden routes (linked from elsewhere)
    {
        path: '/workspaces/:slug',
        label: 'Workspace',
        title: 'Workspace Dashboard',
        component: <Workspace />,
        permission: 'workspaces-view',
        hidden: true,
    },
    {
        path: '/invitations/accept/:token',
        label: 'Accept Invitation',
        title: 'Accept Invitation',
        component: <AcceptInvitation />,
        permission: 'workspaces-view',
        hidden: true,
    },
];
