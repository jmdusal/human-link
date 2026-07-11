import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { echo } from '@/lib/echo';
import { useAuth } from '@/context/AuthContext';
import { NotificationService, type AppNotification } from '@/services/NotificationService';
import { LeaveRequestService } from '@/services/LeaveRequestService';
import type { LeaveRequest } from '@/types/LeaveRequest';
import LeaveRequestReviewModal from '@/components/modals/leave-requests/LeaveRequestReviewModal';

export default function NotificationDropdown() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isLoadingLeave, setIsLoadingLeave] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleNewNotification = useCallback((notification: any) => {
        setNotifications((prev) => {
            const id = String(notification.id || notification.data?.id || Math.random().toString());
            if (prev.find((n) => n.id === id)) return prev;

            const displayTitle =
                notification.title ||
                notification.data?.title ||
                notification.message ||
                notification.data?.message ||
                'New Notification';

            const displayTime =
                notification.time ||
                notification.data?.time ||
                'Just now';

            return [
                {
                    id,
                    title: displayTitle,
                    message: notification.message || notification.data?.message || null,
                    time: displayTime,
                    read: false,
                    type: notification.type || notification.data?.type || null,
                    leaveRequestId:
                        notification.leaveRequestId
                        || notification.leave_request_id
                        || notification.data?.leave_request_id
                        || notification.data?.leaveRequestId
                        || null,
                    payslipId:
                        notification.payslipId
                        || notification.payslip_id
                        || notification.data?.payslip_id
                        || notification.data?.payslipId
                        || null,
                },
                ...prev,
            ];
        });
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await NotificationService.list();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        fetchNotifications();
    }, [user?.id, fetchNotifications]);

    useEffect(() => {
        if (!user?.id) return;

        const channelName = `App.Models.User.${user.id}`;
        const channel = echo.private(channelName);

        channel.notification((n: any) => {
            handleNewNotification(n);
        });

        channel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (data: any) => {
            handleNewNotification(data);
        });

        channel.listenToAll((event: any, data: any) => {
            if (
                typeof event === 'string' &&
                (event.includes('Notification') || event.includes('BroadcastNotificationCreated'))
            ) {
                handleNewNotification(data);
            }
        });

        return () => echo.leave(channelName);
    }, [user?.id, handleNewNotification]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleOpen = async () => {
        setIsOpen((prev) => !prev);
    };

    const openLeaveRequestModal = async (leaveRequestId: number) => {
        setIsOpen(false);
        setIsReviewOpen(true);
        setIsLoadingLeave(true);
        setSelectedLeaveRequest(null);

        try {
            const leaveRequest = await LeaveRequestService.getLeaveRequest(leaveRequestId);
            setSelectedLeaveRequest(leaveRequest);
        } catch (error) {
            console.error('Failed to load leave request:', error);
            setIsReviewOpen(false);
        } finally {
            setIsLoadingLeave(false);
        }
    };

    const isClickableNotification = (notification: AppNotification): boolean => {
        return !!notification.leaveRequestId
            || notification.type === 'leave_request_submitted'
            || notification.type === 'leave_request_status'
            || notification.type === 'leave_pending_reminder'
            || notification.type === 'payslip_ready'
            || notification.type === 'timer_forgotten'
            || !!notification.payslipId;
    };

    const handleNotificationClick = async (notification: AppNotification) => {
        if (!notification.read) {
            try {
                await NotificationService.markAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        const leaveRequestId = notification.leaveRequestId;
        const isLeaveNotification =
            notification.type === 'leave_request_submitted'
            || notification.type === 'leave_request_status'
            || notification.type === 'leave_pending_reminder'
            || !!leaveRequestId;

        if (isLeaveNotification && leaveRequestId) {
            await openLeaveRequestModal(Number(leaveRequestId));
            return;
        }

        if (notification.type === 'payslip_ready' || notification.payslipId) {
            setIsOpen(false);
            navigate('/my-profile');
            return;
        }

        if (notification.type === 'timer_forgotten') {
            setIsOpen(false);
            navigate('/attendances');
        }
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={handleOpen}
                    className={`relative p-2 rounded-xl shadow-sm border transition-all duration-200 
                    ${isOpen ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-500 hover:text-blue-600'}`}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[24px] shadow-xl overflow-hidden z-50"
                        >
                            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>

                            <div className="max-h-[350px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => {
                                        const isClickable = isClickableNotification(n);

                                        return (
                                            <button
                                                key={n.id}
                                                type="button"
                                                onClick={() => handleNotificationClick(n)}
                                                disabled={!isClickable}
                                                className={`w-full text-left p-4 border-b border-slate-50 transition-colors ${
                                                    isClickable ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {!n.read && <Circle className="fill-blue-500 text-blue-500 mt-1.5 shrink-0" size={8} />}
                                                    <div className={!n.read ? '' : 'pl-5'}>
                                                        <p className="text-sm font-medium text-slate-800 leading-tight">{n.title}</p>
                                                        {n.message && (
                                                            <p className="text-[11px] text-slate-500 mt-1 leading-snug">{n.message}</p>
                                                        )}
                                                        <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-10 text-center text-slate-400 text-sm">
                                        No notifications yet
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {isReviewOpen && (
                <LeaveRequestReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => {
                        setIsReviewOpen(false);
                        setSelectedLeaveRequest(null);
                    }}
                    leaveRequest={selectedLeaveRequest}
                    loading={isLoadingLeave}
                />
            )}
        </>
    );
}
